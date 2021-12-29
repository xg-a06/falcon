import { EVENT_TYPES } from '@src/const/eventTypes';
import { ImageData as RenderData } from '@src/loader/imageData';
import Transform from '@src/helper/transform';
import { HTMLCanvasElementEx, DisplayState } from '@src/viewportsManager';
import { dispatchEvent } from '@src/event/tools';
import { getVoiLUTData, WWWC } from '@src/helper/lut';

export interface RenderOptions {
  elm: HTMLCanvasElement;
  displayState?: Partial<DisplayState>;
}

type RenderFunction = (renderData: RenderData, options: RenderOptions) => boolean;
// interface RenderFunction {
//   (renderData: RenderData, displayState: DisplayState): ImageData;
// }

interface TransformOptions extends Pick<DisplayState, 'offset' | 'angle' | 'scale' | 'hflip' | 'vflip'> {
  canvasWidth: number;
  canvasHeight: number;
  renderCanvasWidth: number;
  renderCanvasHeight: number;
}

const getElmSize = (elm: HTMLElement): { width: number; height: number } => {
  const { clientWidth, clientHeight } = elm;
  return { width: clientWidth, height: clientHeight };
};

const generateDisplayState = (renderData: RenderData, elm: HTMLCanvasElement, initDisplayState: Partial<DisplayState>) => {
  const { width, height } = getElmSize(elm);
  const { columns, rows } = renderData;
  const ret: DisplayState = { hflip: false, vflip: false, angle: 0, invert: false, offset: { x: 0, y: 0 }, scale: 1, wwwc: { ww: 0, wc: 0 } };
  ret.wwwc = {
    ww: initDisplayState.wwwc?.ww || renderData.windowWidth,
    wc: initDisplayState.wwwc?.wc || renderData.windowCenter,
  };
  ret.scale = Math.min(width / columns, height / rows);
  return ret;
};

const generateImageData = (renderData: RenderData, wwwc: WWWC): ImageData => {
  const { columns, rows, pixelData, minPixelValue } = renderData;
  const imageData = new ImageData(columns, rows);
  const numPixels = columns * columns;
  const offset = 0;
  const lut = getVoiLUTData(renderData, wwwc);
  let imageDataIndex = 0;
  let i = 0;
  while (i < numPixels) {
    imageData.data[imageDataIndex++] = 255;
    imageData.data[imageDataIndex++] = 255;
    imageData.data[imageDataIndex++] = 255;
    imageData.data[imageDataIndex++] = Math.abs(offset - lut[pixelData[i++] + -minPixelValue]);
  }
  return imageData;
};

const generateRenderCanvas = (width: number, height: number, imageData: ImageData): HTMLCanvasElement => {
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = width;
  renderCanvas.height = height;
  const ctx = renderCanvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);
  return renderCanvas;
};

const setTransform = (ctx: CanvasRenderingContext2D, transformOptions: TransformOptions): Transform => {
  const { canvasWidth, canvasHeight, renderCanvasWidth, renderCanvasHeight, offset, angle, scale, hflip, vflip } = transformOptions;
  const transform = new Transform();
  transform.reset();
  transform.translate(offset.x, offset.y);
  transform.translate(canvasWidth / 2, canvasHeight / 2);
  transform.scale(scale, scale);
  transform.rotate(angle);
  transform.scale(hflip ? -1 : 1, vflip ? -1 : 1);
  transform.translate(-renderCanvasWidth / 2, -renderCanvasHeight / 2);
  ctx.setTransform(transform.mat[0], transform.mat[1], transform.mat[2], transform.mat[3], transform.mat[4], transform.mat[5]);

  return transform;
};

const basicRender: RenderFunction = (renderData: RenderData, options: RenderOptions): boolean => {
  if (!renderData) {
    return false;
  }
  const { elm, displayState = {} } = options;

  const { width, height } = getElmSize(elm);
  if (width === 0 || height === 0) {
    return false;
  }
  const elmEx = elm as HTMLCanvasElementEx;

  if (!elmEx.displayState) {
    const defaultDisplayState = generateDisplayState(renderData, elm, displayState);
    elmEx.displayState = { ...defaultDisplayState, ...displayState };
  }

  const { offset, angle, scale, hflip, vflip, wwwc } = elmEx.displayState;
  const imageData = generateImageData(renderData, wwwc);
  const { columns, rows } = renderData;
  const renderCanvas = generateRenderCanvas(columns, rows, imageData);

  const ctx = elm.getContext('2d') as CanvasRenderingContext2D;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  const transformOptions: TransformOptions = {
    canvasWidth: width,
    canvasHeight: height,
    renderCanvasWidth: columns,
    renderCanvasHeight: rows,
    offset,
    angle,
    scale,
    hflip,
    vflip,
  };
  const transform = setTransform(ctx, transformOptions);

  ctx.drawImage(renderCanvas, 0, 0, columns, rows, 0, 0, columns, rows);
  elmEx.transform = transform;
  elmEx.image = renderData;
  elmEx.refresh = () => basicRender(elmEx.image, { elm });

  dispatchEvent(elm, EVENT_TYPES.RENDERED);
  return true;
};

export default basicRender;
