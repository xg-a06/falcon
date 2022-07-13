/* eslint-disable @typescript-eslint/no-empty-interface */
import { EventEmitter } from '@falcon/utils';
import { RESOURCE_TYPES, RESOURCE_EVENTS, PRIORITY_TYPES } from './const';
import { Tasks, ImageData } from '../typing';

interface ResourceClientOptions {}

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

  TopTask(cachedKey: string, index: number): void {
    const { tasksMap, downloadWorkder } = this;
    if (tasksMap[cachedKey] === undefined) {
      return;
    }
    const { studyId, seriesId, urls, type, priority } = tasksMap[cachedKey];
    const tasks = { studyId, seriesId, urls: urls.slice(index, index + 1), type, priority };
    downloadWorkder.postMessage({ event: 'TOP_TASK', data: { cachedKey, tasks } });
  }

  // 只允许全量替换任务，追加请使用appendTasks
  addTasks(cachedKey: string, tasks: Tasks): void {
    const { tasksMap, cacheManager, downloadWorkder } = this;
    const { studyId, seriesId, urls, type = RESOURCE_TYPES.DICOM, priority = PRIORITY_TYPES.LOW } = tasks;
    if (tasksMap[cachedKey]) {
      downloadWorkder.postMessage({ event: 'ABORT', data: { cachedKey } });
    }
    let filterUrls = urls;
    if (cacheManager[cachedKey]) {
      filterUrls = urls.filter(url => cacheManager[cachedKey].findIndex(c => c.imageId === url) === -1);
    }
    tasksMap[cachedKey] = {
      seriesId,
      studyId,
      urls: filterUrls,
      type,
      priority,
    };
    downloadWorkder.postMessage({ event: 'LOAD', data: { cachedKey, tasks: tasksMap[cachedKey] } });
  }
}

export default ResourceClient;
