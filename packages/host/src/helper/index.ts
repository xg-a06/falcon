import create, { UseBoundStore, StoreApi, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';

interface Config {
  key: string;
  [key: string]: any;
}

const wrap = <T extends Config>(creater: StateCreator<T, [] | [['zustand/devtools', never]], [], T>, options: { name: string } | undefined) => {
  if (process.env.NODE_ENV === 'development') {
    return create(devtools<T>(creater, options));
  }
  return create<T>(creater);
};

const convertModel = <T>(config: T, set: any): T => {
  const init = Object.entries(config).reduce((tmp, [key, value]) => {
    if (typeof value === 'function') {
      tmp[key] = (...args: Parameters<typeof value>) => set(produce((state: T) => value.apply(state, args)));
      return tmp;
    }
    tmp[key] = value;
    return tmp;
  }, {} as Config);

  return init as unknown as T;
};

const createModel = <T extends Config>(config: T) => {
  const model = wrap<T>(set => convertModel(config, set), { name: config.key });
  return model;
};

export const useModel = <T extends Config>(useStore: UseBoundStore<StoreApi<T>>) =>
  new Proxy(
    {},
    {
      get(_, prop: string) {
        return useStore((state: T) => state[prop]);
      },
    },
  ) as T;

export default createModel;
