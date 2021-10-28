/* eslint-disable import/no-mutable-exports */
import registerPromiseWorker from 'promise-worker/register';
import ajax from '../helper/ajax';

const loadImage = async (url: string): Promise<any> => {
  let image = null;
  const { code, data } = await ajax({
    url,
    responseType: 'arraybuffer',
  });
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

registerPromiseWorker(async message => {
  const { url } = message;
  const image = await retryLoadImage(url);
  if (image) {
    return image;
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
