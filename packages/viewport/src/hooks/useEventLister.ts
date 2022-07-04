import { useEffect } from 'react';
import useEvent, { EventListener } from './useEvent';

const empty = () => undefined;

const useEventLister = (target: HTMLElement | Window | null | undefined, eventName: string, fn: EventListener, deps: Array<any> = []) => {
  const cb = useEvent(fn);

  useEffect(() => {
    if (!target) {
      return empty;
    }
    target.addEventListener(eventName, cb);
    return () => target.removeEventListener(eventName, cb);
  }, [deps]);
};

export default useEventLister;
