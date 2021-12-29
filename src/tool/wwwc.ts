import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/event/tools';
import { HTMLCanvasElementEx } from '@src/viewportsManager';
import Base from './base';

class WWWC extends Base {
  points: { x: number; y: number };

  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.WWWC;
    this.points = { x: 0, y: 0 };
  }

  touchdown(e: HandlerEvent) {
    const {
      coords: { pageX, pageY },
    } = e.detail;
    this.points = { x: pageX, y: pageY };
    console.log(e.target, e.detail.coords);
  }

  touchmove(e: HandlerEvent) {
    const target = e.target as HTMLCanvasElementEx;
    const { x, y } = this.points;
    const {
      coords: { pageX, pageY },
    } = e.detail;
    const deltaX = pageX - x;
    const deltaY = pageY - y;
    this.points = { x: pageX, y: pageY };
    const { displayState, refresh } = target;
    displayState.wwwc!.ww += deltaX;
    displayState.wwwc!.wc += deltaY;
    console.log('displayState.wwwc', displayState.wwwc);

    refresh();
  }
}

export default WWWC;