import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/event/tools';
import Handler from './handler';

class Length extends Handler {
  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.WWWC;
  }

  isHoverTool(e: HandlerEvent) {
    console.log('isHoverTool', e);
  }
}

export default Length;
