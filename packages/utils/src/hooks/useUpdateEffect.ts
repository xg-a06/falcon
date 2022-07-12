/* eslint-disable consistent-return */
import { useEffect, useRef, EffectCallback, DependencyList } from 'react';

const useUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    return effect();
  }, deps);
};

export { useUpdateEffect };
