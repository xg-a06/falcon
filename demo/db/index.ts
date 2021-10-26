import getCacheInstance from '@src/cache';

async function test() {
  const db = await getCacheInstance();
  // await db.deleteByConds('dicom', v => v.studyId === '789');
  await db.insert('dicom', { imageId: '123', seriesId: '456', studyId: '789' });
  // await db.clear('dicom');
  const aa = await db.queryByIndex('dicom', 'studyId', '789');
  console.log(aa);
}

test();
