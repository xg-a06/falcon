import { useEffect, RefObject } from 'react';
import useEvent, { EventListener } from './useEvent';

type DomEventTarget = HTMLElement | Window | Document;
type GetTarget = () => DomEventTarget;

const empty = () => undefined;

// 目前只支持ref绑定，后续可以追加dom支持
const useEventListener = (target: RefObject<HTMLElement> | GetTarget, eventName: string, fn: EventListener, deps: Array<any> = []) => {
  const cb = useEvent(fn);

  useEffect(() => {
    let tmp: DomEventTarget | null = null;
    if (typeof target === 'function') {
      tmp = target();
    } else {
      tmp = target.current;
    }
    if (tmp === null) {
      return empty;
    }
    tmp.addEventListener(eventName, cb);

    return () => tmp?.removeEventListener(eventName, cb);
  }, [deps]);
};

export default useEventListener;
