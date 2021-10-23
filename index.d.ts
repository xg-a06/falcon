declare module 'falcon/demo/db/index' {

}
declare module 'falcon/demo/index' {
  export {};

}
declare module 'falcon/src/cache/index' {
  import DB from '@src/helper/db';
  const getCacheInstance: () => Promise<DB>;
  export default getCacheInstance;

}
declare module 'falcon/src/helper/db' {
  export interface StoreOption {
      name: string;
      option: {
          keyPath?: string;
          autoIncrement?: boolean;
      };
      indexs: Array<{
          key: string;
          option: {
              unique: boolean;
          };
      }>;
  }
  export interface DBOptions {
      name: string;
      version: number;
      stores: Array<StoreOption>;
  }
  global {
      interface Window {
          client: any;
      }
  }
  class DB {
      indexDB: IDBFactory;
      IDBTransaction: {
          new (): IDBTransaction;
          prototype: IDBTransaction;
      };
      IDBKeyRange: {
          new (): IDBKeyRange;
          prototype: IDBKeyRange;
          bound(lower: any, upper: any, lowerOpen?: boolean | undefined, upperOpen?: boolean | undefined): IDBKeyRange;
          lowerBound(lower: any, open?: boolean | undefined): IDBKeyRange;
          only(value: any): IDBKeyRange;
          upperBound(upper: any, open?: boolean | undefined): IDBKeyRange;
      };
      client: IDBDatabase | undefined;
      name: string;
      version: number;
      constructor(options: DBOptions);
      static init(options: DBOptions): Promise<DB>;
      init(stores: Array<StoreOption>): Promise<DB>;
      private getClient;
      initStores(stores: Array<StoreOption>): void;
      clear(storeName: string): Promise<void>;
      insert(storeName: string, data: any): Promise<void>;
      deleteByConds(storeName: string, conds: (data: any) => boolean): Promise<void>;
      queryByIndex<T>(storeName: string, indexName: string, conds: any): Promise<Array<T>>;
  }
  export default DB;

}
declare module 'falcon/src/helper/transform' {
  import { mat2d } from 'gl-matrix';
  type Point2D = {
      x: number;
      y: number;
  };
  class Transform {
      mat: mat2d;
      reset(): void;
      clone(): mat2d;
      translate(tx: number, ty: number): void;
      scale(sx: number, sy: number): void;
      rotate(angle: number): void;
      transformPoint(ox: number, oy: number): Point2D;
      invertPoint(cx: number, cy: number): Point2D;
  }
  export default Transform;

}
declare module 'falcon/src/index' {
  import { sum, minus } from 'falcon/src/module';
  const _default: {
      sum: typeof sum;
      minus: typeof minus;
  };
  export default _default;

}
declare module 'falcon/src/init' {

}
declare module 'falcon/src/loader/imageData' {
  export interface ImageData {
      id: string;
      seriesId: string;
      studyId: string;
  }

}
declare module 'falcon/src/loader/index' {
  interface Tasks {
      studyId: string;
      seriesId: string;
      urls: Array<string>;
  }
  interface Download {
      seriesId: string;
      url: string;
  }
  interface DataMap {
      [key: string]: {
          studyId: string;
          data: Map<string, boolean>;
      };
  }
  interface QueryObj {
      seriesId: string;
      index: number;
  }
  class Loader {
      dataMap: DataMap;
      downloadQueue: Array<Download>;
      workders: Array<Worker>;
      addTasks(tasks: Tasks): void;
      addTasks(tasks: Array<Tasks>): void;
      getCacheData<T>(query: QueryObj): Promise<Array<T> | undefined>;
  }
  export default Loader;

}
declare module 'falcon/src/loader/loader.worker' {
  export {};

}
declare module 'falcon/src/module' {
  export function sum(a: number, b: number): number;
  export function minus(a: number, b: number): number;

}
declare module 'falcon/src/viewport/base' {
  import Transform from '@src/helper/transform';
  type ElmSize = {
      width: number;
      height: number;
  };
  type RenderFunction = (renderData: any) => ImageData;
  interface DisplayState {
      hflip: boolean;
      vflip: boolean;
      scale: number;
      angle: number;
      invert: boolean;
      offset: {
          x: number;
          y: number;
      };
      wwwc: {
          ww: number;
          wc: number;
      };
      align: 'center' | 'left' | 'right' | 'top' | 'bottom';
  }
  interface BaseOptions {
      id?: string;
      elm: HTMLElement;
      renderer: RenderFunction;
  }
  class Base2D {
      id: string;
      elm: HTMLElement;
      renderCanvas: HTMLCanvasElement;
      canvas: HTMLCanvasElement;
      displayState: DisplayState;
      transform: Transform;
      renderData: unknown;
      renderer: RenderFunction;
      constructor(options: BaseOptions);
      initDisplayState(): DisplayState;
      initRenderCanvas(): HTMLCanvasElement;
      initCanvas(): HTMLCanvasElement;
      getElmSize(): ElmSize;
      setTransform(ctx: CanvasRenderingContext2D): void;
      getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
      draw(): void;
  }
  export default Base2D;

}
declare module 'falcon' {
  import main = require('falcon/.');
  export = main;
}