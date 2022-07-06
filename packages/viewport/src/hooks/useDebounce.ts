import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

type Callback = (...args: Array<any>) => void;

const useDebounce = (cb: Callback, delay: number) => {
  const { current } = useRef({ timer: 0, fn: cb });

  useLayoutEffect(() => {
    current.fn = cb;
  }, [cb]);

  const debFn = useCallback((...args: Array<any>) => {
    clearTimeout(current.timer);
    current.timer = setTimeout(() => {
      current.fn.call(this, ...args);
    }, delay);
  }, []);

  return debFn;
};

const useDebounceEffect = (cb: Callback, deps: Array<any> = [], delay: number = 1000 / 30) => {
  useEffect(useDebounce(cb, delay), deps);
};

export { useDebounce, useDebounceEffect };
