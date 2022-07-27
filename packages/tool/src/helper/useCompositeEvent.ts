/* eslint-disable @typescript-eslint/no-unused-vars */
import { RefObject, useEffect, useCallback } from 'react';
import { useEvent, EVENT_LEVELS, ToolOptions } from '@falcon/utils';
import { mousedownHandler } from './mouseEventHandler';
import { HandlerEvent } from './tools';

type EventListener = (e: HandlerEvent) => void;

type StringToNumber<T extends string, A extends any[] = []> = T extends keyof [0, ...A] ? A['length'] : StringToNumber<T, [0, ...A]>;

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

// Todo：后续在此扩展事件支持h5
const useCompositeEvent = (target: RefObject<HTMLCanvasElement>, eventName: keyof typeof EVENT_LEVELS, fn: EventListener, options: ToolOptions) => {
  useEffect(() => {
    if (!target.current!.matches('[viewport]')) {
      target.current!.setAttribute('viewport', '');
      attachEvent(target.current!);
    }
    return () => {
      if (target.current!.matches('[viewport]')) {
        target.current!.removeAttribute('viewport');
        detachEvent(target.current!);
      }
    };
  }, []);

  const cb = useCallback(
    (e: HandlerEvent) => {
      const { button, state } = options;
      const {
        detail: { button: eventBtn },
      } = e;

      if ((eventBtn !== -1 && eventBtn !== button) || state < EVENT_LEVELS[eventName]) {
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
