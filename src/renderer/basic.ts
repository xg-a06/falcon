/* eslint-disable prefer-const */
import { mat3 } from 'gl-matrix';
import { EVENT_TYPES, VIEWPORT_EVENT_TYPES } from '@src/const/eventTypes';
import { PATIENT_ORIENTATION_MAP } from '@src/const/index';
import { ImageData as RenderData } from '@src/loader/imageData';
import getLoader from '@src/loader/index';
import Transform from '@src/helper/transform';
import { HTMLCanvasElementEx, DisplayState, DicomInfo, SeriesInfo } from '@src/viewportsManager';
import { dispatchEvent } from '@src/event/tools';
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

  let img1;
  const img0 = await loader.getCacheDataByIndex({ seriesId, value: 0 });
  if (count > 1) {
    img1 = await getLoader().getCacheDataByIndex({ seriesId, value: 1 });
  }
  return [img0, img1];
};

const getOrientation = (imgs: Array<RenderData | undefined>, options: any) => {
  const { hflip, vflip, angle } = options;
  let a0 = 'I';
  const {
    instanceNumber: instanceNumber0,
    imagePositionPatient: [, , imagePositionPatientZ0],
  } = imgs[0]!;
  if (imgs[1]) {
    const {
      instanceNumber: instanceNumber1,
      imagePositionPatient: [, , imagePositionPatientZ1],
    } = imgs[1];
    if (instanceNumber0 < instanceNumber1 && imagePositionPatientZ0 > imagePositionPatientZ1) {
      a0 = 'S';
    }
  }
  let { imageOrientationPatient } = imgs[0]!;
  imageOrientationPatient = imageOrientationPatient.map(Math.round);
  const reset = imageOrientationPatient as [number, number, number, number, number, number];
  const source = mat3.fromValues(...reset, 0, 0, 1);

  let result = mat3.scale(mat3.create(), source, [hflip ? -1 : 1, vflip ? -1 : 1]);
  result = mat3.rotate(mat3.create(), result, (angle * Math.PI) / 180);
  let ret = result.map(i => {
    if ((i < 0.000001 && i > 0) || (i > -0.000001 && i < 0) || i === 0) {
      return 0;
    }
    return i;
  });
  const key1 = `${ret[3]}_${ret[4]}_${ret[5]}` as keyof typeof PATIENT_ORIENTATION_MAP;
  const key2 = `${ret[0]}_${ret[1]}_${ret[2]}` as keyof typeof PATIENT_ORIENTATION_MAP;
  const arr1 = PATIENT_ORIENTATION_MAP[key1];
  const arr2 = PATIENT_ORIENTATION_MAP[key2];
  return {
    orientation: [a0, arr1[0], arr2[0], arr1[1], arr2[1]],
    orientationPatient: imgs[0]!.imageOrientationPatient,
  };
};
const generateDicomInfo = async (seriesInfo: SeriesInfo, elm: HTMLCanvasElement) => {
  const elmEx = elm as HTMLCanvasElementEx;
  elmEx.dicomInfo = 'loading' as unknown as DicomInfo;
  let [img0, img1] = await getBeginImages(seriesInfo);
  img0 = img0 as RenderData;
  let { columnPixelSpacing, rowPixelSpacing, sliceThickness: originSliceThickness, spacingBetweenSlices: originSpacingBetweenSlices, imagePositionPatient } = img0;

  if (!originSpacingBetweenSlices && img1) {
    const {
      imagePositionPatient: [, , z1],
    } = img1;
    originSpacingBetweenSlices = Math.abs((z1 - imagePositionPatient[2]) / (img1.instanceNumber - img0.instanceNumber));
  }

  if (!originSliceThickness && originSpacingBetweenSlices) {
    originSliceThickness = originSpacingBetweenSlices;
  }

  const { orientation, orientationPatient } = getOrientation([img0, img1], elmEx.displayState);
  const dicomInfo: DicomInfo = {
    columnPixelSpacing,
    rowPixelSpacing,
    sliceThickness: originSliceThickness,
    spacingBetweenSlices: originSpacingBetweenSlices,
    originSliceThickness,
    originSpacingBetweenSlices,
    imagePositionPatient,
    orientation,
    orientationPatient,
  };

  elmEx.dicomInfo = dicomInfo;
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
  const { elm, displayState = {}, seriesInfo } = options;

  const { width, height } = getElmSize(elm);
  if (width === 0 || height === 0) {
    return false;
  }
  const elmEx = elm as HTMLCanvasElementEx;

  if (!elmEx.displayState) {
    elmEx.initDisplayState = displayState;
    const defaultDisplayState = generateDisplayState(renderData, elm, displayState);
    elmEx.displayState = { ...defaultDisplayState, ...displayState };
    dispatchEvent(elm, EVENT_TYPES.RENDERED);
    dispatchEvent(elm, VIEWPORT_EVENT_TYPES.DISPLAY_STATE_CHANGE);
  }
  if (elmEx.displayStateChanged) {
    elmEx.displayStateChanged = false;
    dispatchEvent(elm, VIEWPORT_EVENT_TYPES.DISPLAY_STATE_CHANGE);
  }
  if (!elmEx.seriesInfo) {
    elmEx.seriesInfo = seriesInfo;
    dispatchEvent(elm, VIEWPORT_EVENT_TYPES.SERIES_INFO_CHANGE);
  }

  if (!elmEx.dicomInfo) {
    generateDicomInfo(elmEx.seriesInfo, elm);
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

  dispatchEvent(elm, EVENT_TYPES.RENDERED, { button: -1 });
  return true;
};

export default basicRender;
