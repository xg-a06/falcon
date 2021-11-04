/* eslint-disable no-restricted-globals */
import registerPromiseWorker from 'promise-worker/register';
import getCacheInstance from '@src/cache';
import ajax from '../helper/ajax';

let isWorking = false;
const queue: Array<any> = [];
const xhrs: Array<any> = [];
// const ctx: Worker = self as any;

const loadImage = async (url: string): Promise<any> => {
  let image = null;
  const xhr = ajax.create({
    url,
    responseType: 'arraybuffer',
  });
  xhrs.push(xhr);
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

const work = async () => {
  if (queue.length === 0) {
    return;
  }
  isWorking = true;
  const tasks = queue.splice(0, 5);
  const works = tasks.map(({ url }) => retryLoadImage(url));
  const rets = await Promise.all(works);

  if (rets.length > 0) {
    const db = await getCacheInstance();
    const datas = tasks.map(({ studyId, seriesId, url }, index) => ({
      studyId,
      seriesId,
      imageId: url,
      data: rets[index],
    }));
    await db.insert('dicom', datas);
  }
  isWorking = false;
  if (queue.length > 0) {
    work();
  }
};

// ctx.addEventListener('message', e => {
//   if (e.data === 'init') {
//     [port1] = e.ports;
//     return;
//   }
//   if (e.data === 'abort') {
//     xhrs.forEach(xhr => xhr.abort());
//     return;
//   }
//   queue.push(e.data);
//   if (workCount < 5) {
//     work(workCount);
//   }
// });

registerPromiseWorker(async message => {
  queue.push(message);
  if (!isWorking) {
    work();
  }
  return false;
});

// 简单处理worker引入问题
class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

export default WebpackWorker;
