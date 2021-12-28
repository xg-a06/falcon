import { HandlerEvent } from '@src/event/tools';
import Base from './base';

class Handler extends Base {
  handlers: Array<number>;

  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.handlers = [];
  }

  mousemove(e: HandlerEvent) {
    // 是否碰到了
    const { target } = e;
    console.log(target.displayState);
  }
}

export default Handler;
