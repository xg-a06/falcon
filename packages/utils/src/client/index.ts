/* eslint-disable no-undef */
interface AJAXOptions {
  url: string;
  method: string;
  baseUrl: string;
  headers?: Record<string, string>;
  data: any;
  withCredentials: boolean;
  responseType: XMLHttpRequestResponseType;
  timeout: number;
  async: boolean;
  cache: boolean;
}

// 类get请求正则匹配
const getReg = /^(GET|DELETE|HEAD)$/i;

const defaultOptions: AJAXOptions = {
  url: '',
  method: 'get',
  baseUrl: '',
  data: {},
  withCredentials: false,
  responseType: 'json',
  timeout: 60000,
  async: true,
  cache: true,
};
class AJAX {
  options: AJAXOptions;

  xhr: XMLHttpRequest | undefined;

  constructor(options: AJAXOptions) {
    this.options = options;
  }

  private getXHR(): XMLHttpRequest {
    if (this.xhr === undefined) {
      throw new Error('xhr not instantiate');
    }
    return this.xhr;
  }

  init(): void {
    const { method, data, cache, url } = this.options;
    // 处理请求
    this.options.method = method.toUpperCase();
    // 处理数据
    if (getReg.test(method)) {
      const arr = Object.entries(data).reduce((tmp: Array<string>, [k, v]: [string, any]): Array<string> => {
        arr.push(`${k}=${encodeURIComponent(v)}`);
        return tmp;
      }, []);

      let dataStr = arr.join('&');
      if (!cache) {
        dataStr += `${dataStr ? '&' : ''}_=${Math.random()}`;
      }
      dataStr = dataStr ? `?${dataStr}` : '';
      this.options.url = url + dataStr;
      this.options.data = null;
    } else {
      this.options.url = url;
      if (!(data instanceof FormData)) {
        this.options.data = JSON.stringify(data);
        if (!this.options.headers?.['content-type']) {
          this.options.headers!['content-type'] = 'application/json';
        }
      }
    }
  }

  abort(): void {
    this.xhr?.abort();
  }

  open(): void {
    const { method, url, async } = this.options;
    this.getXHR().open(method, url, async);
  }

  set(reject: (reason?: any) => void) {
    const { headers = {}, responseType, timeout } = this.options;
    const xhr = this.getXHR();
    Object.entries(headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });
    xhr.responseType = responseType;
    xhr.timeout = timeout;
    // 超时处理
    xhr.ontimeout = e => {
      reject(e);
    };
    xhr.onerror = e => {
      reject(e);
    };
  }

  send(): void {
    const { data } = this.options;
    this.getXHR().send(data);
  }

  load(resolve: (value: any | PromiseLike<any>) => void): void {
    const xhr = this.getXHR();
    xhr.onload = () => {
      resolve({
        code: xhr.status,
        data: xhr.response,
        statusText: xhr.statusText,
      });
    };
  }

  request(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.xhr = new XMLHttpRequest();
      this.init();
      this.open();
      this.set(reject);
      this.send();
      this.load(resolve);
    });
  }
}

const client = (options: Partial<AJAXOptions>): Promise<any> => {
  const op = { ...defaultOptions, ...options };
  const xhr = new AJAX(op);
  return xhr.request();
};

client.create = (options: Partial<AJAXOptions>): AJAX => {
  const op = { ...defaultOptions, ...options };
  return new AJAX(op);
};

export default client;
