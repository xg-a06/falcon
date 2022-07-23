import { EVENT_TYPES } from './const';
import { dispatchEvent, check } from './tools';

interface MouseEventEx extends MouseEvent {
  target: HTMLCanvasElement;
}

const mousemoveHandler = (e: MouseEvent) => {
  const { target, button } = e as MouseEventEx;
  const coords = check(target, e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
    button,
  };
  dispatchEvent(e.target as HTMLCanvasElement, EVENT_TYPES.MOUSEMOVE, detail);
};

const mousedownHandler = (e: MouseEvent) => {
  const { target, button } = e as MouseEventEx;
  const coords = check(target, e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
    button,
  };
  dispatchEvent(target, EVENT_TYPES.TOUCHDOWN, detail);

  const touchmoveHandler = (moveEvent: MouseEvent) => {
    const moveCoords = check(target, moveEvent);
    if (moveCoords === false) {
      return;
    }
    const moveDetail = {
      coords: moveCoords,
      button,
    };

    dispatchEvent(target, EVENT_TYPES.TOUCHMOVE, moveDetail);
  };

  const mouseupHandler = (upEvent: MouseEvent) => {
    const upCoords = check(target, upEvent);
    if (upCoords === false) {
      return;
    }
    const upDetail = {
      coords: upCoords,
      button,
    };
    dispatchEvent(target, EVENT_TYPES.TOUCHUP, upDetail);
    document.removeEventListener('mousemove', touchmoveHandler);
    document.removeEventListener('mouseup', mouseupHandler);
  };

  document.addEventListener('mousemove', touchmoveHandler);
  document.addEventListener('mouseup', mouseupHandler);
};

export { mousemoveHandler, mousedownHandler };
