import React, { createContext, useContext, useEffect } from 'react';
import ResourceClient, { Tasks } from './resource';

export interface CustomTasks extends Tasks {
  cacheKey: string;
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
    const { cacheKey, ...data } = tasks;
    client.addTasks(cacheKey, data);
  }, [tasks]);
};

// const useResourceData = (query: QueryCache) => useContext(ResourceContext);

export { useResourceClient, useResourceRequest };
export default ResourceProvider;
