import { RefObject, useEffect } from 'react';
import { useEvent } from '@falcon/utils';
import { mousedownHandler } from './mouseEventHandler';
import { HandlerEvent } from './tools';

type EventListener = (e: HandlerEvent) => void;

const empty = () => undefined;

const attachEvent = (canvas: HTMLCanvasElement) => {
  canvas.addEventListener('mousedown', mousedownHandler);
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
  });
};

const detachEvent = (canvas: HTMLCanvasElement) => {
  canvas.addEventListener('mousedown', mousedownHandler);
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
  });
};

// todo：后续在此扩展事件支持h5
const useCompositeEvent = (target: RefObject<HTMLCanvasElement>, eventName: string, fn: EventListener) => {
  useEffect(() => {
    if (!target.current!.matches('[viewport]')) {
      target.current!.setAttribute('viewport', '');
      attachEvent(target.current!);
    }
    return () => {
      detachEvent(target.current!);
    };
  }, []);

  const cbEvent = useEvent(fn);

  useEffect(() => {
    if (target.current === null) {
      return empty;
    }

    target.current.addEventListener(eventName, cbEvent);

    return () => target.current?.removeEventListener(eventName, cbEvent);
  }, []);
};

export default useCompositeEvent;
