import { ToolOptions } from '@falcon/utils';
import createModel from '../helper';

interface Store {
  key: string;
  tools: Record<string, ToolOptions>;
  toolData: Record<string, any>;
}

const viewportsModel = createModel<Store>({
  key: 'tools',
  tools: {},
  toolData: {},
});

export { viewportsModel };
