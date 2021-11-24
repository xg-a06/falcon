/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import getCacheInstance from '@src/cache';

const sleep = (time: number) => new Promise(reslove => setTimeout(reslove, time));
async function test() {
  console.time('x1');
  const db = await getCacheInstance();
  console.timeEnd('x1');
  console.time('x2');
  const aa = await db.count('dicomInfo', 'seriesId', '222');
  db.clear('dicomInfo');
  console.timeEnd('x2');
  console.log(aa);

  // // await db.deleteByConds('dicom', v => v.studyId === '789');

  document.addEventListener('click', async () => {
    const aaa = new Array(1000).fill(1);
    for (const [i] of aaa.entries()) {
      const data = [];
      for (let j = 0; j < 20; j++) {
        data.push({
          imageId: Math.random(),
          seriesId: '222',
          studyId: '333',
          data: new Uint8Array(526396),
        });
      }
      await db.insert('dicomInfo', data);
    }
  });
  // await db.clear('dicom');
  //
  // console.log(aa);
}

// document.addEventListener('click', () => {
test();
// });
