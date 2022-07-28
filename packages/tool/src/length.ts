/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, RefObject, useCallback } from 'react';
import { EVENT_TYPES, ToolOptions, useThrottle, uuidV4 } from '@falcon/utils';
import { useModel, toolsModel, useViewport, useToolData, produce } from '@falcon/host';
import useCompositeEvent from './helper/useCompositeEvent';
import { HandlerEvent } from './helper/tools';

type Point = { x: number; y: number };

const toolType = 'LENGTH';

const useLengthTool = (id: string, target: RefObject<HTMLCanvasElement>, options: ToolOptions) => {
  const handlers = useRef<{ tid: string | null; start: Point | null; end: Point | null }>({ tid: null, start: null, end: null });

  const { updateToolData } = useModel(toolsModel);

  const { imageData } = useViewport(id);

  const toolData = useToolData(id, toolType);

  const draw = useCallback((canvas: HTMLCanvasElement, data: { start: Point; end: Point }) => {
    const { start, end } = data;
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
      const uid = `${imageData?.imageId}`;

      const data = toolData?.[uid] || {};

      Object.entries(data).forEach(([k, v]) => {
        draw(elm, v as any);
      });
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
      handlers.current.tid = uuidV4();
      handlers.current.start = { x: offsetX, y: offsetY };
    },
    options,
  );

  useCompositeEvent(
    target,
    EVENT_TYPES.TOUCHMOVE,
    useThrottle((e: HandlerEvent) => {
      const {
        target: elm,
        detail: {
          coords: { offsetX, offsetY },
        },
      } = e;

      handlers.current.end = { x: offsetX, y: offsetY };

      const { tid, start, end } = handlers.current;

      const uid = `${imageData?.imageId}`;

      const currentState = toolData || {};

      const nextState = produce(currentState, (draftState: any) => {
        if (!draftState[uid]) {
          draftState[uid] = {};
        }
        draftState[uid][tid!] = { start, end };
      });
      // console.log(currentState);

      updateToolData(id, toolType, nextState);
    }, 30),
    options,
  );
};

export { useLengthTool };
