import { ajax } from '@falcon/utils';
import { Tasks, PRIORITY_TYPES, RESOURCE_TYPES } from '../client';
import { parserDicom } from './parserFactory';
import { ExtendData } from '../typing';

interface ISource {
  type: string;
  data: ArrayBuffer;
  extendData: ExtendData;
}
interface QueueData {
  cachedKey: string;
  tasks: Required<Tasks>;
}

// 任务队列 先简单设计
const queues: Record<string, Array<QueueData>> = {
  [`${PRIORITY_TYPES.HIGH}`]: [],
  [`${PRIORITY_TYPES.NORMAL}`]: [],
  [`${PRIORITY_TYPES.LOW}`]: [],
};

// 线程上下文
const ctx = self as unknown as Worker;

let isWorking = false;

// 加载图片
const loadImage = async (url: string): Promise<ArrayBuffer | undefined> => {
  const xhr = ajax.create({
    url,
    responseType: 'arraybuffer',
  });
  const { code, data } = await xhr.request();
  if (code === 200) {
    return data;
  }
  return undefined;
};

// 重试逻辑
const retryLoadImage = (url: string, retry = 2): Promise<ArrayBuffer | undefined> => {
  let time = retry;
  return loadImage(url)
    .then(image => image)
    .catch(error => {
      console.log(error);
      return time > 0 ? retryLoadImage(url, --time) : undefined;
    });
};

// 获取任务
const pickTask = (): QueueData | void => {
  const qItem = queues[0][0] || queues[1][0] || queues[2][0];
  if (qItem) {
    const { cachedKey, tasks } = qItem;
    return { cachedKey, tasks: { ...tasks, urls: tasks.urls.splice(0, 6) } };
  }
  return undefined;
};

// 清除无效任务队列和任务map
const clearInvalidQueue = () => {
  for (let priority = 0; priority < 3; priority += 1) {
    const queue = queues[priority];
    const qItem = queue[0];
    if (qItem && qItem.tasks.urls.length === 0) {
      queue.shift();
    }
  }
};

// 添加任务到任务队列和任务map 以及调整优先级逻辑
const addQueue = (data: QueueData) => {
  const {
    tasks: { priority },
  } = data;
  queues[priority].push(data);
  // Todo：处理优先级队列重复任务情况？？
};

const topQueue = (data: QueueData) => {
  const {
    cachedKey,
    tasks: { urls, priority },
  } = data;

  const queue = queues[priority];
  queue.forEach(item => {
    if (item.cachedKey === cachedKey) {
      item.tasks.urls = item.tasks.urls.filter(url => urls.indexOf(url) === -1);
    }
  });
  queue.unshift(data);
};

// 终止未加载task
const abortQueue = ({ cachedKey }: Record<string, string>) => {
  for (let priority = 0; priority < 3; priority += 1) {
    const queue = queues[priority];
    queues[priority] = queue.filter(item => item.cachedKey !== cachedKey);
  }
};

const createImageData = (source: ISource): any => {
  const { type, data, extendData } = source;
  let result;
  switch (type) {
    case RESOURCE_TYPES.DICOM:
      result = parserDicom(data, extendData);
      break;
    case RESOURCE_TYPES.JPEG:
    default:
  }

  return result;
};
// 加载数据逻辑
const load = async () => {
  if (isWorking) {
    return;
  }
  const taskData = pickTask();
  if (!taskData) {
    return;
  }
  isWorking = true;
  const {
    cachedKey,
    tasks: { studyId, seriesId, urls, type },
  } = taskData;
  const works = urls.map(url => retryLoadImage(url));
  const tmp = await Promise.all(works);
  const rets = tmp.filter(i => i) as unknown as Array<ArrayBuffer>;

  if (rets.length > 0) {
    const data = rets.map((ret, index) => {
      const imageData = createImageData({ type, data: ret, extendData: { imageId: urls[index], studyId, seriesId } });
      return { studyId, seriesId, ...imageData };
    });
    ctx.postMessage({ event: 'LOADED', data: { cachedKey, data } });
    clearInvalidQueue();
  }
  isWorking = false;
  load();
};

ctx.addEventListener('message', async (e: MessageEvent) => {
  const { event, data } = e.data;
  switch (event) {
    case 'LOAD':
      addQueue(data);
      load();
      break;
    case 'TOP_TASK':
      topQueue(data);
      break;
    case 'ABORT':
      abortQueue(data);
      break;
    default:
      break;
  }
});
// DedicatedWorkerGlobalScope
