import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/viewportsManager';
import Base from './base';

class WWWC extends Base {
  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.WWWC;
  }

  rendered(e: HandlerEvent) {
    console.log(e);
  }

  touchdown(e: HandlerEvent) {
    console.log(e);
  }

  touchmove(e: HandlerEvent) {
    console.log(e);
  }

  touchup(e: HandlerEvent) {
    console.log(e);
  }

  mousemove(e: HandlerEvent) {
    // 是否碰到了
    const { target } = e;
    console.log(target.displayState);
  }
}

export default WWWC;
