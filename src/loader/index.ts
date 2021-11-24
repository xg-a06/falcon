/* eslint-disable @typescript-eslint/no-empty-function */
import 'broadcastchannel-polyfill';
import { debounce } from '@src/helper/tools';

import LoaderWorker from '@src/loader/loader.worker';
import getCacheInstance from '@src/cache';
// import { ImageData } from '@src/loader/imageData';

// 目前新loader加载模式暂无优先级场景，先保留字段，后续有需要再加
export interface Tasks {
  studyId: string;
  seriesId: string;
  types?: string;
  urls: Array<string>;
  priority?: number;
}

interface TasksMap {
  [key: string]: {
    studyId: string;
    urls: Array<string>;
  };
}
interface CacheManager {
  [key: string]: Array<ImageData>;
}

interface CachePending {
  queue: Array<any>;
}
export interface QueryObj {
  seriesId: string;
  value: any;
}

function instanceOfTask(object: any): object is Tasks {
  return 'urls' in object;
}

interface LoaderOptions {
  downloadWorkerMaxCount?: number;
  cacheWorkerMaxCount?: number;
}

const defaultOptions: LoaderOptions = {
  downloadWorkerMaxCount: 1,
  cacheWorkerMaxCount: 1,
};

class Loader {
  options: LoaderOptions = defaultOptions;

  downloadWorkder: Worker;

  tasksMap: TasksMap = {};

  cacheManager: CacheManager = {};

  callbackProcess: Record<string, any> = {};

  cachePending: CachePending = {
    queue: [],
  };

  initState: Promise<any>;

  initResolver: (value: any) => void = () => {};

  doCache: () => void;

  constructor(options?: LoaderOptions) {
    this.options = { ...this.options, ...options };

    this.initState = new Promise(resolve => {
      this.initResolver = resolve;
    });
    this.cleanDB();

    this.downloadWorkder = this.initDownloadWorker();

    this.doCache = debounce(async () => {
      const { cachePending, callbackProcess } = this;
      let { queue: cacheData } = cachePending;
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
      cacheData = [];
    }, 16);
  }

  // 初始化下载线程
  initDownloadWorker(): Worker {
    const { cachePending } = this;
    const worker = new LoaderWorker();
    worker.addEventListener('message', e => {
      const { event, data } = e.data;
      if (event === 'LOADED') {
        cachePending.queue.push(...data);
        this.doCache();
      }
    });
    return worker;
  }

  addTasks(tasks: Tasks): void;

  addTasks(tasks: Array<Tasks>): void;

  addTasks(tasks: Tasks | Array<Tasks>): void {
    const { tasksMap } = this;
    let tmp: Array<Tasks> = [];
    if (instanceOfTask(tasks)) {
      tmp = [tasks];
    } else {
      tmp = tasks;
    }
    tmp.forEach((task: Tasks) => {
      const { studyId, seriesId, urls } = task;
      if (!tasksMap[seriesId]) {
        tasksMap[seriesId] = {
          studyId,
          urls,
        };
      }
    });
    // const { cacheWorker } = this;
    // cacheWorker.postMessage({ event: 'ADD_TASK', data: tmp });
  }

  createPromiseCallback(callbakcId: string, cbFn: any, data: any): Promise<any> {
    const { callbackProcess, downloadWorkder } = this;
    const process: any = {};
    process.pendingWork = new Promise(resolve => {
      process.resolver = resolve;
    });
    process.callback = cbFn;
    callbackProcess[callbakcId] = process;
    downloadWorkder.postMessage({ event: 'LOAD', data: { seriesId: callbakcId, ...data } });

    return process.pendingWork;
  }

  async loadData(seriesId: string): Promise<Array<ImageData>> {
    const { initState, tasksMap, cacheManager, callbackProcess } = this;

    await initState;
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

    const cbFn = (callbackSeriesId: string, imageId: string, data: any) => {
      if (!cacheManager[callbackSeriesId]) {
        cacheManager[callbackSeriesId] = [];
      }
      const index = tasksMap[seriesId].urls.findIndex(url => url === imageId);
      cacheManager[seriesId][index] = data;
      if (tasksMap[seriesId].urls.length === cacheManager[seriesId].filter(i => i).length) {
        callbackProcess[callbackSeriesId].resolver();
        delete callbackProcess[seriesId];
      }
    };

    const data = { ...tasks, priority: 2 };

    return this.createPromiseCallback(seriesId, cbFn, data);
  }

  async getCacheDataBySeriesId(seriesId: string): Promise<Array<ImageData>> {
    const { cacheManager } = this;
    if (!cacheManager[seriesId]) {
      await this.loadData(seriesId);
    }
    return cacheManager[seriesId];
  }

  async loadIndex(seriesId: string, value: number): Promise<any> {
    const { initState, tasksMap, cacheManager, callbackProcess } = this;
    await initState;
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
    return this.createPromiseCallback(seriesId, cbFn, data);
  }

  async getCacheDataByIndex(query: QueryObj): Promise<ImageData> {
    const { cacheManager } = this;
    const { seriesId, value } = query;
    if (!cacheManager[seriesId]?.[value]) {
      await this.loadIndex(seriesId, value);
    }
    return cacheManager[seriesId][value];
  }

  async clearDB(): Promise<void> {
    const instance = await getCacheInstance();
    instance.clear('dicomInfo');
    this.initResolver(undefined);
  }

  cleanDB(): void {
    const broadcast = new BroadcastChannel('Viewer_Loader');
    const timerId = setTimeout(() => {
      console.log('清理缓存');
      this.clearDB();
    }, 30);
    const start = performance.now();
    broadcast.onmessage = e => {
      const { data } = e;
      if (data === 'ping') {
        broadcast.postMessage('pong');
      } else if (data === 'pong') {
        const end = performance.now();
        console.log('有客户端存活', end - start);
        clearTimeout(timerId);
        this.initResolver(undefined);
      }
    };
    broadcast.postMessage('ping');
  }
}

export default Loader;
