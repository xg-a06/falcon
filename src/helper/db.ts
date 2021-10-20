export interface StoreOption {
  name: string;
  option: { keyPath?: string; autoIncrement?: boolean };
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

  init(stores: Array<StoreOption>): Promise<DB> {
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

  clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = this.getClient();
      const transaction = client.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const result = store.clear();
      result.onsuccess = () => {
        resolve();
      };
      result.onerror = e => {
        reject(new Error(`query index error ${e}`));
      };
    });
  }

  insert(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = this.getClient();
      const transaction = client.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      let values = data;
      if (!(data instanceof Array)) {
        values = [data];
      }

      values.forEach((v: any) => store.add(v));

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = e => {
        reject(new Error(`query index error ${e}`));
      };
    });
  }

  deleteByConds(storeName: string, conds: (data: any) => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = this.getClient();
      const transaction = client.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const result = store.openCursor();
      result.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          if (conds(cursor.value)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      result.onerror = e => {
        reject(new Error(`delete error ${e}`));
      };
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }

  queryByIndex<T>(storeName: string, indexName: string, conds: any): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const client = this.getClient();
      const transaction = client.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const range = this.IDBKeyRange.only(conds);
      const query = index.openCursor(range);
      const data: Array<T> = [];
      query.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          data.push(cursor.value);
          cursor.continue();
        } else {
          resolve(data);
        }
      };
      query.onerror = e => {
        reject(new Error(`query index error ${e}`));
      };
    });
  }
}

export default DB;
