import { TOOL_STATES, BUTTON_TYPES } from './const';

export type ToolOptions = {
  state: typeof TOOL_STATES[keyof typeof TOOL_STATES];
  button: typeof BUTTON_TYPES[keyof typeof BUTTON_TYPES];
  handler?: {
    r: number;
  };
  activeDistance?: number;
  style?: {
    fontSize: number;
    fontFamliy: string;
    lineWidth: number;
    fontColor: string;
    activeFontColor: string;
    strokeColor: string;
    activeStrokeColor: string;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
  };
};
