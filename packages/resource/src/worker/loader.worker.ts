import { ajax } from '@falcon/utils';
import createImageData from './imageData';

interface queueItem {
  seriesId: string;
  studyId: string;
  urls: Array<string>;
  type: string;
}

// 任务队列
const queues: Record<string, Array<queueItem>> = {
  '0': [],
  '1': [],
  '2': [],
};

// 线程上下文
const ctx: Worker = self as any;

let isWorking = false;

// 加载图片
const loadImage = async (url: string): Promise<any> => {
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
const retryLoadImage = (url: string, retry = 2): Promise<any> => {
  let time = retry;
  return loadImage(url)
    .then(image => image)
    .catch(error => {
      console.log(error);
      return time > 0 ? retryLoadImage(url, --time) : false;
    });
};

// 获取任务
const pickTask = () => {
  const qItem = queues[0][0] || queues[1][0] || queues[2][0];
  if (qItem) {
    const { seriesId, studyId, urls, type } = qItem;
    return { seriesId, studyId, urls: urls.splice(0, 6), type };
  }
  return undefined;
};

// 清除无效任务队列和任务map
const clearInvalidQueue = () => {
  for (let priority = 0; priority < 3; priority += 1) {
    const queue = queues[priority];
    const qItem = queue[0];
    if (qItem && qItem.urls.length === 0) {
      queue.shift();
    }
  }
};

// 添加任务到任务队列和任务map 以及调整优先级逻辑
const addQueue = (data: any) => {
  const { seriesId, urls, priority = 2 } = data;
  queues[priority].push(data.tasks);
  // 处理提升优先级情况 目前只处理单张提前这种场景
  for (let p = 2; p > priority; p--) {
    const queue = queues[p];
    const itemIndex = queue.findIndex(item => item.seriesId === seriesId);
    if (itemIndex !== -1) {
      const qItem = queue[itemIndex];
      qItem.urls = qItem.urls.filter(url => urls.indexOf(url) === -1);
      if (qItem.urls.length === 0) {
        queues[priority].shift();
        queue.splice(itemIndex, 1);
      }
    }
  }
};

// 终止未加载task
const abortQueue = ({ seriesId }: Record<string, string>) => {
  console.log('abort');
  for (let priority = 0; priority < 3; priority += 1) {
    const queue = queues[priority];
    const itemIndex = queue.findIndex(item => item.seriesId === seriesId);
    if (itemIndex !== -1) {
      queue.splice(itemIndex, 1);
    }
  }
};

// 加载数据逻辑
const load = async () => {
  if (isWorking) {
    return;
  }
  const tasks = pickTask();
  if (!tasks) {
    return;
  }
  isWorking = true;
  const { seriesId, studyId, urls, type } = tasks;
  const works = urls.map(url => retryLoadImage(url));
  const rets = await Promise.all(works);

  if (rets.length > 0) {
    const data = rets.map((ret: any, index: number) => {
      const tmp = createImageData({ type, data: ret, extendData: { imageId: urls[index], studyId, seriesId } });
      return { seriesId, studyId, ...tmp };
    });
    ctx.postMessage({ event: 'LOADED', data });
    clearInvalidQueue();
  }
  isWorking = false;
  load();
};

ctx.addEventListener('message', async e => {
  const { event, data } = e.data;
  if (event === 'LOAD') {
    addQueue(data);
    load();
  } else if (event === 'ABORT') {
    abortQueue(data);
  }
});
// DedicatedWorkerGlobalScope
// 简单处理worker引入问题
// class WebpackWorker extends Worker {
//   constructor() {
//     super('');
//     console.log('init');
//   }
// }

// export default WebpackWorker;
// eslint-disable-next-line no-undef
// const self = globalThis as unknown as DedicatedWorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// self.onmessage = ({ data: { question } }) => {
//   self.postMessage({
//     answer: 42,
//   });
// };

// export {};
