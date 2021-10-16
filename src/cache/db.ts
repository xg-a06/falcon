interface DBOptions {
  name: string;
  version: number;
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

  async getInstance(options: DBOptions): Promise<IDBDatabase> {
    const instance = new DB(options);
    const db = await instance.init();
    return db;
  }

  init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const { request } = this;
      request.onerror = () => {
        reject(new Error(`open db error: ${request.error}`));
      };
      request.onupgradeneeded = () => {
        this.client = request.result;
        this.client.onerror = event => {
          throw new Error(`open db error: ${event.target}`);
        };
        this.initStores(resolve);
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
    const objectStore = client.createObjectStore('dicom', { keyPath: 'id' });
    objectStore.createIndex('seriesId', 'seriesId', { unique: false });
    objectStore.transaction.oncomplete = () => {
      resolve(client);
    };
  }
}

export default DB;
