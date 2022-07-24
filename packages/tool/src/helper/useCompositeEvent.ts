import { RefObject, useEffect, useCallback } from 'react';
import { useEvent } from '@falcon/utils';
import { EVENT_LEVELS } from './const';
import { mousedownHandler } from './mouseEventHandler';
import { HandlerEvent } from './tools';

type EventListener = (e: HandlerEvent) => void;

type ToolOptions = {
  state: 0 | 1 | 2 | 3;
  button: -1 | 0 | 1 | 2;
};

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
const useCompositeEvent = (target: RefObject<HTMLCanvasElement>, eventName: string, fn: EventListener, options: ToolOptions) => {
  useEffect(() => {
    if (!target.current!.matches('[viewport]')) {
      target.current!.setAttribute('viewport', '');
      attachEvent(target.current!);
    }
    return () => {
      detachEvent(target.current!);
    };
  }, []);

  const cb = useCallback(
    (e: HandlerEvent) => {
      const { button, state } = options;
      const {
        detail: { button: eventBtn },
      } = e;
      if (eventBtn !== button || state < EVENT_LEVELS[eventName]) {
        return;
      }

      fn(e);
    },
    [fn, options],
  );

  const cbEvent = useEvent(cb);

  useEffect(() => {
    if (target.current === null) {
      return empty;
    }

    target.current.addEventListener(eventName, cbEvent);

    return () => target.current?.removeEventListener(eventName, cbEvent);
  }, []);
};

export { ToolOptions };

export default useCompositeEvent;
