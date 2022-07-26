/* eslint-disable @typescript-eslint/no-unused-vars */
import { RefObject, useEffect, useCallback } from 'react';
import { useEvent } from '@falcon/utils';
import { EVENT_LEVELS, TOOL_STATES, BUTTON_TYPES } from './const';
import { mousedownHandler } from './mouseEventHandler';
import { HandlerEvent } from './tools';

type EventListener = (e: HandlerEvent) => void;

type StringToNumber<T extends string, A extends any[] = []> = T extends keyof [0, ...A] ? A['length'] : StringToNumber<T, [0, ...A]>;

type ToolOptions = {
  state: typeof TOOL_STATES[keyof typeof TOOL_STATES];
  button: typeof BUTTON_TYPES[keyof typeof BUTTON_TYPES];
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
