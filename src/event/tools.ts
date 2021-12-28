import { EVENT_LEVELS } from '@src/const/eventTypes';
import { Coords } from '@src/toolsManager';

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
  target.tools.forEach((tool: any) => {
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

export { HandlerEvent, EventHandler, dispatchEvent, check };
