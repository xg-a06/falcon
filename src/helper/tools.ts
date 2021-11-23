function debounce(fun: any, delay: number, ctx?: any) {
  return (...args: Array<any>): void => {
    const context = ctx || {};
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.apply(context, args);
    }, delay);
  };
}

function throttle(fun: any, delay: number, ctx?: any): any {
  let last = 0;
  return function (...args: Array<any>) {
    const _this = ctx || {};
    const now = new Date() as unknown as number;
    if (now - last > delay) {
      fun.apply(_this, args);
      last = now;
    }
  };
}

function getNumberValues(dataSet: any, tag: string, minimumLength = 0): any {
  const values = [];
  const valueAsString = dataSet.string(tag);

  if (!valueAsString) {
    return undefined;
  }
  const split = valueAsString.split('\\');

  if (minimumLength && split.length < minimumLength) {
    return undefined;
  }
  for (let i = 0; i < split.length; i++) {
    values.push(parseFloat(split[i]));
  }

  return values;
}

function getNumberValue(dataSet: any, tag: string): any {
  const valueAsString = dataSet.string(tag);

  if (!valueAsString) {
    return undefined;
  }

  return parseFloat(valueAsString);
}

function readCodeList(byteArray: any, position: any, length: any) {
  if (length < 0) {
    throw new Error('dicomParser.readFixedString - length cannot be less than 0');
  }

  if (position + length > byteArray.length) {
    throw new Error('dicomParser.readFixedString: attempt to read past end of buffer');
  }

  const result = [];
  let byte;

  for (let i = 0; i < length; i++) {
    byte = byteArray[position + i];
    if (byte === 0) {
      position += length;

      return result;
    }
    result.push(byte);
  }

  return result;
}

function stringGBK(dataSet: any, tag: string): any {
  const element = dataSet.elements[tag];

  if (element && element.length > 0) {
    const codeList = readCodeList(dataSet.byteArray, element.dataOffset, element.length);
    return new TextDecoder('GBK').decode(new Uint8Array(codeList));
  }
  return undefined;
}

function stringUTF8(dataSet: any, tag: string): any {
  const element = dataSet.elements[tag];

  if (element && element.length > 0) {
    const codeList = readCodeList(dataSet.byteArray, element.dataOffset, element.length);
    const code = codeList.map(item => `%${item.toString(16)}`).join('');
    try {
      return decodeURIComponent(code).trim();
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

const getComporessionState = ({ lossyImageCompression, lossyImageCompressionRatio = '', lossyImageCompressionMethod = '' }: Record<string, any>): string => {
  if (lossyImageCompression === '01' && lossyImageCompressionRatio !== '') {
    const compressionMethod = lossyImageCompressionMethod || 'Lossy: ';
    const compressionRatio = parseFloat(lossyImageCompressionRatio).toFixed(2);
    return `${compressionMethod} ${compressionRatio} : 1`;
  }
  return 'Lossless / Uncompressed';
};

export { debounce, throttle, getNumberValues, getNumberValue, stringGBK, stringUTF8, getComporessionState };
