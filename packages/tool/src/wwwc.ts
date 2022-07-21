import { useRef, RefObject } from 'react';
import { useEventListener, useThrottle } from '@falcon/utils';
import { useModel, viewportsModel, useViewport } from '@falcon/host';

const useWWWCTool = (id: string, target: RefObject<HTMLCanvasElement>) => {
  const isDown = useRef<{ x: number; y: number }>();

  const { updateDisplayState } = useModel(viewportsModel);
  const { displayState } = useViewport(id);

  useEventListener(target, 'mousedown', (e: Event) => {
    const { pageX, pageY } = e as MouseEvent;
    isDown.current = { x: pageX, y: pageY };
  });

  useEventListener(
    target,
    'mousemove',
    useThrottle((e: Event) => {
      if (!isDown.current) {
        return;
      }
      const { pageX, pageY } = e as MouseEvent;
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

  useEventListener(target, 'mouseup', () => {
    isDown.current = undefined;
  });
};

export { useWWWCTool };
