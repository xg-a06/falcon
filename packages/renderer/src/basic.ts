import { ImageData as RenderData, HTMLCanvasElementEx, getElmSize } from '@falcon/utils';
import { getVoiLUTData, WWWC, setTransform } from './helper';
import { DisplayState } from './typing';

interface RenderOptions {
  elm: HTMLCanvasElementEx;
  displayState: DisplayState;
}

type RenderFunction = (renderData: RenderData | undefined, options: RenderOptions) => boolean;

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

const basicRender: RenderFunction = (renderData, options) => {
  if (renderData === undefined) {
    return false;
  }
  const { elm, displayState } = options;

  const { width, height } = getElmSize(elm);
  if (width === 0 || height === 0) {
    return false;
  }

  const { offset, angle, scale, hflip, vflip, wwwc } = displayState;
  const imageData = generateImageData(renderData, wwwc);
  const { columns, rows } = renderData;
  const renderCanvas = generateRenderCanvas(columns, rows, imageData);

  const ctx = elm.getContext('2d') as CanvasRenderingContext2D;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  const transformOptions = {
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

  setTransform(elm, transformOptions);

  ctx.drawImage(renderCanvas, 0, 0, columns, rows, 0, 0, columns, rows);

  return true;
};

export { basicRender, RenderFunction };
