/* eslint-disable no-param-reassign */
const eventMap = Symbol('eventMap');
type FnCallback = (args: any) => void;

class EventEmitter {
  [eventMap]: Map<string, Array<FnCallback>> = new Map();

  on(eventNames: string, fn: FnCallback): EventEmitter {
    if (!eventNames) {
      return this;
    }
    let events = [eventNames];
    if (Array.isArray(eventNames)) {
      events = eventNames;
    }
    events.forEach(eventName => {
      if (this[eventMap].has(eventName)) {
        this[eventMap].get(eventName)!.push(fn);
      } else {
        this[eventMap].set(eventName, [fn]);
      }
    });
    return this;
  }

  off(eventName: string, fn: FnCallback) {
    if (eventName === undefined) {
      this[eventMap].clear();
    } else if (this[eventMap].has(eventName)) {
      if (fn === undefined) {
        this[eventMap].delete(eventName);
      } else {
        const fns = this[eventMap].get(eventName);
        if (fns !== undefined) {
          const index = fns.indexOf(fn);
          if (index !== -1) {
            fns.splice(index, 1);
          }
        }
      }
    }
    return this;
  }

  once(eventName: string, fn: FnCallback) {
    this.on(eventName, (...args) => {
      this.off(eventName, fn);
      fn.apply(this, args);
    });
    return this;
  }

  emit({ eventName, eventData }: { eventName: string; eventData: any }) {
    if (this[eventMap].has(eventName)) {
      eventData.eventName = eventName;
      this[eventMap].get(eventName)!.forEach(fn => {
        fn.call(this, eventData);
      });
      return true;
    }
    return false;
  }
}

export default EventEmitter;
