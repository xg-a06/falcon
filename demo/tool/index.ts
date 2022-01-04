/* eslint-disable @typescript-eslint/no-unused-vars */
import getLoader, { Tasks, QueryObj } from '@src/loader';
import { VIEWPORT_EVENT_TYPES } from '@src/const/eventTypes';
import Tool_Types from '@src/const/toolTypes';
import viewportsManager from '@src/viewportsManager';
import toolsManager from '@src/toolsManager';
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

const elm1 = document.getElementById('scene1') as HTMLCanvasElement;
const elm2 = document.getElementById('scene2') as HTMLCanvasElement;
const renderOptions1: RenderOptions = {
  elm: elm1,
  displayState: { wwwc: { ww: 800, wc: 300 } },
  seriesInfo: {
    studyId,
    seriesId,
    count: urls.length,
  },
};
const renderOptions2: RenderOptions = {
  elm: elm2,
  displayState: {},
  seriesInfo: {
    studyId,
    seriesId,
    count: urls.length,
  },
};

viewportsManager.enable(elm1);
toolsManager.activeTool(elm1, Tool_Types.WWWC);
elm1.addEventListener(VIEWPORT_EVENT_TYPES.DISPLAY_STATE_CHANGE, (e: any) => {
  console.log('DISPLAY_STATE_CHANGE', e.target.displayState.wwwc);
});
elm1.addEventListener(VIEWPORT_EVENT_TYPES.DICOM_INFO_CHANGE, (e: any) => {
  console.log('DICOM_INFO_CHANGE', e.target.dicomInfo);
});
viewportsManager.enable(elm2);
toolsManager.activeTool(elm2, Tool_Types.LENGTH);
// toolsManager.activeTool(elm2, Tool_Types.LENGTH);
// toolsManager.disableTool(elm1);

async function test(query: QueryObj) {
  // const cacheData = await loader.getCacheDataBySeriesId(seriesId);
  const renderData = await loader.getCacheDataByIndex(query);
  basicRender(renderData, renderOptions1);
  basicRender(renderData, renderOptions2);
}
const query: QueryObj = {
  seriesId,
  value: 10,
};
test(query);
