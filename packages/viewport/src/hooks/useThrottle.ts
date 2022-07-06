import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

type Callback = (...args: Array<any>) => void;

const useThrottle = (cb: Callback, delay: number) => {
  const { current } = useRef<{ timer: undefined | number; fn: Callback }>({ timer: undefined, fn: cb });

  useLayoutEffect(() => {
    current.fn = cb;
  }, [cb]);

  const debFn = useCallback((...args: Array<any>) => {
    if (current.timer !== undefined) {
      current.fn.call(this, ...args);
      current.timer = setTimeout(() => {
        current.timer = undefined;
      }, delay);
    }

    return () => {
      current.timer = undefined;
    };
  }, []);

  return debFn;
};

const useThrottleEffect = (cb: Callback, deps: Array<any> = [], delay: number = 1000 / 30) => {
  useEffect(useThrottle(cb, delay), deps);
};

export { useThrottle, useThrottleEffect };
