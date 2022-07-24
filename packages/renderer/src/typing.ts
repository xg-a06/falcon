export interface DisplayState {
  hflip: boolean;
  vflip: boolean;
  scale: number;
  angle: number;
  invert: boolean;
  offset: { x: number; y: number };
  wwwc: { ww: number; wc: number };
}
