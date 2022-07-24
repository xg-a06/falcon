/* eslint-disable no-param-reassign */
import { ImageData } from '@falcon/utils';

function decodeLittleEndian(metaData: ImageData, pixelData: Uint8Array): ImageData {
  let arrayBuffer = pixelData.buffer;

  let offset = pixelData.byteOffset;
  const { length } = pixelData;

  if (metaData.bitsAllocated === 16) {
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
  } else if (metaData.bitsAllocated === 8 || metaData.bitsAllocated === 1) {
    metaData.pixelData = pixelData;
  } else if (metaData.bitsAllocated === 32) {
    // if pixel data is not aligned on even boundary, shift it
    if (offset % 2) {
      arrayBuffer = arrayBuffer.slice(offset);
      offset = 0;
    }

    metaData.pixelData = new Float32Array(arrayBuffer, offset, length / 4);
  }

  return metaData;
}

export default decodeLittleEndian;
