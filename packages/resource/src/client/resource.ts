/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable class-methods-use-this */
// import workerSource from '../worker/loader.worker';

interface ResourceClientOptions {}

export interface Tasks {
  studyId: string;
  seriesId: string;
  urls: Array<string>;
  type?: string;
  priority?: number;
}

interface TasksMap {
  [key: string]: {
    studyId: string;
    seriesId: string;
    urls: Array<string>;
    type: string;
    priority: number;
  };
}

interface CacheManager {
  [key: string]: Array<ImageData>;
}

const RESOURCE_TYPES = {
  DICOM: 'dicom',
  JPEG: 'jpeg',
  VTP: 'vtp',
};

const PRIORITY_TYPES = {
  HIGH: 0,
  NORMAL: 1,
  LOW: 2,
};

class ResourceClient {
  options: ResourceClientOptions = {};

  downloadWorkder: Worker;

  tasksMap: TasksMap = {};

  cacheManager: CacheManager = {};

  callbackProcess: Record<string, Promise<any>> = {};

  constructor(options: ResourceClientOptions = {}) {
    this.options = { ...this.options, ...options };

    this.downloadWorkder = this.initDownloadWorker();
  }

  initDownloadWorker(): Worker {
    const { callbackProcess } = this;
    const worker = new Worker(new URL('../worker/loader.worker', import.meta.url));
    worker.addEventListener('message', e => {
      // console.log('112312313', e);
    });

    return worker;
  }

  addTasks(cacheKey: string, tasks: Tasks): void {
    const { tasksMap } = this;
    const { studyId, seriesId, urls, type = RESOURCE_TYPES.DICOM, priority = PRIORITY_TYPES.LOW } = tasks;
    tasksMap[cacheKey] = {
      seriesId,
      studyId,
      urls,
      type,
      priority,
    };
    this.loadData(cacheKey);
  }

  loadData(cacheKey: string) {
    const { tasksMap, downloadWorkder } = this;
    const tasks = tasksMap[cacheKey];

    downloadWorkder.postMessage({ event: 'LOAD', data: { cacheKey, tasks } });
  }

  // loadIndex(cacheKey: string, cond: number) {}

  async getResourceData(cacheKey: string, cond?: number) {
    const { cacheManager } = this;

    if (cond !== undefined && !cacheManager[cacheKey]?.[cond]) {
      // await this.loadIndex(cacheKey, cond);
      return cacheManager[cacheKey][cond];
    }
    if (!cacheManager[cacheKey]) {
      await this.loadData(cacheKey);
    }
    return cacheManager[cacheKey];
  }
}

export default ResourceClient;
