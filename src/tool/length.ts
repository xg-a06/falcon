import TOOL_TYPES from '@src/const/toolTypes';
import { HandlerEvent } from '@src/event/tools';
import { HTMLCanvasElementEx } from '@src/viewportsManager';
import { addQueue } from '@src/scheduler';
import Handler, { IPoint } from './handler';

class Length extends Handler {
  constructor(target: HTMLCanvasElement, options: any) {
    super(target, options);
    this.toolType = TOOL_TYPES.LENGTH;
  }

  rendered(e: HandlerEvent) {
    const target = e.target as HTMLCanvasElementEx;
    const { start, end } = this.handlers;
    if (start && end) {
      this.draw(target, start, end);
    }
  }

  touchdown(e: HandlerEvent) {
    const {
      coords: { offsetX, offsetY },
    } = e.detail;
    this.handlers.start = { x: offsetX, y: offsetY };
  }

  touchmove(e: HandlerEvent) {
    const target = e.target as HTMLCanvasElementEx;
    const {
      coords: { offsetX, offsetY },
    } = e.detail;
    this.handlers.end = { x: offsetX, y: offsetY };
    const { refresh } = target;
    addQueue(refresh);
  }

  isHoverTool(e: HandlerEvent) {
    console.log('isHoverTool', e);
  }

  draw(canvas: HTMLCanvasElementEx, start: IPoint, end: IPoint) {
    const ctx = this.getContext(canvas);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke();
  }
}

export default Length;
