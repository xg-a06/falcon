import { EVENT_TYPES } from '@src/const/eventTypes';
import { dispatchEvent, check } from '@src/event/tools';

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

const mousedownHandler = (e: any) => {
  const coords = check(e);
  if (coords === false) {
    return;
  }
  const detail = {
    coords,
  };
  dispatchEvent(e.target, EVENT_TYPES.TOUCHDOWN, detail);
};

export { mousemoveHandler, mousedownHandler };
