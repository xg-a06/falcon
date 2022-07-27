import { useRef, RefObject, useCallback } from 'react';
import { EVENT_TYPES, ToolOptions } from '@falcon/utils';
import useCompositeEvent from './helper/useCompositeEvent';
import { HandlerEvent } from './helper/tools';

type Point = { x: number; y: number };

const useLengthTool = (id: string, target: RefObject<HTMLCanvasElement>, options: ToolOptions) => {
  const handlers = useRef<{ start: Point | null; end: Point | null }>({ start: null, end: null });

  const draw = useCallback((canvas: HTMLCanvasElement, start: Point, end: Point) => {
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke();
  }, []);

  useCompositeEvent(
    target,
    EVENT_TYPES.RENDERED,
    (e: HandlerEvent) => {
      const { target: elm } = e;
      const { start, end } = handlers.current;
      if (start && end) {
        draw(elm, start, end);
      }
    },
    options,
  );

  useCompositeEvent(
    target,
    EVENT_TYPES.TOUCHDOWN,
    (e: HandlerEvent) => {
      const {
        coords: { offsetX, offsetY },
      } = e.detail;

      handlers.current.start = { x: offsetX, y: offsetY };
    },
    options,
  );

  useCompositeEvent(
    target,
    EVENT_TYPES.TOUCHMOVE,
    (e: HandlerEvent) => {
      const {
        coords: { offsetX, offsetY },
      } = e.detail;

      handlers.current.end = { x: offsetX, y: offsetY };
    },
    options,
  );
};

export { useLengthTool };
