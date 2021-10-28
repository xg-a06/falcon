/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import Loader, { Tasks, QueryObj } from '@src/loader';
import dataJson from './data.json';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));

const studyId = '1.2.840.20210408.121032001017';
const seriesId = '1.2.392.200036.9116.2.2059767860.1617866629.8.1307500001.2';
const urls = dataJson.data.images.map(image => `http://192.168.111.115:8000/${image.storagePath}`);

const tasks: Tasks = {
  studyId,
  seriesId,
  urls,
};
async function test() {
  const loader = new Loader({ workerMaxCount: 4 });

  loader.addTasks(tasks);

  await loader.clearCache();
  for (const [index] of urls.entries()) {
    const query: QueryObj = {
      seriesId,
      index,
    };
    loader.getCacheData(query);
    // await sleep(30);
  }
  // console.log(result);
}

test();
