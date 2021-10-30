/* eslint-disable no-restricted-globals */
import getCacheInstance from '@src/cache';
import { debounce } from '@src/helper/tools';

let port2: MessagePort;

const cache = {
  queue: [] as Array<any>,
};

const doCache = debounce(async (target: any) => {
  const { queue: data } = target;
  cache.queue = [];
  const db = await getCacheInstance();
  await db.insert('dicom', data);
  console.log('over');
}, 16);

const ctx: Worker = self as any;

ctx.addEventListener('message', async e => {
  [port2] = e.ports;
  port2.onmessage = async message => {
    const { data } = message;
    cache.queue.push(data);
    doCache(cache);
  };
});

// 简单处理worker引入问题
class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

export default WebpackWorker;
