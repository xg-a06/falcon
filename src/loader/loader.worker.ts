/* eslint-disable no-restricted-globals */
import registerPromiseWorker from 'promise-worker/register';
import getCacheInstance from '@src/cache';
import ajax from '../helper/ajax';

// let port1: MessagePort;
const workCount = 0;
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
  const task = queue.shift();
  const { studyId, seriesId, url } = task;
  const image = await retryLoadImage(url);
  // if (image) {
  //   const db = await getCacheInstance();
  //   await db.insert('dicom', { studyId, seriesId, imageId: url, data: image });
  // }
  work();
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

registerPromiseWorker(message => {
  queue.push(message);
  work();
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
