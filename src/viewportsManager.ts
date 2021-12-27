import { EVENT_TYPES, EVENT_LEVELS } from '@src/const/eventTypes';
import { ImageData as RenderData } from '@src/loader/imageData';
import Transform from '@src/helper/transform';
import { Coords } from '@src/toolsManager';

interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  angle: number;
  invert: boolean;
  offset: { x: number; y: number };
  wwwc?: { ww: number; wc: number };
}

interface HTMLCanvasElementEx extends HTMLCanvasElement {
  displayState: DisplayState;
  image: RenderData;
  transform: Transform;
  tools: Array<any>;
  renderer: (...args: any[]) => any;
}

interface HandlerEvent extends Event {
  target: HTMLCanvasElementEx;
  detail: {
    coords: Coords;
  };
}

const getAction = (eventName: string) => {
  const tmp = eventName.toLocaleLowerCase().split('_');
  return tmp[tmp.length - 1];
};

const analysisCoords = (e: any): Coords | boolean => {
  const { clientX, clientY, target } = e;
  const { image, transform } = target;
  if (!image) {
    return false;
  }
  const { columns, rows } = image;
  const { left, top } = target.getBoundingClientRect();
  const offsetX = clientX - left;
  const offsetY = clientY - top;
  const { x: imageX, y: imageY } = transform.invertPoint(offsetX, offsetY);

  const isInValidArea = !(imageX < 0 || imageX >= columns || imageY < 0 || imageY >= rows);

  return {
    clientX,
    clientY,
    offsetX,
    offsetY,
    imageX,
    imageY,
    isInValidArea,
  };
};

const EventHandler = (e: Event) => {
  const event = e as HandlerEvent;
  const { type, target } = event;
  const action = getAction(type);
  target.tools.forEach(tool => {
    if (tool.level >= EVENT_LEVELS[type] && tool[action]) {
      tool[action](e);
    }
  });
};

const dispatchEvent = (target: HTMLCanvasElement, eventName: string, detail: any = {}) => {
  const event = new CustomEvent(eventName, { detail });
  target.dispatchEvent(event);
};

const check = (e: any) => {
  if (!e.target.matches('[data-tx-dicom]')) {
    return false;
  }
  const coords = analysisCoords(e);
  if (coords === false) {
    return false;
  }
  return coords;
};

const mousemoveHandler = (e: any) => {
  const coords = check(e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
  };
  dispatchEvent(e.target, EVENT_TYPES.MOUSEMOVE, detail);
};

// const mouseupHandler = (e: any) => {
//   dispatchEvent(e.target, EVENT_TYPES.TOUCHUP);
// };

const mousedown = (e: any) => {
  const coords = check(e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
  };
  dispatchEvent(e.target, EVENT_TYPES.TOUCHDOWN, detail);
};

const viewportManager = {
  elements: new Map(),
  init() {
    document.addEventListener('mousemove', mousemoveHandler);
    // document.addEventListener('mouseup', mouseupHandler);
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
    canvas.addEventListener('mousedown', mousedown);
  },
  detachEvent(canvas: HTMLCanvasElement) {
    canvas.removeEventListener('mousedown', mousedown);
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

export { HTMLCanvasElementEx, DisplayState, HandlerEvent, dispatchEvent };

export default viewportManager;
