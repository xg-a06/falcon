import { EVENT_TYPES } from '@src/const/eventTypes';
import { dispatchEvent, check } from '@src/event/tools';

const mousemoveHandler = (e: any) => {
  const { target, button } = e;
  const coords = check(target, e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
    button,
  };
  dispatchEvent(e.target, EVENT_TYPES.MOUSEMOVE, detail);
};

const mousedownHandler = (e: any) => {
  const { target, button } = e;
  const coords = check(target, e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
    button,
  };
  dispatchEvent(target, EVENT_TYPES.TOUCHDOWN, detail);

  const touchmoveHandler = (moveEvent: any) => {
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

  const mouseupHandler = (upEvent: any) => {
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
