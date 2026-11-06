import { useEffect } from 'react';
import useFirstMountState from './useFirstMountState';

export default function useUpdateEffect(effect, deps) {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (!isFirstMount) {
      return effect();
    }
  }, deps);
}
