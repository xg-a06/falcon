import { useRef, RefObject } from 'react';
import { useThrottle } from '@falcon/utils';
import { useModel, viewportsModel, useViewport } from '@falcon/host';
import useCompositeEvent from './helper/useCompositeEvent';
import { EVENT_TYPES } from './helper/const';
import { HandlerEvent } from './helper/tools';

const useWWWCTool = (id: string, target: RefObject<HTMLCanvasElement>) => {
  const isDown = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { updateDisplayState } = useModel(viewportsModel);
  const { displayState } = useViewport(id);

  useCompositeEvent(target, EVENT_TYPES.TOUCHDOWN, (e: HandlerEvent) => {
    const {
      coords: { pageX, pageY },
    } = e.detail;
    isDown.current = { x: pageX, y: pageY };
  });

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
  );
};

export { useWWWCTool };
