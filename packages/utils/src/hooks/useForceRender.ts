import { useReducer } from 'react';

const useForceRender = () => {
  const [forceState, forceRender] = useReducer(x => x + 1, 0);

  return [forceState, forceRender];
};

export { useForceRender };
