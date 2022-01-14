import { EVENT_LEVELS } from '@src/const/eventTypes';
import { HTMLCanvasElementEx } from '@src/viewportsManager';

interface Coords {
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  imageX: number;
  imageY: number;
  isInValidArea: boolean;
}

interface HandlerEvent extends Event {
  target: HTMLCanvasElementEx;
  detail: {
    coords: Coords;
    button: number;
  };
}

const getAction = (eventName: string) => {
  const tmp = eventName.toLocaleLowerCase().split('_');
  return tmp[tmp.length - 1];
};

const analysisCoords = (target: any, e: any): Coords | boolean => {
  const { pageX, pageY, clientX, clientY } = e;
  const { image, transform } = target;
  if (!image) {
    return false;
  }
  const { columns, rows } = image;
  const { left, top } = target.getBoundingClientRect();
  const offsetX = pageX - left;
  const offsetY = pageY - top;
  const { x: imageX, y: imageY } = transform.invertPoint(offsetX, offsetY);

  const isInValidArea = !(imageX < 0 || imageX >= columns || imageY < 0 || imageY >= rows);

  return {
    pageX,
    pageY,
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

  target.tools.forEach((tool: any) => {
    if (tool.level >= EVENT_LEVELS[type] && tool[action] && (event.detail.button === -1 || event.detail.button === tool.button)) {
      tool[action](e);
    }
  });
};

const dispatchEvent = (target: HTMLCanvasElement, eventName: string, detail: any = {}) => {
  const event = new CustomEvent(eventName, { detail });
  target.dispatchEvent(event);
};

const check = (target: any, e: any) => {
  if (!target.matches('[data-tx-dicom]')) {
    return false;
  }
  const coords = analysisCoords(target, e);
  if (coords === false) {
    return false;
  }
  return coords;
};

export { HandlerEvent, EventHandler, dispatchEvent, check };
