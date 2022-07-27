import { useRef, RefObject } from 'react';
import { useThrottle, EVENT_TYPES } from '@falcon/utils';
import { useModel, viewportsModel, useViewport } from '@falcon/host';
import useCompositeEvent, { ToolOptions } from './helper/useCompositeEvent';
import { HandlerEvent } from './helper/tools';

const useWWWCTool = (id: string, target: RefObject<HTMLCanvasElement>, options: ToolOptions) => {
  const isDown = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { updateDisplayState } = useModel(viewportsModel);
  const { displayState } = useViewport(id);

  useCompositeEvent(
    target,
    EVENT_TYPES.TOUCHDOWN,
    (e: HandlerEvent) => {
      const {
        coords: { pageX, pageY },
      } = e.detail;

      isDown.current = { x: pageX, y: pageY };
    },
    options,
  );

  useCompositeEvent(
    target,
    EVENT_TYPES.TOUCHMOVE,
    useThrottle((e: HandlerEvent) => {
      const {
        coords: { pageX, pageY },
      } = e.detail;
      const { x, y } = isDown.current;
      const deltaX = pageX - x;
      const deltaY = pageY - y;
      isDown.current = { x: pageX, y: pageY };
      const {
        wwwc: { ww, wc },
      } = displayState;
      const wwwc = {
        ww: ww + deltaX,
        wc: wc + deltaY,
      };
      updateDisplayState(id, { wwwc });
    }, 30),
    options,
  );
};

export { useWWWCTool };
