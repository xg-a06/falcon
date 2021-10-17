import DB from '@src/cache/db';

async function test() {
  const db = await DB.getInstance({ name: 'test', version: 2 });
  console.log(db);
}

test();
