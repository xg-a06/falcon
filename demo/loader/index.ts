/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import Loader, { Tasks, QueryObj } from '@src/loader';
import dataJson from './data.json';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));

const studyId = '1.2.840.20210402.121033010326';
const seriesId = '1.2.392.200036.9116.2.2059767860.1617342761.10.1276500003.2';
const urls = dataJson.data.images.map(image => `http://10.0.70.3:8000/${image.storagePath}`);

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
  // setTimeout(() => {
  //   fetch('/asd');
  // }, 500);
  // setTimeout(() => {
  //   fetch('/ert');
  // }, 1000);
  console.time('load');
  const cacheData = await loader.getCacheDataBySeriesId(seriesId);
  // const cacheData = await loader.getCacheDataByIndex<any>({ seriesId, value: 0 });
  console.log('cacheData', cacheData);
  console.timeEnd('load');
  //   // await sleep(30);
  // }
  // // const res = await loader.getCacheDataBySeriesId(seriesId);
  // // console.log(res);
  // console.timeEnd('get');
  // });
}

test();
