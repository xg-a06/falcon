/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import Loader, { Tasks, QueryObj } from '@src/loader';
import dataJson from './data.json';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));

const studyId = '1.2.392.200036.9116.2.6.1.44063.1796265542.1599809555.719814';
const seriesId = '1.2.392.200036.9116.2.1796265542.1599809941.9.1225100001.2';
const urls = dataJson.data.images.map(image => `http://172.16.6.7:8000/${image.storagePath}`);

const tasks: Tasks = {
  studyId,
  seriesId,
  urls,
};

// const { length } = urls;
// let index = 0;
async function test() {
  const loader = new Loader();
  window.loader = loader;
  loader.addTasks(tasks);
  // document.body.addEventListener('keydown', async () => {
  //   if (index < length) {
  //     index++;
  //   } else {
  //     index = 0;
  //   }
  //   const query: QueryObj = {
  //     seriesId,
  //     value: index,
  //   };
  //   const res: any = await loader.getCacheDataByIndex(query);
  // });

  // document.body.addEventListener('click', async () => {
  // console.time('get');
  // for (const [i] of urls.entries()) {
  //   const query: QueryObj = {
  //     seriesId,
  //     value: i,
  //   };
  await loader.getCacheDataBySeriesId(seriesId);
  setTimeout(() => {
    fetch('/asd');
  }, 500);
  setTimeout(() => {
    fetch('/ert');
  }, 1000);
  //   // await sleep(30);
  // }
  // // const res = await loader.getCacheDataBySeriesId(seriesId);
  // // console.log(res);
  // console.timeEnd('get');
  // });
}

test();
