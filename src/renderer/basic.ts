import { EVENT_TYPES } from '@src/const/eventTypes';
import { ImageData as RenderData } from '@src/loader/imageData';
import Transform from '@src/helper/transform';
import { HTMLCanvasElementEx, DisplayState, dispatchEvent } from '@src/viewportsManager';
import { getVoiLUTData, WWWC } from '@src/helper/lut';

export interface RenderOptions {
  elm: HTMLCanvasElement;
  displayState: DisplayState;
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

const generateImageData = (renderData: RenderData, wwwc?: WWWC): ImageData => {
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
  // const autoScale = Math.min(canvas.width / renderCanvas.width, canvas.height / renderCanvas.height);
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
  const { elm, displayState } = options;
  const { offset, angle, scale, hflip, vflip, wwwc } = displayState;
  const imageData = generateImageData(renderData, wwwc);
  const { columns, rows } = renderData;
  const renderCanvas = generateRenderCanvas(columns, rows, imageData);

  const { width, height } = getElmSize(elm);
  if (width === 0 || height === 0) {
    return false;
  }

  const ctx = elm.getContext('2d') as CanvasRenderingContext2D;
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
  const transform = setTransform(ctx!, transformOptions);

  ctx.drawImage(renderCanvas, 0, 0, columns, rows, 0, 0, columns, rows);

  const elmEx = elm as HTMLCanvasElementEx;
  elmEx.transform = transform;
  elmEx.image = renderData;
  elmEx.displayState = displayState;
  elmEx.renderer = basicRender;

  dispatchEvent(elm, EVENT_TYPES.RENDERED);
  return true;
};

export default basicRender;
