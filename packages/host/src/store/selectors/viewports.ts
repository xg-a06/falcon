import { viewportsModel } from '../viewports';
import { useModel } from '../../helper';

const emptyObject = {};
export const useViewport = (id: string) => {
  const { viewports } = useModel(viewportsModel);
  return viewports[id] || emptyObject;
};
