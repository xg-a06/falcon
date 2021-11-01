import 'broadcastchannel-polyfill';
import LoaderWorker from '@src/loader/loader.worker';
import CacheWorker from '@src/loader/cache.worker';
import getCacheInstance from '@src/cache';
// import { ImageData } from '@src/loader/imageData';

export interface Tasks {
  studyId: string;
  seriesId: string;
  urls: Array<string>;
}
interface DataMap {
  [key: string]: {
    studyId: string;
    data: Map<string, boolean>;
  };
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

interface LoaderOptions {
  downloadWorkerMaxCount?: number;
  cacheWorkerMaxCount?: number;
}

const defaultOptions: LoaderOptions = {
  downloadWorkerMaxCount: 1,
  cacheWorkerMaxCount: 1,
};
class Loader {
  dataMap: DataMap = {};

  downloadWorkder: Worker;

  cacheWorker: Worker;

  options: LoaderOptions = defaultOptions;

  channel: MessageChannel;

  cacheGroup: CacheGroup = {};

  constructor(options?: LoaderOptions) {
    this.options = { ...this.options, ...options };

    this.channel = new MessageChannel();
    this.downloadWorkder = this.initDownloadWorker();
    this.cacheWorker = this.initCacheWorker();

    this.cleanCache();
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
    tmp.forEach(task => {
      const { studyId, seriesId, urls } = task;
      if (!this.dataMap[seriesId]) {
        const data = new Map<string, boolean>();
        urls.forEach(url => {
          data.set(url, false);
        });
        this.dataMap[seriesId] = {
          studyId,
          data,
        };
      }
    });
    return undefined;
  }

  async clearCache(): Promise<void> {
    const instance = await getCacheInstance();
    instance.clear('dicom');
  }

  // async getCacheDataBySeriesId<T>(query: QueryObj): Promise<Array<T> | undefined> {
  //   const { seriesId, value } = query;
  //   if (!this.dataMap[seriesId]) {
  //     return undefined;
  //   }
  //   const cacheResult = this.cacheGroup[seriesId];
  //   if (cacheResult) {
  //     return cacheResult;
  //   }
  //   const {data}=this.dataMap[seriesId];
  //   const instance = await getCacheInstance();
  //   const result = await instance.queryByIndex<T>('dicom', seriesId, value);
  //   if (result&&data.size===result.length) {
  //     this.cacheGroup[seriesId] = result;
  //     return result;
  //   }
  // }

  async getCacheData<T>(query: QueryObj): Promise<T | undefined> {
    const { seriesId, value } = query;
    if (!this.dataMap[seriesId]) {
      return undefined;
    }
    const { downloadWorkder } = this;
    const { data, studyId } = this.dataMap[seriesId];
    const url = [...data.keys()][value];
    // const instance = await getCacheInstance();
    // const result = await instance.queryByKeyPath<T>('dicom', url);
    // if (result) {
    //   return result;
    // }
    downloadWorkder.postMessage({ studyId, seriesId, url });
    return undefined;
  }

  // 初始化下载线程
  initDownloadWorker(): Worker {
    const { channel } = this;
    const worker = new LoaderWorker();
    worker.postMessage('init', [channel.port1]);
    // worker.onmessage = e => {};
    return worker;
  }

  // 初始化缓存线程
  initCacheWorker(): Worker {
    const { channel } = this;
    const worker = new CacheWorker();
    worker.postMessage('init', [channel.port2]);
    return worker;
  }

  cleanCache(): void {
    const broadcast = new BroadcastChannel('Viewer_Loader');
    const timerId = setTimeout(() => {
      console.log('清理缓存');
      this.clearCache();
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
