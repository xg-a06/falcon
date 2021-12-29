import { EVENT_TYPES } from '@src/const/eventTypes';
import { ImageData as RenderData } from '@src/loader/imageData';
import Transform from '@src/helper/transform';
import { EventHandler } from '@src/event/tools';
import { mousemoveHandler, mousedownHandler } from '@src/event/mouseEventHandler';

interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  angle: number;
  invert: boolean;
  offset: { x: number; y: number };
  wwwc: { ww: number; wc: number };
}

interface HTMLCanvasElementEx extends HTMLCanvasElement {
  displayState: DisplayState;
  image: RenderData;
  transform: Transform;
  tools: Array<any>;
  refresh: (...args: any[]) => any;
}

const viewportManager = {
  elements: new Map(),
  init() {
    document.addEventListener('mousemove', mousemoveHandler);
  },
  enable(elm: HTMLCanvasElement) {
    const canvas = elm as HTMLCanvasElementEx;
    canvas.dataset.txDicom = '';
    canvas.tools = [];
    this.attachEvent(canvas);
    this.attachListener(canvas);
    this.elements.set(canvas, canvas);
  },
  disable(canvas: HTMLCanvasElement) {
    delete canvas.dataset.txDicom;
    this.elements.delete(canvas);
    this.detachEvent(canvas);
    this.detachListener(canvas);
  },
  attachEvent(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', mousedownHandler);
  },
  detachEvent(canvas: HTMLCanvasElement) {
    canvas.removeEventListener('mousedown', mousedownHandler);
  },
  attachListener(canvas: HTMLCanvasElement) {
    Object.values(EVENT_TYPES).forEach(event => {
      canvas.addEventListener(event, EventHandler);
    });
  },
  detachListener(canvas: HTMLCanvasElement) {
    Object.values(EVENT_TYPES).forEach(event => canvas.removeEventListener(event, EventHandler));
  },
};

viewportManager.init();

export { HTMLCanvasElementEx, DisplayState };

export default viewportManager;
