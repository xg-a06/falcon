export interface StoreOption {
  name: string;
  option: { keyPath: string };
  indexs: Array<{ key: string; option: { unique: boolean } }>;
}

export interface DBOptions {
  name: string;
  version: number;
  stores: Array<StoreOption>;
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

  client: IDBDatabase | undefined;

  name: string;

  version: number;

  private constructor(options: DBOptions) {
    const { name, version = 1 } = options;
    this.name = name;
    this.version = version;
  }

  static async init(options: DBOptions): Promise<DB> {
    const instance = new DB(options);
    const db = await instance.init(options.stores);
    return db;
  }

  async init(stores: Array<StoreOption>): Promise<DB> {
    return new Promise((resolve, reject) => {
      const { name, version } = this;
      const request = this.indexDB.open(name, version);

      request.onerror = event => {
        reject(new Error(`open db error: ${event.target}`));
      };

      request.onupgradeneeded = () => {
        this.client = request.result;
        this.client.onerror = event => {
          throw new Error(`operate db error: ${event.target}`);
        };
        this.initStores(stores);
      };

      request.onsuccess = () => {
        this.client = request.result;
        resolve(this);
      };
    });
  }

  private getClient(): IDBDatabase {
    if (this.client === undefined) {
      throw new Error('get db client error');
    }
    return this.client;
  }

  initStores(stores: Array<StoreOption>): void {
    const client = this.getClient();
    stores.forEach((store: StoreOption) => {
      const { name, option, indexs } = store;
      if (!client.objectStoreNames.contains(name)) {
        const objectStore = client.createObjectStore(name, option);
        indexs.forEach(index => {
          const { key, option: indexOption } = index;
          objectStore.createIndex(key, key, indexOption);
        });
      }
    });

    // objectStore.transaction.oncomplete = () => {
    //   resolve(client);
    // };
  }
}

export default DB;
