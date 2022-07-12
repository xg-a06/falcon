import { useRef, useCallback, useLayoutEffect } from 'react';

export interface EventListener {
  (evt: Event): void;
}

// 据说在react18的并发模式下有问题，但是大多数场景应该没问题。
const useEvent = (fn: EventListener) => {
  const fnRef = useRef<EventListener>();

  useLayoutEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cb = useCallback((e: any) => {
    const handler = fnRef.current;
    return handler && handler(e);
  }, []);

  return cb;
};

export default useEvent;
