/* eslint-disable no-fallthrough */
/* eslint-disable no-bitwise */
import dicomParser, { DataSet, readEncapsulatedImageFrame, createJPEGBasicOffsetTable, readEncapsulatedPixelDataFromFragments } from 'dicom-parser';
import { getNumberValues, getNumberValue, stringUTF8, getComporessionState } from '@src/helper/tools';
import decodeLittleEndian from '@src/loader/decoders/decodeLittleEndian';
import decodeBigEndian from '@src/loader/decoders/decodeBigEndian';
import decodeRLE from '@src/loader/decoders/decodeRLE';
import decodeJPEGLS from '@src/loader/decoders/decodeJPEGLS';
import { ImageData, ExtendData } from './imageData';
import Tags from './tagMap';

const getDicomData = (arrayBuffer: ArrayBuffer): DataSet | void => {
  try {
    const byteArray = new Uint8Array(arrayBuffer);
    return dicomParser.parseDicom(byteArray);
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

const getMetaData = (dataSet: DataSet, extendData: ExtendData): ImageData | void => {
  try {
    const pixelSpacing = getNumberValues(dataSet, Tags.ImagerPixelSpacing_CT, 2) || getNumberValues(dataSet, Tags.ImagerPixelSpacing_CR, 2) || [0.5, 0.5];
    const photometricInterpretation = dataSet.string(Tags.PhotometricInterpretation);
    const metaData = {
      byteArray: dataSet.byteArray,
      elements: dataSet.elements,
      transferSyntax: dataSet.string(Tags.TransferSyntaxUID),
      bitsAllocated: dataSet.uint16(Tags.BitsAllocated),
      rows: dataSet.uint16(Tags.Rows),
      columns: dataSet.uint16(Tags.Columns),
      samplesPerPixel: dataSet.uint16(Tags.SamplesperPixel),
      pixelRepresentation: dataSet.uint16(Tags.PixelRepresentation),
      planarConfiguration: dataSet.uint16(Tags.PlanarConfiguration),
      pixelAspectRatio: dataSet.string(Tags.PixelAspectRatio),
      rowPixelSpacing: pixelSpacing[0],
      columnPixelSpacing: pixelSpacing[1],
      slope: dataSet.floatString(Tags.RescaleSlope) || 1,
      intercept: dataSet.floatString(Tags.RescaleIntercept) || 0,
      photometricInterpretation,
      invert: photometricInterpretation === 'MONOCHROME1',
      color: photometricInterpretation === 'RGB',
      minPixelValue: dataSet.uint16(Tags.SmallestImagePixelValue),
      maxPixelValue: dataSet.uint16(Tags.LargestImagePixelValue),
      windowCenter: getNumberValues(dataSet, Tags.WindowCenter, 1)?.[0] || null,
      windowWidth: getNumberValues(dataSet, Tags.WindowWidth, 1)?.[0] || null,
      instanceNumber: dataSet.intString(Tags.InstanceNumber),
      imageOrientationPatient: getNumberValues(dataSet, Tags.PatientOrientation_CT, 6) || getNumberValues(dataSet, Tags.PatientOrientation_CR, 6) || [1, 0, 0, 0, 1, 0],
      imagePositionPatient: getNumberValues(dataSet, Tags.PatientPosition_CT, 3) || getNumberValues(dataSet, Tags.PatientPosition_CR, 3) || [0, 0, 0],
      sliceThickness: getNumberValue(dataSet, Tags.SliceThickness) || 1,
      spacingBetweenSlices: getNumberValue(dataSet, Tags.SpacingBetweenSlices),
      imageCompression: getComporessionState({
        lossyImageCompression: dataSet.string(Tags.LossyImageCompression),
        lossyImageCompressionRatio: dataSet.string(Tags.LossyImageCompressionRatio),
        lossyImageCompressionMethod: dataSet.string(Tags.LossyImageCompressionMethod),
      }),
      studyDate: dataSet.string(Tags.StudyDate),
      studyTime: dataSet.string(Tags.StudyTime),
      seriesNum: dataSet.string(Tags.SeriesNumber),
      accessionNumber: dataSet.string(Tags.AccessionNumber),
      patientId: dataSet.string(Tags.PatientID),
      patientName: stringUTF8(dataSet, Tags.PatientName) || '',
      patientSex: dataSet.string(Tags.PatientSex) || '',
      patientAge: dataSet.string(Tags.PatientAge) || '',
      pixelData: [],
      sizeInBytes: 0,
      ...extendData,
    };

    return metaData;
  } catch (ex) {
    console.log(ex);
  }
  return undefined;
};

const framesAreFragmented = (dataSet: DataSet) => {
  const numberOfFrames = dataSet.intString('x00280008');
  const pixelDataElement = dataSet.elements.x7fe00010;
  return numberOfFrames !== pixelDataElement.fragments?.length;
};

const getEncapsulatedImageFrame = (dataSet: DataSet) => {
  const {
    elements: { x7fe00010: pixelDataElement },
  } = dataSet;
  if (pixelDataElement && pixelDataElement.basicOffsetTable?.length) {
    // Basic Offset Table is not empty
    return readEncapsulatedImageFrame(
      dataSet,
      dataSet.elements.x7fe00010,
      0, // 偏移起始 暂时没有写死0
    );
  }
  // Empty basic offset table
  if (framesAreFragmented(dataSet)) {
    const basicOffsetTable = createJPEGBasicOffsetTable(dataSet, dataSet.elements.x7fe00010);

    return readEncapsulatedImageFrame(
      dataSet,
      dataSet.elements.x7fe00010,
      0, // 偏移起始 暂时没有写死0
      basicOffsetTable,
    );
  }

  return readEncapsulatedPixelDataFromFragments(
    dataSet,
    dataSet.elements.x7fe00010,
    0, // 偏移起始 暂时没有写死0
  );
};

const isBitSet = (byte: any, bitPos: any) => byte & (1 << bitPos);

const unpackBinaryFrame = (byteArray: any, frameOffset: any, pixelsPerFrame: any) => {
  // Create a new pixel array given the image size
  const pixelData = new Uint8Array(pixelsPerFrame);

  for (let i = 0; i < pixelsPerFrame; i++) {
    // Compute byte position
    const bytePos = Math.floor(i / 8);

    // Get the current byte
    const byte = byteArray[bytePos + frameOffset];

    // Bit position (0-7) within byte
    const bitPos = i % 8;

    // Check whether bit at bitpos is set
    pixelData[i] = isBitSet(byte, bitPos) ? 1 : 0;
  }

  return pixelData;
};
const getUncompressedImageFrame = (metaData: ImageData): Uint8Array => {
  const {
    elements: { x7fe00010: pixelDataElement },
    rows,
    columns,
    samplesPerPixel,
    bitsAllocated,
    byteArray,
  } = metaData;

  // 数据偏移
  const pixelDataOffset = pixelDataElement.dataOffset;
  const pixelsPerFrame = rows * columns * samplesPerPixel;

  // 这个是有frameindex偏移计算时候的边界判断 目前没有穿frame需求 暂时没用
  // if (pixelDataOffset >= byteArray.length) {
  //   throw new Error('frame exceeds size of pixelData');
  // }

  if (bitsAllocated === 8) {
    return new Uint8Array(byteArray.buffer, pixelDataOffset, pixelsPerFrame);
  }
  if (bitsAllocated === 16) {
    return new Uint8Array(byteArray.buffer, pixelDataOffset, pixelsPerFrame * 2);
  }
  if (bitsAllocated === 1) {
    return unpackBinaryFrame(byteArray, pixelDataOffset, pixelsPerFrame);
  }
  if (bitsAllocated === 32) {
    return new Uint8Array(byteArray.buffer, pixelDataOffset, pixelsPerFrame * 4);
  }
  return new Uint8Array();
};

const getPixelDataSource = (metaData: ImageData, dataSet: DataSet): Uint8Array | void => {
  const {
    elements: { x7fe00010: pixelDataElement },
  } = dataSet;

  if (!pixelDataElement) {
    return undefined;
  }

  if (pixelDataElement.encapsulatedPixelData) {
    return getEncapsulatedImageFrame(dataSet);
  }

  return getUncompressedImageFrame(metaData);
};

const processDecodeTask = (metaData: ImageData, pixelDataSource: Uint8Array) => {
  const { transferSyntax } = metaData;
  switch (transferSyntax) {
    case '1.2.840.10008.1.2':
    case '1.2.840.10008.1.2.1':
    case '1.2.840.10008.1.2.1.99':
      metaData = decodeLittleEndian(metaData, pixelDataSource);
      break;
    case '1.2.840.10008.1.2.2':
      metaData = decodeBigEndian(metaData, pixelDataSource);
      break;
    case '1.2.840.10008.1.2.5':
      metaData = decodeRLE(metaData, pixelDataSource);
      break;
    case '1.2.840.10008.1.2.4.80':
      // JPEG-LS Lossless Image Compression
      metaData = decodeJPEGLS(metaData, pixelDataSource);
      break;
    default:
      break;
  }
  return metaData;
};

const createImage = (metaData: ImageData, pixelDataSource: Uint8Array): ImageData | void => {
  let result;
  const { transferSyntax } = metaData;
  switch (transferSyntax) {
    // Implicit VR Little Endian
    case '1.2.840.10008.1.2':
    // Explicit VR Little Endian
    case '1.2.840.10008.1.2.1':
    // Explicit VR Big Endian (retired)
    case '1.2.840.10008.1.2.2':
    // Deflate transfer syntax (deflated by dicomParser)
    case '1.2.840.10008.1.2.1.99':
    // RLE Lossless
    case '1.2.840.10008.1.2.5':
    // JPEG-LS Lossless Image Compression
    case '1.2.840.10008.1.2.4.80':
      result = processDecodeTask(metaData, pixelDataSource);
      break;
    default:
      console.log(`No decoder for transfer syntax ${transferSyntax}`);
      // result = new Promise((resolve, reject) => {
      //   reject(new Error(`No decoder for transfer syntax ${transferSyntax}`));
      // });
      break;
  }
  return result;
};

function getPixelValues(pixelData: Array<number>) {
  let minPixelValue = Number.MAX_VALUE;
  let maxPixelValue = Number.MIN_VALUE;
  const len = pixelData.length;
  let pixel;

  for (let i = 0; i < len; i++) {
    pixel = pixelData[i];
    minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
    maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
  }

  return {
    minPixelValue,
    maxPixelValue,
  };
}

const postprocessor = (metaData: ImageData) => {
  metaData.sizeInBytes = metaData.pixelData.byteLength;
  if (!metaData.minPixelValue || !metaData.maxPixelValue) {
    const pixelValues = getPixelValues(metaData.pixelData);
    metaData.minPixelValue = pixelValues.minPixelValue;
    metaData.maxPixelValue = pixelValues.maxPixelValue;
  }
  // if (metaData.pixelData instanceof Float32Array) {
  //   throw new Error('Float32Array pixel data not handle');
  // } else {
  // metaData.getPixelData = () => metaData.pixelData;
  // }
  delete metaData.elements;
  delete metaData.byteArray;

  return metaData;
};
const parserDicom = (arrayBuffer: ArrayBuffer, extendData: ExtendData): ImageData | void => {
  const dicomData = getDicomData(arrayBuffer);
  if (!dicomData) {
    return undefined;
  }
  let metaData = getMetaData(dicomData, extendData);
  if (!metaData) {
    return undefined;
  }

  const pixelDataSource = getPixelDataSource(metaData, dicomData);
  if (!pixelDataSource) {
    return undefined;
  }
  // 解码得到pixelData
  metaData = createImage(metaData, pixelDataSource);
  if (!metaData) {
    return undefined;
  }
  const image = postprocessor(metaData);

  return image;
};

export { parserDicom };
