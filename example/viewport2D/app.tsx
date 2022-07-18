/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Viewport2D } from '@falcon/viewport';
import { basicRender } from '@falcon/renderer';
import { ResourceProvider, useResourceRequest, useResourceData, CustomTasks, QueryCache, ImageData } from '@falcon/resource';

import './index.global.css';

import data from './data.json';

const urls = data.series.images.map(({ storagePath }) => `http://172.16.6.6:8000/${storagePath}`);

const testTasks: CustomTasks = {
  cachedKey: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487_axial',
  studyId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733415.854445',
  seriesId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487',
  urls,
};

const index = 0;

const App = () => {
  useResourceRequest(testTasks);
  const [showData, setShowData] = useState<QueryCache>({ cachedKey: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487_axial', index: 0 });
  const resource = useResourceData(showData) as ImageData;
  // useEffect(() => {
  //   setInterval(() => {
  //     let i = ++index;
  //     if (i >= 264) {
  //       i = 0;
  //       index = 0;
  //     }
  //     setShowData({ cachedKey: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487_axial', index: i });
  //   }, 16);
  // }, []);
  return (
    <div className="container">
      <ResourceProvider>
        <Viewport2D renderData={resource} renderFn={basicRender}></Viewport2D>
      </ResourceProvider>
    </div>
  );
};

export default App;
