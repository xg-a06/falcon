/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import { ImageData } from '../client/imageData';

function swap16(val: any) {
  return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

function decodeBigEndian(metaData: ImageData, pixelData: Uint8Array): ImageData {
  if (metaData.bitsAllocated === 16) {
    let arrayBuffer = pixelData.buffer;

    let offset = pixelData.byteOffset;
    const { length } = pixelData;
    // if pixel data is not aligned on even boundary, shift it so we can create the 16 bit array
    // buffers on it

    if (offset % 2) {
      arrayBuffer = arrayBuffer.slice(offset);
      offset = 0;
    }

    if (metaData.pixelRepresentation === 0) {
      metaData.pixelData = new Uint16Array(arrayBuffer, offset, length / 2);
    } else {
      metaData.pixelData = new Int16Array(arrayBuffer, offset, length / 2);
    }
    // Do the byte swap
    for (let i = 0; i < metaData.pixelData.length; i += 1) {
      metaData.pixelData[i] = swap16(metaData.pixelData[i]);
    }
  } else if (metaData.bitsAllocated === 8) {
    metaData.pixelData = pixelData;
  }

  return metaData;
}

export default decodeBigEndian;
