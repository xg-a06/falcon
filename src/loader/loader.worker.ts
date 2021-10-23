import registerPromiseWorker from 'promise-worker/register';

registerPromiseWorker(message => {
  console.log(message);
  return 'pong';
});
// const ctx: Worker = self as any;

// // Post data to parent thread
// ctx.postMessage({ foo: 'foo' });
// console.log('123333');
// // Respond to message from parent thread
// ctx.addEventListener('message', event => console.log(event.data));
