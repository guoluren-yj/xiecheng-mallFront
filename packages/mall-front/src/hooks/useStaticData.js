import { useRef, useCallback } from 'react';

// 函数组件存静态值, initStaticData -> {}
export default function useStaticData(initStaticData) {
  const staticData = useRef(initStaticData || {});

  const setStaticData = useCallback((newStaticData) => {
    staticData.current = { ...staticData.current, ...newStaticData };
  }, []);

  return [staticData.current, setStaticData];
}
