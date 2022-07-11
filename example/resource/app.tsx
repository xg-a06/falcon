import React from 'react';
import { ResourceProvider, useResourceRequest, CustomTasks } from '@falcon/resource';

import data from './data.json';

const urls = data.images.map(({ storagePath }) => `http://172.16.3.20:8000/${storagePath}`);

const testTasks: CustomTasks = {
  cachedKey: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487_axial',
  studyId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733415.854445',
  seriesId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487',
  urls,
};

const TestResource = () => {
  useResourceRequest(testTasks);
  console.log('render');

  return <div>test resource</div>;
};

const App = () => (
  <ResourceProvider>
    <TestResource />
  </ResourceProvider>
);

export default App;
