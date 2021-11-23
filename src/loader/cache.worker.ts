/* eslint-disable no-restricted-globals */
import registerPromiseWorker from 'promise-worker/register';
import { debounce } from '@src/helper/tools';
import getCacheInstance from '@src/cache';
import { Tasks } from './index';

interface IMessage {
  event: string;
  data: any;
}
interface CacheManager {
  [key: string]: Array<any>;
}
interface TasksMap {
  [key: string]: {
    studyId: string;
    urls: Array<string>;
  };
}

let port1: MessagePort;
const cacheManager: CacheManager = {};
const tasksMap: TasksMap = {};
const ctx: Worker = self as any;
const callbackProcess: Record<string, any> = {};
const cachePending = {
  queue: [] as Array<any>,
};

const createPromiseCallback = (callbakcId: string, cbFn: any, data: any): Promise<any> => {
  const process: any = {};
  process.pendingWork = new Promise(resolve => {
    process.resolver = resolve;
  });
  process.callback = cbFn;
  callbackProcess[callbakcId] = process;
  port1.postMessage({ event: 'LOAD', data: { seriesId: callbakcId, ...data } });

  return process.pendingWork;
};

const loadData = async (seriesId: string): Promise<Array<any>> => {
  // 先查询数量
  const db = await getCacheInstance();
  const res = await db.queryByIndex<any>('dicomInfo', 'seriesId', seriesId);
  const tasks = { ...tasksMap[seriesId] };
  // 如果有数据
  if (res.length > 0) {
    // 填充缓存信息
    const diffUrls: Array<string> = [];
    cacheManager[seriesId] = tasks.urls.map(url => {
      const tmp = res.find((r: any) => r.imageId === url);
      if (tmp) {
        return tmp;
      }
      diffUrls.push(url);
      return undefined;
    });
    // 如果是全量数据
    if (tasks.urls.length === res.length) {
      console.log('有全量缓存');
      return cacheManager[seriesId];
    }
    console.log('有差异化数据');
    tasks.urls = diffUrls;
  }

  const process = callbackProcess[seriesId];
  if (process) {
    const ret = await process.pendingWork;
    return ret;
  }

  const cache: Array<any> = [];

  const cbFn = (callbackSeriesId: string, imageId: string, data: any) => {
    if (!cacheManager[callbackSeriesId]) {
      cacheManager[callbackSeriesId] = [];
    }
    const index = tasksMap[seriesId].urls.findIndex(url => url === imageId);
    cache[index] = data;
    if (tasksMap[seriesId].urls.length === cache.filter(i => i).length) {
      callbackProcess[callbackSeriesId].resolver(cache);
      delete callbackProcess[seriesId];
    }
  };

  const data = { ...tasks, priority: 2 };

  return createPromiseCallback(seriesId, cbFn, data);
};

const loadIndex = async (seriesId: string, value: number): Promise<any> => {
  // 先查询数量
  const cond = tasksMap[seriesId].urls[value];
  const db = await getCacheInstance();
  const res = await db.queryByKeyPath<any>('dicomInfo', cond);
  if (res) {
    console.log('有索引缓存');
    if (!cacheManager[seriesId]) {
      cacheManager[seriesId] = [];
    }
    cacheManager[seriesId][value] = res;
    return cacheManager[seriesId][value];
  }

  const tasks = { ...tasksMap[seriesId] };
  tasks.urls = [cond];
  const process = callbackProcess[cond];
  if (process) {
    const ret = await process.pendingWork;
    return ret;
  }

  const cbFn = (callbackSeriesId: string, imageId: string, data: any) => {
    if (!cacheManager[callbackSeriesId]) {
      cacheManager[callbackSeriesId] = [];
    }
    const index = tasksMap[seriesId].urls.findIndex(url => url === imageId);
    cacheManager[seriesId][index] = data;
    callbackProcess[callbackSeriesId].resolver();
    delete callbackProcess[imageId];
  };

  const data = { ...tasks, priority: 0 };
  return createPromiseCallback(seriesId, cbFn, data);
};

registerPromiseWorker(async (message: IMessage): Promise<any> => {
  // console.log(message);
  const { event, data } = message;
  if (event === 'QUERY_SERIES') {
    const { seriesId } = data;
    const ret = await loadData(seriesId);
    return ret;
  }
  if (event === 'QUERY_SERIES_INDEX') {
    const { seriesId, value } = data;
    if (!cacheManager[seriesId]?.[value]) {
      await loadIndex(seriesId, value);
    }
    console.log('query result');

    return cacheManager[seriesId][value];
  }
  if (event === 'ADD_TASK') {
    data.forEach((task: Tasks) => {
      const { studyId, seriesId, urls } = task;
      if (!tasksMap[seriesId]) {
        tasksMap[seriesId] = {
          studyId,
          urls,
        };
      }
    });
  }
  return undefined;
});

const doCache = debounce(async () => {
  const { queue: cacheData } = cachePending;
  cachePending.queue = [];
  const db = await getCacheInstance();
  await db.insert('dicomInfo', cacheData);
  cacheData.forEach(data => {
    const { seriesId, imageId } = data;
    if (callbackProcess[imageId]) {
      callbackProcess[imageId].callback(seriesId, imageId, data);
    }
    if (callbackProcess[seriesId]) {
      callbackProcess[seriesId].callback(seriesId, imageId, data);
    }
  });
}, 100);

const initEvent = (port: MessagePort): void => {
  port.onmessage = async message => {
    const { event, data } = message.data;
    if (event === 'LOADED') {
      cachePending.queue.push(...data);
      doCache();
    }
  };
};
ctx.addEventListener('message', async e => {
  if (e.data === 'init') {
    [port1] = e.ports;
    initEvent(port1);
  }
});

// 简单处理worker引入问题
class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

export default WebpackWorker;
