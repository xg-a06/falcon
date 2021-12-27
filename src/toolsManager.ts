import TOOL_TYPES, { TOOLTYPES } from '@src/const/toolTypes';
import { HTMLCanvasElementEx } from '@src/viewportsManager';

import WWWC from '@src/tool/wwwc';

export interface Coords {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  imageX: number;
  imageY: number;
  isInValidArea: boolean;
}

type Constructor<T> = new (...args: any[]) => T;

const toolConstructors: Record<string, Constructor<any>> = {
  [TOOL_TYPES.WWWC]: WWWC,
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
    const { image, renderer, displayState } = canvas;
    if (renderer) {
      renderer(image, displayState);
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

// const enableTool = (canvas, toolType) => {};

// const disableTool = (canvas, toolType) => {};

// const passiveTool = (canvas, toolType) => {};

// const activeTool = (canvas, toolType, which) => {};

// export { enable, enableTool, disableTool, passiveTool, activeTool };
export default toolsManager;
