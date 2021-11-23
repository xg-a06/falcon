import 'broadcastchannel-polyfill';
import PromiseWorker from 'promise-worker';
import LoaderWorker from '@src/loader/loader.worker';
import CacheWorker from '@src/loader/cache.worker';
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

interface CacheGroup {
  [key: string]: Array<any>;
}
export interface QueryObj {
  seriesId: string;
  value: any;
}

function instanceOfTask(object: any): object is Tasks {
  return 'urls' in object;
}

interface IWorker extends PromiseWorker {
  _worker: Worker;
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

  cacheWorker: IWorker;

  downloadWorkder: Worker;

  channel: MessageChannel;

  cacheGroup: CacheGroup = {};

  instance: any;

  constructor(options?: LoaderOptions) {
    this.options = { ...this.options, ...options };

    this.channel = new MessageChannel();
    this.downloadWorkder = this.initDownloadWorker();
    this.cacheWorker = this.initCacheWorker();
    this.cleanDB();
  }

  // 初始化缓存线程
  initCacheWorker(): IWorker {
    const { channel } = this;
    const worker = new CacheWorker();
    const promiseWorker = new PromiseWorker(worker) as IWorker;
    promiseWorker._worker.postMessage('init', [channel.port1]);
    return promiseWorker;
  }

  // 初始化下载线程
  initDownloadWorker(): Worker {
    const { channel } = this;
    const worker = new LoaderWorker();
    worker.postMessage('init', [channel.port2]);
    return worker;
  }

  addTasks(tasks: Tasks): void;

  addTasks(tasks: Array<Tasks>): void;

  addTasks(tasks: Tasks | Array<Tasks>): void {
    let tmp: Array<Tasks> = [];
    if (instanceOfTask(tasks)) {
      tmp = [tasks];
    } else {
      tmp = tasks;
    }
    const { cacheWorker } = this;
    cacheWorker.postMessage({ event: 'ADD_TASK', data: tmp });
  }

  async clearDB(): Promise<void> {
    const instance = await getCacheInstance();
    instance.clear('dicomInfo');
  }

  async getCacheDataBySeriesId<T>(seriesId: string): Promise<undefined> {
    const { cacheWorker } = this;
    const cacheData = await cacheWorker.postMessage({ event: 'QUERY_SERIES', data: { seriesId } });
    return cacheData;
  }

  async getCacheDataByIndex<T>(query: QueryObj): Promise<T | undefined> {
    const { cacheWorker } = this;
    const cacheData = await cacheWorker.postMessage({ event: 'QUERY_SERIES_INDEX', data: query });
    return cacheData;
  }

  clearCache(seriesIds: Array<string>[]): void {
    const { cacheWorker } = this;
    cacheWorker.postMessage({ event: 'CLEAR_CACHE', data: seriesIds });
  }

  cleanDB(): void {
    const broadcast = new BroadcastChannel('Viewer_Loader');
    const timerId = setTimeout(() => {
      console.log('清理缓存');
      this.clearDB();
    }, 30);
    broadcast.onmessage = e => {
      const { data } = e;
      if (data === 'ping') {
        broadcast.postMessage('pong');
      } else if (data === 'pong') {
        console.log('有客户端存活');
        clearTimeout(timerId);
      }
    };
    broadcast.postMessage('ping');
  }
}

export default Loader;
