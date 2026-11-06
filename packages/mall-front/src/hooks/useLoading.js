import { useCallback } from 'react';
import useState from '@/hooks/useState';

export default function useLoading(initialLoading = {}) {
  const [loadings, setLoadings] = useState(initialLoading);
  const toggleLoading = useCallback(
    (key, forceVal) => {
      // 如果一次性改多个loading，入参为对象键值对
      if (
        key &&
        Object.prototype.toString.call(key) !== '[object Array]' &&
        typeof key === 'object'
      ) {
        setLoadings(key);
      } else if (typeof key === 'string') {
        // 改变特定loading
        if (typeof forceVal === 'boolean') {
          // 如果第二个参数为布尔值，则强行改变这个loading
          setLoadings({ [key]: forceVal });
        } else {
          // 第二个参数不为布尔，则默认切换指定loading
          setLoadings(prev => ({ [key]: !prev[key] }));
        }
      } else {
        return null;
      }
    },
    [setLoadings]
  );
  return [loadings, toggleLoading];
}
