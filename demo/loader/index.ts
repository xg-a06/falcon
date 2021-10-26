import Loader, { Tasks, QueryObj } from '@src/loader';

async function test() {
  const loader = new Loader();

  const testTasks: Tasks = {
    seriesId: '456',
    studyId: '789',
    urls: ['123'],
  };

  loader.addTasks(testTasks);

  const query: QueryObj = {
    seriesId: '456',
    index: 0,
  };

  const result = await loader.getCacheData(query);
  console.log(result);
}

test();
