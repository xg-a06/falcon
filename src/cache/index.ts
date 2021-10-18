import DB, { DBOptions, StoreOption } from '@src/helper/db';

const stores: Array<StoreOption> = [
  {
    name: 'dicom',
    option: { keyPath: 'id' },
    indexs: [
      {
        key: 'id',
        option: {
          unique: true,
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

let instance: any;

const getCacheInstance = async (): Promise<DB> => {
  if (instance === undefined) {
    await DB.init(dbOptions);
  }
  return instance;
};

export default getCacheInstance;
