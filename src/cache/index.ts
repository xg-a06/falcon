/* eslint-disable import/no-unresolved */
// import PromiseWorker from 'promise-worker';
import DB, { DBOptions, StoreOption } from '@src/helper/db';
import LoaderWorker from 'worker-loader!@src/loader/loader.worker';

const worker = new LoaderWorker();
console.log(worker);

worker.postMessage({ a: 1 });

worker.onmessage = event => {
  console.log(event);
};

const stores: Array<StoreOption> = [
  {
    name: 'dicom',
    // option: { autoIncrement: true },
    option: { keyPath: 'id' },
    indexs: [
      {
        key: 'seriesId',
        option: {
          unique: false,
        },
      },
      {
        key: 'studyId',
        option: {
          unique: false,
        },
      },
    ],
  },
];

const dbOptions: DBOptions = {
  name: 'viewer_cache',
  version: 1, // 版本号
  stores,
};

let instance: DB;

const getCacheInstance = async (): Promise<DB> => {
  if (instance === undefined) {
    instance = await DB.init(dbOptions);
  }
  return instance;
};

export default getCacheInstance;
