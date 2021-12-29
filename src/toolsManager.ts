import TOOL_TYPES, { TOOLTYPES } from '@src/const/toolTypes';
import { HTMLCanvasElementEx } from '@src/viewportsManager';

import WWWC from '@src/tool/wwwc';
import SCALE from '@src/tool/scale';
import Length from '@src/tool/length';

type Constructor<T> = new (...args: any[]) => T;

const toolConstructors: Record<string, Constructor<any>> = {
  [TOOL_TYPES.WWWC]: WWWC,
  [TOOL_TYPES.SCALE]: SCALE,
  [TOOL_TYPES.LENGTH]: Length,
};

const toolsManager = {
  stateHandler(elm: HTMLCanvasElement, state: number, toolType: valueof<TOOLTYPES>, options: any = {}) {
    const canvas = elm as HTMLCanvasElementEx;
    let targetTool = canvas.tools.find(tool => tool.toolType === toolType);
    if (targetTool === undefined) {
      targetTool = new toolConstructors[toolType](options);
      canvas.tools.push(targetTool);
    }
    targetTool.level = state;
    const { refresh } = canvas;
    if (refresh) {
      refresh();
    }
  },
  activeTool(elm: HTMLCanvasElement, toolType: valueof<TOOLTYPES>, options: any = {}) {
    this.stateHandler(elm, 3, toolType, options);
  },
  passiveTool(elm: HTMLCanvasElement, toolType: valueof<TOOLTYPES>, options: any = {}) {
    this.stateHandler(elm, 2, toolType, options);
  },
  enableTool(elm: HTMLCanvasElement, toolType: valueof<TOOLTYPES>, options: any = {}) {
    this.stateHandler(elm, 1, toolType, options);
  },
  disableTool(elm: HTMLCanvasElement, toolType: valueof<TOOLTYPES>, options: any = {}) {
    this.stateHandler(elm, 0, toolType, options);
  },
};

export default toolsManager;
