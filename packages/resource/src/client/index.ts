import { ImageData } from './imageData';
import LoaderWorker from './loader.worker';

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

export interface QueryObj {
  seriesId: string;
  value: any;
}

function instanceOfTask(object: any): object is Tasks {
  return 'urls' in object;
}

type PromiseCallbackFn = (callbackSeriesId: string, imageId: string, data: any) => void;

class Loader {
  options: any = {};

  downloadWorkder: Worker;

  tasksMap: TasksMap = {};

  cacheManager: CacheManager = {};

  callbackProcess: Record<string, any> = {};

  constructor(options: any = {}) {
    this.options = { ...this.options, ...options };
    this.downloadWorkder = this.initDownloadWorker();
  }

  // 初始化下载线程
  initDownloadWorker(): Worker {
    const { callbackProcess } = this;
    const worker = new LoaderWorker();
    worker.addEventListener('message', e => {
      const { event, data: cacheData } = e.data;
      if (event === 'LOADED') {
        cacheData.forEach((data: any) => {
          const { seriesId, imageId } = data;
          if (callbackProcess[imageId]) {
            callbackProcess[imageId].callback(seriesId, imageId, data);
          }
          if (callbackProcess[seriesId]) {
            callbackProcess[seriesId].callback(seriesId, imageId, data);
          }
        });
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
  }

  createPromiseCallback(callbakcId: string, cbFn: PromiseCallbackFn, data: any): Promise<any> {
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
    const { tasksMap, cacheManager, callbackProcess } = this;

    const tasks = { ...tasksMap[seriesId] };

    const process = callbackProcess[seriesId];
    if (process) {
      const ret = await process.pendingWork;
      return ret;
    }

    const cbFn = (callbackSeriesId: string, imageId: string, data: any) => {
      if (!tasksMap[seriesId]) {
        callbackProcess[seriesId].resolver();
        delete callbackProcess[seriesId];
        return;
      }
      if (!cacheManager[seriesId]) {
        cacheManager[seriesId] = [];
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
    const { tasksMap, cacheManager, callbackProcess } = this;
    const cond = tasksMap[seriesId].urls[value];

    const process = callbackProcess[cond];
    if (process) {
      // const ret = await process.pendingWork;
      return process.pendingWork;
    }

    const tasks = { ...tasksMap[seriesId] };
    tasks.urls = [cond];

    const cbFn = (callbackSeriesId: string, imageId: string, data: any) => {
      if (!tasksMap[seriesId]) {
        callbackProcess[imageId].resolver();
        delete callbackProcess[imageId];
        return;
      }
      if (!cacheManager[seriesId]) {
        cacheManager[seriesId] = [];
      }
      const index = tasksMap[seriesId].urls.findIndex(url => url === imageId);
      cacheManager[seriesId][index] = data;
      callbackProcess[callbackSeriesId].resolver();
      delete callbackProcess[imageId];
    };

    const data = { ...tasks, priority: 0 };
    return this.createPromiseCallback(cond, cbFn, data);
  }

  async getCacheDataByIndex(query: QueryObj): Promise<ImageData> {
    const { cacheManager } = this;
    const { seriesId, value } = query;
    if (!cacheManager[seriesId]?.[value]) {
      await this.loadIndex(seriesId, value);
    }

    return cacheManager[seriesId][value];
  }

  clear(seriesId: string): void {
    const { downloadWorkder, callbackProcess, cacheManager, tasksMap } = this;
    downloadWorkder.postMessage({ event: 'ABORT', data: { seriesId } });
    delete callbackProcess[seriesId];
    delete cacheManager[seriesId];
    delete tasksMap[seriesId];
  }
}

let loader: Loader | null = null;

const getLoader = (): Loader => {
  if (loader === null) {
    loader = new Loader();
  }
  return loader;
};

export default getLoader;
