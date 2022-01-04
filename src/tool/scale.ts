/* eslint-disable no-restricted-properties */
import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/event/tools';
import { HTMLCanvasElementEx } from '@src/viewportsManager';
import { addQueue } from '@src/scheduler';
import Base from './base';

class WWWC extends Base {
  point: number;

  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.SCALE;
    this.point = 0;
  }

  touchdown(e: HandlerEvent) {
    const {
      coords: { pageY },
    } = e.detail;
    this.point = pageY;
  }

  touchmove(e: HandlerEvent) {
    const target = e.target as HTMLCanvasElementEx;
    const {
      coords: { pageY },
    } = e.detail;
    const { displayState, refresh } = target;
    let { scale: tmpScale } = displayState;
    const stepY = pageY - this.point;
    this.point = pageY;

    const ticks = stepY / 200;
    const pow = 1.7;
    const oldFactor = Math.log(tmpScale) / Math.log(pow);
    const factor = oldFactor + ticks;
    tmpScale = Math.pow(pow, factor);
    displayState.scale = tmpScale;
    target.needUpdateDisplayState = true;

    addQueue(refresh);
  }
}

export default WWWC;
