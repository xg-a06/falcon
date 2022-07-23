/* eslint-disable prefer-const */
import { ImageData } from '@falcon/utils';

export interface WWWC {
  ww: number;
  wc: number;
}

const generateLinearVOILUT =
  (windowWidth: number, windowCenter: number): ((param: number) => number) =>
  modalityLutValue =>
    ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;

const generateLinearModalityLUT =
  (slope: number, intercept: number): ((param: number) => number) =>
  storedPixelValue =>
    storedPixelValue * slope + intercept;

const getVoiLUTData = (image: ImageData, wwwc?: WWWC): Uint8ClampedArray => {
  let { minPixelValue, maxPixelValue, windowCenter, windowWidth, slope, intercept } = image;
  if (wwwc !== undefined) {
    windowCenter = wwwc.wc;
    windowWidth = wwwc.ww;
  }
  const length = maxPixelValue - minPixelValue + 1;
  const mlutfn = generateLinearModalityLUT(slope, intercept);
  const vlutfn = generateLinearVOILUT(windowWidth, windowCenter);

  const voiLUT = new Uint8ClampedArray(length);

  let calcFn: (x: number) => number = v => vlutfn(mlutfn(v));
  if (image.color) {
    calcFn = v => vlutfn(v);
  }
  for (let i = 0; i < length; i++) {
    voiLUT[i] = calcFn(minPixelValue + i);
  }

  return voiLUT;
};

export { getVoiLUTData };
