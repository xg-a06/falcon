/* eslint-disable no-restricted-globals */
import { Tasks } from './index';
import ajax from '../helper/ajax';

interface TasksMap {
  [key: string]: {
    studyId: string;
    urls: Array<string>;
    priority?: number;
  };
}

const queues: Record<string, Array<string>> = {
  '0': [],
  '1': [],
  '2': [],
};

const tasksMap: TasksMap = {};

let port2: MessagePort;

const ctx: Worker = self as any;

let isWorking = false;

const loadImage = async (url: string): Promise<any> => {
  let image = null;
  const xhr = ajax.create({
    url,
    responseType: 'arraybuffer',
  });
  const { code, data } = await xhr.request();
  if (code === 200) {
    image = data;
    return image;
  }
  return undefined;
};

const retryLoadImage = (url: string, retry = 3): Promise<any> =>
  loadImage(url)
    .then(image => image)
    .catch(error => {
      console.log(error);
      return retry > 0 ? retryLoadImage(url, --retry) : false;
    });

const pickTask = () => {
  const seriesId = queues[0][0] || queues[1][0] || queues[2][0];
  if (seriesId) {
    const { studyId, urls } = tasksMap[seriesId];
    return { seriesId, studyId, urls: urls.splice(0, 6) };
  }
  return undefined;
};

const load = async () => {
  if (isWorking) {
    return;
  }
  const tasks = pickTask();
  if (!tasks) {
    return;
  }
  isWorking = true;
  const { seriesId, studyId, urls } = tasks;
  const works = urls.map(url => retryLoadImage(url));
  const rets = await Promise.all(works);

  if (rets.length > 0) {
    const data = rets.map((ret, index) => ({
      studyId,
      seriesId,
      imageId: urls[index],
      data: ret,
    }));
    port2.postMessage({ event: 'LOADED', data });
  }
  isWorking = false;
  load();
};

const initEvent = (port: MessagePort) => {
  port.onmessage = async message => {
    console.log('loader port', message);
    const { event, data } = message.data;
    if (event === 'load') {
      const { seriesId, studyId, urls, priority = 2 } = data as Tasks;
      if (!tasksMap[seriesId]) {
        queues[priority].push(seriesId);
        tasksMap[seriesId] = { studyId, urls, priority };
      }
      load();
    } else if (event === 'abort') {
      console.log('abort');
    }
  };
};

ctx.addEventListener('message', async e => {
  if (e.data === 'init') {
    [port2] = e.ports;
    initEvent(port2);
  }
});

// 简单处理worker引入问题
class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

export default WebpackWorker;
