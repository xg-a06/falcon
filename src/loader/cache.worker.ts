/* eslint-disable no-restricted-globals */
import registerPromiseWorker from 'promise-worker/register';
import { debounce } from '@src/helper/tools';
import getCacheInstance from '@src/cache';
import DB from '@src/helper/db';
import { Tasks } from './index';
// import { debounce } from '@src/helper/tools';

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
    priority?: number;
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
// const cache = {
//   queue: [] as Array<any>,
// };

// const doCache = debounce(async (target: any) => {
//   const { queue: data } = target;
//   cache.queue = [];
//   const db = await getCacheInstance();
//   await db.insert('dicom', data);
//   console.log('over');
// }, 16);

const loadData = async (seriesId: string): Promise<Array<any>> => {
  // 先查询数量
  const db = await getCacheInstance();
  const res = await db.queryByIndex('dicomInfo', 'seriesId', seriesId);
  const tasks = { ...tasksMap[seriesId] };
  // 如果有数据
  if (res.length > 0) {
    // 填充缓存信息
    const diffUrls: Array<string> = [];
    cacheManager[seriesId] = tasks.urls.map(url => {
      const tmp = res.find((r: any) => r.imageId === url);
      if (tmp) {
        return tmp.data;
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

  let process = callbackProcess[seriesId];
  if (process) {
    const ret = await process.pendingWork;
    return ret;
  }
  process = {};
  process.pendingWork = new Promise(resolve => {
    process.resolver = resolve;
  });
  process.callback = (callbackSeriesId: string, imageId: string, data: any) => {
    if (!cacheManager[callbackSeriesId]) {
      cacheManager[callbackSeriesId] = [];
    }
    const index = tasksMap[seriesId].urls.findIndex(url => url === imageId);
    cacheManager[seriesId][index] = data;
    if (tasksMap[seriesId].urls.length === cacheManager[seriesId].filter(i => i).length) {
      process.resolver();
      delete callbackProcess[seriesId];
    }
  };
  callbackProcess[seriesId] = process;
  port1.postMessage({ event: 'load', data: { seriesId, ...tasks } });

  return process.pendingWork;
};

registerPromiseWorker(async (message: IMessage): Promise<any> => {
  // console.log(message);
  const { event, data } = message;
  if (event === 'QUERY_SERIES') {
    const { seriesId } = data;
    if (!cacheManager[seriesId]) {
      await loadData(seriesId);
    }

    return cacheManager[seriesId];
  }
  if (event === 'ADD_TASK') {
    data.forEach((task: Tasks) => {
      const { studyId, seriesId, urls, priority } = task;
      if (!tasksMap[seriesId]) {
        tasksMap[seriesId] = {
          studyId,
          urls,
          priority,
        };
      }
    });
  }
  // queue.push(message);
  // if (!isWorking) {
  //   work();
  // }
  // return false;
});

const doCache = debounce(async () => {
  const { queue: cacheData } = cachePending;
  cachePending.queue = [];
  const db = await getCacheInstance();
  await db.insert('dicomInfo', cacheData);
  cacheData.forEach(({ seriesId, imageId, data }) => {
    callbackProcess[seriesId].callback(seriesId, imageId, data);
  });
}, 16);

const initEvent = (port: MessagePort): void => {
  port.onmessage = async message => {
    const { event, data } = message.data;
    if (event === 'LOADED') {
      cachePending.queue.push(...data);
      doCache();
    }
    // console.log('cache port', message);
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
