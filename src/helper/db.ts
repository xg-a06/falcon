interface TableOptions {
  name: string;
  option: { keyPath: string };
  indexs: Array<{ key: string; option: { unique: boolean } }>;
}

interface DBOptions {
  name: string;
  version: number;
  tables: Array<TableOptions>;
}

declare global {
  interface Window {
    client: any;
  }
}

class DB {
  private indexDB = window.indexedDB;

  private IDBTransaction = window.IDBTransaction;

  private IDBKeyRange = window.IDBKeyRange;

  request: IDBOpenDBRequest;

  client: IDBDatabase | undefined;

  name: string;

  version: number;

  private constructor(options: DBOptions) {
    const { name, version = 1 } = options;
    this.name = name;
    this.version = version;
    this.request = this.indexDB.open(name, version);
  }

  static async init(options: DBOptions): Promise<IDBDatabase> {
    const instance = new DB(options);
    const db = await instance.init();
    return db;
  }

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const { request } = this;
      request.onerror = () => {
        reject(new Error(`open db error: ${request.error}`));
      };
      request.onupgradeneeded = () => {
        console.log('onupgradeneeded');
        this.client = request.result;
        this.client.onerror = event => {
          throw new Error(`open db error: ${event.target}`);
        };
        this.initStores(resolve);
      };
      request.onsuccess = () => {
        window.client = request.result;
        console.log('onsuccess', request);
      };
    });
  }

  getClient(): IDBDatabase {
    if (this.client === undefined) {
      throw new Error('get db client error');
    }
    return this.client;
  }

  initStores(resolve: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void): void {
    const client = this.getClient();
    if (client.objectStoreNames.contains('dicom')) {
      resolve(client);
      return;
    }
    const objectStore = client.createObjectStore('dicom', { keyPath: 'id' });
    objectStore.createIndex('seriesId', 'seriesId', { unique: false });
    objectStore.transaction.oncomplete = () => {
      resolve(client);
    };
  }
}

export default DB;
