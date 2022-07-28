import { ToolOptions } from '@falcon/utils';
import createModel from '../helper';

interface Store {
  key: string;
  tools: Record<string, ToolOptions>;
  toolsData: Record<string, any>;
  updateToolData(toolType: string, id: string, data: Record<string, any>): void;
}

const toolsModel = createModel<Store>({
  key: 'tools',
  tools: {},
  toolsData: {},
  updateToolData(id, tooltype, data) {
    if (!this.toolsData[id]) {
      this.toolsData[id] = {};
    }
    this.toolsData[id][tooltype] = data;
  },
});

export { toolsModel };
