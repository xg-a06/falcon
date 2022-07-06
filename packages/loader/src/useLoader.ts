/* eslint-disable @typescript-eslint/no-unused-vars */
import { useReducer } from 'react';

const useLoader = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
};

export default useLoader;
