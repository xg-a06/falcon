/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import { ImageData } from '@falcon/utils';

function decode8(metaData: ImageData, pixelData: Uint8Array) {
  const frameData = pixelData;
  const frameSize = metaData.rows * metaData.columns;
  const outFrame = new ArrayBuffer(frameSize * metaData.samplesPerPixel);
  const header = new DataView(frameData.buffer, frameData.byteOffset);
  const data = new Int8Array(frameData.buffer, frameData.byteOffset);
  const out = new Int8Array(outFrame);

  let outIndex = 0;
  const numSegments = header.getInt32(0, true);

  for (let s = 0; s < numSegments; ++s) {
    outIndex = s;

    let inIndex = header.getInt32((s + 1) * 4, true);

    let maxIndex = header.getInt32((s + 2) * 4, true);

    if (maxIndex === 0) {
      maxIndex = frameData.length;
    }

    const endOfSegment = frameSize * numSegments;

    while (inIndex < maxIndex) {
      const n = data[inIndex++];

      if (n >= 0 && n <= 127) {
        // copy n bytes
        for (let i = 0; i < n + 1 && outIndex < endOfSegment; ++i) {
          out[outIndex] = data[inIndex++];
          outIndex += metaData.samplesPerPixel;
        }
      } else if (n <= -1 && n >= -127) {
        const value = data[inIndex++];
        // run of n bytes

        for (let j = 0; j < -n + 1 && outIndex < endOfSegment; ++j) {
          out[outIndex] = value;
          outIndex += metaData.samplesPerPixel;
        }
      } /* else if (n === -128) {

      } // do nothing */
    }
  }
  metaData.pixelData = new Uint8Array(outFrame);

  return metaData;
}

function decode8Planar(metaData: ImageData, pixelData: Uint8Array) {
  const frameData = pixelData;
  const frameSize = metaData.rows * metaData.columns;
  const outFrame = new ArrayBuffer(frameSize * metaData.samplesPerPixel);
  const header = new DataView(frameData.buffer, frameData.byteOffset);
  const data = new Int8Array(frameData.buffer, frameData.byteOffset);
  const out = new Int8Array(outFrame);

  let outIndex = 0;
  const numSegments = header.getInt32(0, true);

  for (let s = 0; s < numSegments; ++s) {
    outIndex = s * frameSize;

    let inIndex = header.getInt32((s + 1) * 4, true);

    let maxIndex = header.getInt32((s + 2) * 4, true);

    if (maxIndex === 0) {
      maxIndex = frameData.length;
    }

    const endOfSegment = frameSize * numSegments;

    while (inIndex < maxIndex) {
      const n = data[inIndex++];

      if (n >= 0 && n <= 127) {
        // copy n bytes
        for (let i = 0; i < n + 1 && outIndex < endOfSegment; ++i) {
          out[outIndex] = data[inIndex++];
          outIndex++;
        }
      } else if (n <= -1 && n >= -127) {
        const value = data[inIndex++];
        // run of n bytes

        for (let j = 0; j < -n + 1 && outIndex < endOfSegment; ++j) {
          out[outIndex] = value;
          outIndex++;
        }
      } /* else if (n === -128) {

      } // do nothing */
    }
  }
  metaData.pixelData = new Uint8Array(outFrame);

  return metaData;
}

function decode16(metaData: ImageData, pixelData: Uint8Array) {
  const frameData = pixelData;
  const frameSize = metaData.rows * metaData.columns;
  const outFrame = new ArrayBuffer(frameSize * metaData.samplesPerPixel * 2);

  const header = new DataView(frameData.buffer, frameData.byteOffset);
  const data = new Int8Array(frameData.buffer, frameData.byteOffset);
  const out = new Int8Array(outFrame);

  const numSegments = header.getInt32(0, true);

  for (let s = 0; s < numSegments; ++s) {
    let outIndex = 0;
    const highByte = s === 0 ? 1 : 0;

    let inIndex = header.getInt32((s + 1) * 4, true);

    let maxIndex = header.getInt32((s + 2) * 4, true);

    if (maxIndex === 0) {
      maxIndex = frameData.length;
    }

    while (inIndex < maxIndex) {
      const n = data[inIndex++];

      if (n >= 0 && n <= 127) {
        for (let i = 0; i < n + 1 && outIndex < frameSize; ++i) {
          out[outIndex * 2 + highByte] = data[inIndex++];
          outIndex++;
        }
      } else if (n <= -1 && n >= -127) {
        const value = data[inIndex++];

        for (let j = 0; j < -n + 1 && outIndex < frameSize; ++j) {
          out[outIndex * 2 + highByte] = value;
          outIndex++;
        }
      } /* else if (n === -128) {

      } // do nothing */
    }
  }
  if (metaData.pixelRepresentation === 0) {
    metaData.pixelData = new Uint16Array(outFrame);
  } else {
    metaData.pixelData = new Int16Array(outFrame);
  }

  return metaData;
}

function decodeRLE(metaData: ImageData, pixelData: Uint8Array): ImageData {
  if (metaData.bitsAllocated === 8) {
    if (metaData.planarConfiguration) {
      return decode8Planar(metaData, pixelData);
    }

    return decode8(metaData, pixelData);
  }
  if (metaData.bitsAllocated === 16) {
    return decode16(metaData, pixelData);
  }

  throw new Error('unsupported pixel format for RLE');
}

export default decodeRLE;
