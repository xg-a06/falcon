import { toolsModel } from '../tools';
import { useModel } from '../../helper';

export const useToolData = (id: string, toolType?: string) => {
  const { toolsData } = useModel(toolsModel);

  return (toolType && toolsData[id]?.[toolType]) || toolsData[id];
};
