import ResourceClient from './client/resource';
import ResourceProvider, { useResourceRequest, CustomTasks } from './client/provider';

export type Tasks = CustomTasks;
export { ResourceClient, useResourceRequest };

export default ResourceProvider;
