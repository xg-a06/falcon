import PromiseWorker from 'promise-worker';
import LoaderWorker from '@src/loader/loader.worker';
import CacheWorker from '@src/loader/cache.worker';
import getCacheInstance from '@src/cache';
// import { ImageData } from '@src/loader/imageData';

export interface Tasks {
  studyId: string;
  seriesId: string;
  urls: Array<string>;
}

interface Download {
  studyId: string;
  seriesId: string;
  url: string;
}

interface DataMap {
  [key: string]: {
    studyId: string;
    data: Map<string, boolean>;
  };
}

export interface QueryObj {
  seriesId: string;
  index: number;
}

function instanceOfTask(object: any): object is Tasks {
  return 'urls' in object;
}

interface IWorker extends PromiseWorker {
  isWorking: boolean;
}

interface LoaderOptions {
  workerMaxCount: number;
}

const defaultOptions: LoaderOptions = {
  workerMaxCount: navigator.hardwareConcurrency,
};
class Loader {
  dataMap: DataMap = {};

  downloadQueue: Array<Download> = [];

  workders: Array<IWorker> = [];

  cacheWorker: PromiseWorker;

  options: LoaderOptions = defaultOptions;

  constructor(options?: LoaderOptions) {
    this.options = { ...this.options, ...options };

    this.cacheWorker = new PromiseWorker(new CacheWorker());
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
        this.dataMap[seriesId] = {
          studyId,
          data: new Map<string, boolean>(),
        };
      }

      const { data } = this.dataMap[seriesId];
      urls.forEach(url => {
        if (!data.has(url)) {
          data.set(url, false);
        }
      });
    });
    return undefined;
  }

  async clearCache(): Promise<void> {
    const instance = await getCacheInstance();
    instance.clear('dicom');
  }

  async getCacheData<T>(query: QueryObj): Promise<T | undefined> {
    const { seriesId, index } = query;
    if (!this.dataMap[seriesId]) {
      return undefined;
    }
    const { downloadQueue } = this;
    const { data, studyId } = this.dataMap[seriesId];
    const url = [...data.keys()][index];
    // 查询indexdb返回数据结果
    const instance = await getCacheInstance();
    const result = await instance.queryByKeyPath<T>('dicom', url);

    if (result) {
      return result;
    }
    // 不在缓存里那就加入下载队列开始下载
    downloadQueue.push({ studyId, seriesId, url });
    this.work();
    return undefined;
  }

  initWorker(): void {
    const worker = new LoaderWorker();
    const promiseWorker = new PromiseWorker(worker) as IWorker;
    promiseWorker.isWorking = false;
    this.workders.push(promiseWorker);
  }

  async doWork(worker: IWorker): Promise<void> {
    const { downloadQueue } = this;
    if (downloadQueue.length === 0) {
      return;
    }
    const download = downloadQueue.shift()!;

    const { seriesId, url } = download;
    worker.isWorking = true;
    const res = await worker.postMessage(download);
    if (!this.dataMap[seriesId]) {
      return;
    }
    const { studyId, data } = this.dataMap[seriesId];
    data.set(url, true);
    this.cacheWorker.postMessage({ studyId, seriesId, url, data: res });
    worker.isWorking = false;
    this.work();
  }

  work(): void {
    const { options, workders } = this;
    if (workders.length < options.workerMaxCount && workders.every(w => w.isWorking)) {
      this.initWorker();
    }
    this.workders.forEach(worker => {
      if (!worker.isWorking) {
        this.doWork(worker);
      }
    });
  }
}

export default Loader;
