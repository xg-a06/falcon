import getCacheInstance from '@src/cache';

async function test() {
  console.time('xxx');
  const db = await getCacheInstance();
  // await db.deleteByConds('dicom', v => v.studyId === '789');
  // await db.insert('dicom', { imageId: '123', seriesId: '456', studyId: '789' });
  // await db.clear('dicom');

  const aa = await db.count('dicom', 'seriesId', '1.2.392.200036.9116.2.2059767860.1617866629.8.1307500001.2');
  console.timeEnd('xxx');
  console.log(aa);
}

// document.addEventListener('click', () => {
test();
// });
