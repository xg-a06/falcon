import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useForceRender, useEvent } from '@falcon/utils';
import ResourceClient from './index';
import { RESOURCE_EVENTS } from './const';
import { Tasks } from '../typing';

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
  const [forceState, forceRender] = useForceRender();
  const resource = useMemo(() => {
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
  }, [query, forceState]);

  const cb = useEvent((eventData: any) => {
    if (query === undefined) {
      return;
    }
    const { cachedKey, index } = query;
    if (cachedKey === eventData.cachedKey) {
      if (index !== undefined) {
        if (index === eventData.index) {
          forceRender();
        }
      } else {
        forceRender();
      }
    }
  });
  useEffect(() => {
    client.on(RESOURCE_EVENTS.LOADED, cb);
    return () => {
      client.off(RESOURCE_EVENTS.LOADED, cb);
    };
  }, []);

  return resource;
};

export { useResourceClient, useResourceRequest, useResourceData, CustomTasks, QueryCache };
export default ResourceProvider;
