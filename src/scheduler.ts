const NORMAL_PRIORITY_TIMEOUT = 300;
const frameInterval = 5;
const taskQueue: Array<any> = [];
let isWorking = false;
let lastTask: any = null;

const channel = new MessageChannel();
const schedulePerformWorkUntilDeadline = () => {
  channel.port2.postMessage(null);
};

const getCurrentTime = () => performance.now();

const shouldYieldToHost = (startTime: number) => {
  const timeElapsed = getCurrentTime() - startTime;
  return !(timeElapsed < frameInterval);
};

const workLoop = (startTime: number) => {
  let currentTask = lastTask || taskQueue.shift();
  while (currentTask !== undefined) {
    const { expirationTime, callback, context, payload } = currentTask;
    if (expirationTime > startTime && shouldYieldToHost(startTime)) {
      lastTask = currentTask;
      break;
    }
    lastTask = null;
    callback.call(context, payload);
    currentTask = taskQueue.shift();
  }
  return currentTask !== undefined;
};

const doWork = () => {
  const currentTime = getCurrentTime();
  let hasMoreWork = true;
  try {
    hasMoreWork = workLoop(currentTime);
  } finally {
    if (hasMoreWork) {
      schedulePerformWorkUntilDeadline();
    } else {
      isWorking = false;
    }
  }
};

channel.port1.onmessage = doWork;

const addQueue = (callback: any) => {
  const startTime = getCurrentTime();
  const timeout = NORMAL_PRIORITY_TIMEOUT;
  const expirationTime = startTime + timeout;
  const updater = {
    callback,
    startTime,
    expirationTime,
  };
  const current = taskQueue.find(task => task.callback === callback);
  if (!current) {
    taskQueue.push(updater);
  }
  if (!isWorking) {
    isWorking = true;
    schedulePerformWorkUntilDeadline();
  }
};

export { addQueue };
