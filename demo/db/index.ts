/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import getCacheInstance from '@src/cache';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));
async function test() {
  console.time('x1');
  const db = await getCacheInstance();
  console.timeEnd('x1');
  // await db.deleteByConds('dicom', v => v.studyId === '789');

  document.addEventListener('click', async () => {
    const aaa = new Array(100).fill(1);
    for (const [i] of aaa.entries()) {
      console.time('yyy');
      await db.insert('dicom', {
        imageId: Math.random(),
        seriesId: '222',
        studyId: '333',
        data: new Uint8Array(526396),
      });
      console.timeEnd('yyy');
      await sleep(30);
    }
  });
  // await db.clear('dicom');
  // const aa = await db.count('dicom', 'seriesId', '1.2.392.200036.9116.2.2059767860.1617866629.8.1307500001.2');
  // console.log(aa);
}

// document.addEventListener('click', () => {
test();
// });
