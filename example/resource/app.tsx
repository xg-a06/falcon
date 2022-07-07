import React from 'react';
import ResourceProvider, { useResourceRequest, Tasks } from '@falcon/resource';

const testTasks: Tasks = {
  cacheKey: '123',
  studyId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733415.854445',
  seriesId: '1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487',
  urls: [
    'http://172.16.6.6:8000/ct_lung/00923256/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733415.854445/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733757.937092',
    'http://172.16.6.6:8000/ct_lung/00923256/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733415.854445/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733751.701487/1.2.392.200036.9116.2.6.1.44063.1796265542.1588733757.946896',
  ],
};

const TestResource = () => {
  useResourceRequest(testTasks);
  return <div>test resource</div>;
};

const App = () => (
  <ResourceProvider>
    <TestResource />
  </ResourceProvider>
);

export default App;
