/* eslint-disable import/no-mutable-exports */
import registerPromiseWorker from 'promise-worker/register';
import getCacheInstance from '@src/cache';

registerPromiseWorker(async message => {
  const { studyId, seriesId, url, data } = message;
  const db = await getCacheInstance();
  await db.insert('dicom', { imageId: url, studyId, seriesId, data });
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
