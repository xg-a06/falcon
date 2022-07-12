/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { EventEmitter } from '@falcon/utils';
import { ImageData } from '../typing';

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

export const RESOURCE_TYPES = {
  DICOM: 'dicom',
  JPEG: 'jpeg',
  VTP: 'vtp',
};

export const PRIORITY_TYPES = {
  HIGH: 0,
  NORMAL: 1,
  LOW: 2,
};

export const RESOURCE_EVENTS = {
  LOADED: 'RESOURCE_LOADED',
};

class ResourceClient extends EventEmitter {
  options: ResourceClientOptions = {};

  downloadWorkder: Worker;

  tasksMap: TasksMap = {};

  cacheManager: CacheManager = {};

  callbackProcess: Record<string, Promise<any>> = {};

  constructor(options: ResourceClientOptions = {}) {
    super();
    this.options = { ...this.options, ...options };

    this.downloadWorkder = this.initDownloadWorker();
  }

  initDownloadWorker(): Worker {
    const worker = new Worker(new URL('../worker/loader.worker', import.meta.url));
    worker.addEventListener('message', e => {
      const {
        event,
        data: { cachedKey, data: cachedData },
      } = e.data;
      if (event === 'LOADED') {
        const { tasksMap, cacheManager } = this;
        if (!cacheManager[cachedKey]) {
          cacheManager[cachedKey] = [];
        }
        cachedData.forEach((data: ImageData) => {
          const index = tasksMap[cachedKey].urls.findIndex(url => url === data.imageId);
          cacheManager[cachedKey][index] = data;
          this.emit({
            eventName: RESOURCE_EVENTS.LOADED,
            eventData: {
              cachedKey,
              index,
              data,
            },
          });
        });
      }
    });

    return worker;
  }

  addTasks(cachedKey: string, tasks: Tasks): void {
    const { tasksMap } = this;
    const { studyId, seriesId, urls, type = RESOURCE_TYPES.DICOM, priority = PRIORITY_TYPES.LOW } = tasks;
    tasksMap[cachedKey] = {
      seriesId,
      studyId,
      urls,
      type,
      priority,
    };
    this.loadData(cachedKey);
  }

  loadData(cachedKey: string) {
    const { tasksMap, downloadWorkder } = this;
    const tasks = tasksMap[cachedKey];

    downloadWorkder.postMessage({ event: 'LOAD', data: { cachedKey, tasks } });
  }

  async getResourceData(cachedKey: string, cond?: number) {
    const { cacheManager } = this;

    if (cond !== undefined && !cacheManager[cachedKey]?.[cond]) {
      // await this.loadIndex(cachedKey, cond);
      return cacheManager[cachedKey][cond];
    }
    if (!cacheManager[cachedKey]) {
      await this.loadData(cachedKey);
    }
    return cacheManager[cachedKey];
  }
}

export default ResourceClient;
