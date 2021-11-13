import DB, { DBOptions, StoreOption } from '@src/helper/db';

const stores: Array<StoreOption> = [
  {
    name: 'dicomInfo',
    // option: { autoIncrement: true },
    option: { keyPath: 'imageId' },
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
  {
    name: 'cacheInfo',
    option: { keyPath: 'seriesId' },
    indexs: [
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
  name: 'viewerCache',
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
