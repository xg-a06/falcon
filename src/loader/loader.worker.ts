/* eslint-disable no-restricted-globals */
import ajax from '../helper/ajax';

let port1: MessagePort;
const xhrs: Array<any> = [];
const ctx: Worker = self as any;

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

ctx.addEventListener('message', async e => {
  if (e.data === 'init') {
    [port1] = e.ports;
    return;
  }
  if (e.data === 'abort') {
    xhrs.forEach(xhr => xhr.abort());
    return;
  }
  const { studyId, seriesId, url } = e.data;
  const image = await retryLoadImage(url);
  if (image) {
    port1.postMessage({ studyId, seriesId, imageId: url, data: image });
    ctx.postMessage(true);
    return;
  }
  ctx.postMessage(false);
});

// 简单处理worker引入问题
class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

export default WebpackWorker;
