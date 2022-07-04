import { useRef, useCallback, useLayoutEffect } from 'react';

type Callback = (...args: Array<any>) => void;

// 据说在react18的并发模式下有问题，但是大多数场景应该没问题。
const useEvent = (fn: Callback) => {
  const fnRef = useRef<Callback>();

  useLayoutEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cb = useCallback((...args: Array<any>) => {
    const handler = fnRef.current;
    return handler && handler(...args);
  }, []);

  return cb;
};

export default useEvent;
