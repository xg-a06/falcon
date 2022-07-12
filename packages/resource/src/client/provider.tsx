import React, { createContext, useContext, useEffect, useState } from 'react';
import ResourceClient, { Tasks, RESOURCE_EVENTS } from './resource';
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

const useResourceData = (query: QueryCache) => {
  const client = useContext(ResourceContext);
  const [resource, setResource] = useState<ImageData | undefined>(undefined);
  useEffect(() => {
    const { cachedKey, index } = query;
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
