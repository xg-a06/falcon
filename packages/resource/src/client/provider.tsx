import React, { createContext, useContext, useEffect, useState } from 'react';
import ResourceClient, { Tasks, RESOURCE_EVENTS } from './index';
import { ImageData } from '../typing';

interface CustomTasks extends Tasks {
  cachedKey: string;
}

interface QueryCache {
  cachedKey: string;
  index?: number;
}

interface ProviderProps {
  children: React.ReactNode;
  client?: ResourceClient;
}

const defaultClient = new ResourceClient();
const ResourceContext = createContext(defaultClient);

const ResourceProvider: React.FC<ProviderProps> = ({ client, children }) => {
  let resourceClient = defaultClient;
  if (client !== undefined) {
    resourceClient = client;
  }
  return <ResourceContext.Provider value={resourceClient}>{children}</ResourceContext.Provider>;
};

const useResourceClient = () => useContext(ResourceContext);

const useResourceRequest = (tasks: CustomTasks) => {
  const client = useContext(ResourceContext);
  useEffect(() => {
    const { cachedKey, ...data } = tasks;
    client.addTasks(cachedKey, data);
  }, [tasks]);
};

const useResourceData = (query: QueryCache | undefined) => {
  const client = useContext(ResourceContext);
  const [resource, setResource] = useState<ImageData | ImageData[] | undefined>(() => {
    // 初始化直接返回缓存
    if (query === undefined) {
      return undefined;
    }
    const { cachedKey, index } = query;
    let ret;
    if (index !== undefined) {
      ret = client.cacheManager[cachedKey]?.[index];
      if (ret === undefined) {
        // 提升优先级
        client.TopTask(cachedKey, index);
      }
    } else {
      ret = client.cacheManager[cachedKey] || [];
    }
    return ret;
  });

  useEffect(() => {
    // 检查缓存，有缓存返回，没缓存提升优先级
    if (query === undefined) {
      setResource(undefined);
      return () => undefined;
    }

    const { cachedKey, index } = query;

    let ret: undefined | ImageData | ImageData[] = client.cacheManager[cachedKey];

    if (index !== undefined) {
      ret = client.cacheManager[cachedKey]?.[index];
      if (ret !== undefined) {
        setResource(ret);
      } else {
        // 提升优先级
        client.TopTask(cachedKey, index);
      }
    } else if (ret) {
      setResource(ret);
    }

    // 没缓存开始监听变化
    const cb = (eventData: any) => {
      if (cachedKey === eventData.cachedKey) {
        if (index !== undefined) {
          if (index === eventData.index) {
            setResource(eventData.data);
          }
        } else {
          setResource(eventData.data);
        }
      }
    };
    client.on(RESOURCE_EVENTS.LOADED, cb);
    return () => {
      client.off(RESOURCE_EVENTS.LOADED, cb);
    };
  }, [query]);

  return resource;
};

export { useResourceClient, useResourceRequest, useResourceData, CustomTasks, QueryCache };
export default ResourceProvider;
