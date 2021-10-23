// import PromiseWorker from 'promise-worker';
// import LoaderWorker from 'worker-loader!./loader.worker';
import getCacheInstance from '@src/cache';
// import { ImageData } from '@src/loader/imageData';

// const worker = new Worker('');
// const promiseWorker = new PromiseWorker(worker);

interface Tasks {
  studyId: string;
  seriesId: string;
  urls: Array<string>;
}

interface Download {
  seriesId: string;
  url: string;
}

interface DataMap {
  [key: string]: {
    studyId: string;
    data: Map<string, boolean>;
  };
}

interface QueryObj {
  seriesId: string;
  index: number;
}

function instanceOfTask(object: any): object is Tasks {
  return 'urls' in object;
}

// interface LoaderOptions {}

class Loader {
  dataMap: DataMap = {};

  downloadQueue: Array<Download> = [];

  workders: Array<Worker> = [];

  // constructor(options: LoaderOptions) {}

  addTasks(tasks: Tasks): void;

  addTasks(tasks: Array<Tasks>): void;

  addTasks(tasks: any): void {
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

  async getCacheData<T>(query: QueryObj): Promise<Array<T> | undefined> {
    const { seriesId, index } = query;
    if (!this.dataMap[seriesId]) {
      return undefined;
    }
    const { downloadQueue } = this;
    const { data } = this.dataMap[seriesId];
    const url = [...data.keys()][index];
    if (!data.get(url)) {
      // 不在缓存里那就加入下载队列开始下载
      downloadQueue.push({ seriesId, url });
      // this.work();
      return undefined;
    }
    // 查询indexdb返回数据结果
    const instance = await getCacheInstance();
    const result = await instance.queryByIndex<T>('dicom', 'id', url);
    return result;
  }
}

export default Loader;
