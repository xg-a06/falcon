/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext } from 'react';

interface ProviderProps {
  children: React.ReactNode;
  client?: Record<string, never>;
}

interface Tasks {
  cacheKey: string;
  studyId: string;
  seriesId: string;
  urls: Array<string>;
  types?: string;
  priority?: number;
}

interface QueryCache {
  cacheKey: string;
  value: number;
}

const RESOURCE_TYPES = {
  DICOM: 'dicom',
  JPEG: 'jpeg',
  VTP: 'vtp',
};

const PRIORITY_TYPES = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
};

const defaultClient = {};
const ResourceContext = createContext({});

const ResourceProvider: React.FC<ProviderProps> = ({ client, children }) => {
  let resourceClient = defaultClient;
  if (client !== undefined) {
    resourceClient = client;
  }
  return <ResourceContext.Provider value={resourceClient}>{children}</ResourceContext.Provider>;
};

const useResourceClient = () => useContext(ResourceContext);

const useResourceRequest = (tasks: Tasks) => useContext(ResourceContext);

const useResourceData = (query: QueryCache) => useContext(ResourceContext);

export { Tasks, QueryCache };
export { RESOURCE_TYPES, PRIORITY_TYPES };
export { useResourceClient, useResourceData, useResourceRequest };
export default ResourceProvider;
