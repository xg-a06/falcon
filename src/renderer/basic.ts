import { RenderFunction } from '@src/viewport/base';
import { ImageData as RenderData } from '@src/loader/imageData';

const basicRender: RenderFunction = (renderData: RenderData): ImageData => {
  const { columns, rows, pixelData, minPixelValue } = renderData;
  const imageData = new ImageData(columns, rows);
  let imageDataIndex = 3;
  const numPixels = columns * columns;
  const offset = 0;
  const lut: Array<number> = [];
  let i = 0;
  while (i < numPixels) {
    imageData.data[imageDataIndex] = Math.abs(offset - lut[pixelData[i++] + -minPixelValue]);
    imageDataIndex += 4;
  }
  return imageData;
};

export default basicRender;
