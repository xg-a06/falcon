/* eslint-disable import/no-unresolved */
// import PromiseWorker from 'promise-worker';
import DB, { DBOptions, StoreOption } from '@src/helper/db';
// import LoaderWorker from '@src/loader/loader.worker.ts';

// const worker = new LoaderWorker();
// console.log(worker);
// const promiseWorker = new PromiseWorker(worker);
// promiseWorker
//   .postMessage('ping')
//   .then(response => {
//     console.log(response);
//   })
//   .catch(error => {
//     // handle error
//   });

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
