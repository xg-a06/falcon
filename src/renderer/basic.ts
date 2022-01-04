import { EVENT_TYPES, VIEWPORT_EVENT_TYPES } from '@src/const/eventTypes';
import { ImageData as RenderData } from '@src/loader/imageData';
import getLoader from '@src/loader/index';
import Transform from '@src/helper/transform';
import { HTMLCanvasElementEx, DisplayState, DicomInfo, SeriesInfo } from '@src/viewportsManager';
import { dispatchEvent } from '@src/event/tools';
import { doSetInterval } from '@src/helper/tools';
import { getVoiLUTData, WWWC } from '@src/helper/lut';

export interface RenderOptions {
  elm: HTMLCanvasElement;
  displayState?: Partial<DisplayState>;
  seriesInfo: SeriesInfo;
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
  const scale = Math.min(width / columns, height / rows);
  let ret: DisplayState = { hflip: false, vflip: false, angle: 0, invert: false, offset: { x: 0, y: 0 }, scale, wwwc: { ww: renderData.windowWidth, wc: renderData.windowCenter } };
  ret = { ...ret, ...initDisplayState };
  return ret;
};

const getBeginImages = async (seriesInfo: SeriesInfo) => {
  const { seriesId, count } = seriesInfo;
  const loader = getLoader();
  let img0;
  let img1;
  if (count === 1) {
    img0 = await loader.loadIndex(seriesId, 0);
  } else if (count > 1) {
    img1 = await getLoader().loadIndex(seriesId, 1);
  }
  return [img0, img1];
};

const generateDicomInfo = async (seriesInfo: SeriesInfo, elm: HTMLCanvasElement) => {
  console.log('init dicom info');

  const elmEx = elm as HTMLCanvasElementEx;
  elmEx.dicomInfo = 'loading' as unknown as DicomInfo;
  const imgs = await getBeginImages(seriesInfo);
  const ret: any = {};
  dispatchEvent(elm, VIEWPORT_EVENT_TYPES.DICOM_INFO_CHANGE);
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

const updateElm = (elm: HTMLCanvasElement, transform: Transform, renderData: RenderData, render: (...args: Array<any>) => any) => {
  const elmEx = elm as HTMLCanvasElementEx;
  elmEx.transform = transform;
  elmEx.image = renderData;
  elmEx.refresh = () => render(renderData, { elm });
  elmEx.getImageId = () => renderData.imageId;
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
    dispatchEvent(elm, EVENT_TYPES.RENDERED);
    dispatchEvent(elm, VIEWPORT_EVENT_TYPES.DISPLAY_STATE_CHANGE);
  }
  if (elmEx.needUpdateDisplayState) {
    elmEx.needUpdateDisplayState = false;
    dispatchEvent(elm, VIEWPORT_EVENT_TYPES.DISPLAY_STATE_CHANGE);
  }

  if (!elmEx.dicomInfo) {
    generateDicomInfo('renderData', elm);
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

  updateElm(elm, transform, renderData, basicRender);

  dispatchEvent(elm, EVENT_TYPES.RENDERED);
  return true;
};

export default basicRender;
