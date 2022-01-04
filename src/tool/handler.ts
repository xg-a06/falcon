import { HandlerEvent } from '@src/event/tools';
import { HTMLCanvasElementEx } from '@src/viewportsManager';

import Base from './base';

export interface IPoint {
  x: number;
  y: number;
}
class Handler extends Base {
  handlers: Record<string, IPoint>;

  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.handlers = {};
  }

  // saveData(target: HTMLCanvasElementEx, toolType: valueof<TOOLTYPES>, id, data) {
  //   target.toolsData[toolType];
  // }

  touchup(e: HandlerEvent) {
    console.log(e);
  }

  mousemove(e: HandlerEvent) {
    // 是否碰到了
  }
}

export default Handler;
