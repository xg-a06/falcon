/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import Loader, { Tasks, QueryObj } from '@src/loader';
import dataJson from './data.json';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));

const studyId = '1.2.840.20210408.121032001017';
const seriesId = '1.2.392.200036.9116.2.2059767860.1617866629.8.1307500001.2';
const urls = dataJson.data.images.map(image => `http://10.0.70.3:8000/${image.storagePath}`);

const tasks: Tasks = {
  studyId,
  seriesId,
  urls,
};

const { length } = urls;
let index = 0;
async function test() {
  const loader = new Loader();
  window.loader = loader;
  loader.addTasks(tasks);
  loader.clearCache();
  document.body.addEventListener('keydown', async () => {
    if (index < length) {
      index++;
    } else {
      index = 0;
    }
    const query: QueryObj = {
      seriesId,
      value: index,
    };
    const res: any = await loader.getCacheData(query);
    console.log(res?.imageId);
  });

  // document.body.addEventListener('click', async () => {
  console.time('get');

  for (const [i] of urls.entries()) {
    const query: QueryObj = {
      seriesId,
      value: i,
    };
    loader.getCacheData(query);
    // await sleep(30);
  }
  console.timeEnd('get');
  // });
  // console.log(result);
}

test();
