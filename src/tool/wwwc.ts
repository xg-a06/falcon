import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/event/tools';
import Base from './base';

class WWWC extends Base {
  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.WWWC;
  }

  touchdown(e: HandlerEvent) {
    console.log(e);
  }
}

export default WWWC;
