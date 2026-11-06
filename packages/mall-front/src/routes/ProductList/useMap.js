// 商品异步信息的管理
import { useState, useMemo, useCallback } from 'react';

export default function useMap() {
  const [, setUpdate] = useState();
  const _map = useMemo(() => new Map(), []);
  const set = useCallback((key, value) => {
    _map.set(key, value);
    setUpdate({});
  }, []);
  return [_map, set];
}
