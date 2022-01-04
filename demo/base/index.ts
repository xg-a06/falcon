/* eslint-disable @typescript-eslint/no-unused-vars */
import getLoader, { Tasks, QueryObj } from '@src/loader';
import basicRender, { RenderOptions } from '@src/renderer/basic';
import dataJson from '../data/data1.json';

const studyId = '1.2.392.200036.9116.2.6.1.44063.1796265542.1599809555.719814';
const seriesId = '1.2.392.200036.9116.2.1796265542.1599809941.9.1225100001.2';
const urls = dataJson.data.images.map(image => `http://172.16.6.14:8000/${image.storagePath}`);
const tasks: Tasks = {
  studyId,
  seriesId,
  urls,
};

const loader = getLoader();
window.loader = loader;
loader.addTasks(tasks);

const renderOptions: RenderOptions = {
  elm: document.getElementById('scene') as HTMLCanvasElement,
  displayState: { wwwc: { ww: 800, wc: 300 } },
  seriesInfo: {
    studyId,
    seriesId,
    count: urls.length,
  },
};

async function test(query: QueryObj) {
  // const cacheData = await loader.getCacheDataBySeriesId(seriesId);
  const renderData = await loader.getCacheDataByIndex(query);
  basicRender(renderData, renderOptions);
}
let i = 0;
setInterval(() => {
  if (i >= 320) {
    i = 0;
  }
  const query: QueryObj = {
    seriesId,
    value: i++,
  };
  test(query);
}, 16);
