import registerPromiseWorker from 'promise-worker/register';

registerPromiseWorker(message => message);

class WebpackWorker extends Worker {
  constructor() {
    super('');
    console.log('init');
  }
}

// Uncomment this if you set the `esModule` option to `false`
// export = WebpackWorker;
export default WebpackWorker;
