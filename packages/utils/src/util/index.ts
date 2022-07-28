import { v4 } from 'uuid';

const uuidV4 = () => v4();

const getElmSize = (elm: HTMLElement): { width: number; height: number } => {
  const { clientWidth, clientHeight } = elm;
  return { width: clientWidth, height: clientHeight };
};

const cloneObjWithoutKeys = (target: Record<string, any>, keys: Array<string>): Record<string, any> => {
  const ret = { ...target };
  keys.forEach(key => delete ret[key]);
  return ret;
};

export { uuidV4, getElmSize, cloneObjWithoutKeys };
