import { HTMLCanvasElementEx } from '@falcon/utils';
import { BUTTON_TYPES } from './const';

interface Coords {
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  imageX: number;
  imageY: number;
  isInValidArea?: boolean;
}

interface HandlerEvent extends Event {
  target: HTMLCanvasElement;
  detail: {
    coords: Coords;
    button: typeof BUTTON_TYPES[keyof typeof BUTTON_TYPES];
  };
}

const analysisCoords = (target: HTMLCanvasElement, e: MouseEvent): Coords | boolean => {
  const { pageX, pageY, clientX, clientY } = e;
  const { transform } = target as HTMLCanvasElementEx;

  const { left, top } = target.getBoundingClientRect();
  const offsetX = pageX - left;
  const offsetY = pageY - top;
  const { x: imageX, y: imageY } = transform.invertPoint(offsetX, offsetY);

  return {
    pageX,
    pageY,
    clientX,
    clientY,
    offsetX,
    offsetY,
    imageX,
    imageY,
  };
};

const dispatchEvent = (target: HTMLCanvasElement, eventName: string, detail: any = {}) => {
  const event = new CustomEvent(eventName, { detail });
  target.dispatchEvent(event);
};

const check = (target: HTMLCanvasElement, e: MouseEvent) => {
  if (!target.matches('[viewport]')) {
    return false;
  }
  const coords = analysisCoords(target, e);
  if (coords === false) {
    return false;
  }
  return coords;
};

export { HandlerEvent, dispatchEvent, check };
