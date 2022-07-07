/* eslint-disable class-methods-use-this */
import LoaderWorker from '../worker/loader.worker';

interface ResourceClientOptions {}

interface Tasks {
  studyId: string;
  seriesId: string;
  urls: Array<string>;
  types?: string;
  priority?: number;
}

interface CacheManager {
  [key: string]: Array<ImageData>;
}

const instanceOfTask = (object: any): object is Tasks => 'urls' in object;

class ResourceClient {
  options: ResourceClientOptions = {};

  downloadWorkder: Worker;

  // tasksMap: TasksMap = {};

  cacheManager: CacheManager = {};

  callbackProcess: Record<string, any> = {};

  constructor(options: ResourceClientOptions = {}) {
    this.options = { ...this.options, ...options };

    this.downloadWorkder = this.initDownloadWorker();
  }

  initDownloadWorker(): Worker {
    // const { callbackProcess } = this;
    const worker = new LoaderWorker();
    worker.addEventListener('message', e => {
      console.log(e);

      // const { event, data: cacheData } = e.data;
      // if (event === 'LOADED') {
      // cacheData.forEach((data: any) => {
      //   const { seriesId, imageId } = data;
      //   if (callbackProcess[imageId]) {
      //     callbackProcess[imageId].callback(seriesId, imageId, data);
      //   }
      //   if (callbackProcess[seriesId]) {
      //     callbackProcess[seriesId].callback(seriesId, imageId, data);
      //   }
      // });
      // }
    });
    return worker;
  }

  addTasks(cacheKey: string, tasks: Tasks): void;

  addTasks(cacheKey: string, tasks: Array<Tasks>): void;

  addTasks(cacheKey: string, tasks: unknown): void {
    // const { tasksMap } = this;
    let tmp: Array<Tasks> = [];
    if (instanceOfTask(tasks)) {
      tmp = [tasks];
    } else {
      tmp = tasks as Array<Tasks>;
    }
    // tmp.forEach((task: Tasks) => {
    //   const { studyId, seriesId, urls } = task;
    //   if (!tasksMap[seriesId]) {
    //     tasksMap[seriesId] = {
    //       studyId,
    //       urls,
    //     };
    //   }
    // });
  }

  loadData(cacheKey: string) {}

  loadIndex(cacheKey: string, cond: number) {}

  async getResourceData(cacheKey: string, cond?: number) {
    const { cacheManager } = this;

    if (cond !== undefined && !cacheManager[cacheKey]?.[cond]) {
      await this.loadIndex(cacheKey, cond);
      return cacheManager[cacheKey][cond];
    }
    if (!cacheManager[cacheKey]) {
      await this.loadData(cacheKey);
    }
    return cacheManager[cacheKey];
  }
}

export default ResourceClient;
