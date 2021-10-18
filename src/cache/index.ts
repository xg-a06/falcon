import DB from '@src/helper/db';

let instance: any;

const getCacheInstance = () => {
  if (instance === undefined) {
    await DB.init({
      dbName: 'books', // 数据库名称
      version: 1, // 版本号
      tables: [
        {
          tableName: 'bookrackList', // 表名
          option: { keyPath: 'id', autoIncrement: true }, // 指明主键为id
          indexs: [
            // 数据库索引
            {
              key: 'id',
              option: {
                unique: true,
              },
            },
            {
              key: 'name',
            },
          ],
        },
      ],
    });
  }
  return instance;
};

export default getCacheInstance();
