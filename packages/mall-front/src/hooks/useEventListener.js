import { useEffect } from 'react';
import useLatest from './useLatest';

function useEventListener(eventName, handler, element = window, options) {
  const savedHandler = useLatest(handler);
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener, options);
    return () => {
      element.removeEventListener(eventName, eventListener, true);
    };
  }, [eventName, element, options]);
}

export default useEventListener;
