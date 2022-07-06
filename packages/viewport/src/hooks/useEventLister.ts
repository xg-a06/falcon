import { useEffect, RefObject } from 'react';
import useEvent, { EventListener } from './useEvent';

const empty = () => undefined;

// 定义类型保护
const isIframe = (target: HTMLElement | null): target is HTMLIFrameElement => {
  if (target === null) {
    return false;
  }
  return 'contentWindow' in target;
};

// 目前只支持ref绑定，后续可以追加dom支持
const useEventLister = (target: RefObject<HTMLElement>, eventName: string, fn: EventListener, deps: Array<any> = []) => {
  const cb = useEvent(fn);

  useEffect(() => {
    let tmp: HTMLElement | Window | null = target.current;
    if (isIframe(target.current)) {
      tmp = target.current.contentWindow;
    }
    if (tmp === null) {
      return empty;
    }

    tmp.addEventListener(eventName, cb);

    return () => tmp?.removeEventListener(eventName, cb);
  }, [deps]);
};

export default useEventLister;
