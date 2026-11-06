import { useState, useEffect } from 'react';
import useEventListener from 'hooks/useEventListener';

export default function useFooterFixed(footerPaddingBottom, effects = []) {
  const [{ fixed, footerScrollBarWidth }, setState] = useState({
    fixed: true,
    footerScrollBarWidth: document.querySelector('table')?.clientWidth,
  });
  // 计算是否滚动到底部
  const computerBottomFix = () => {
    const scrollTop = document.body?.scrollTop || document.documentElement?.scrollTop || 0;
    const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
    const { clientHeight } = document.documentElement;
    const bottom = scrollHeight - scrollTop - clientHeight;
    const d = footerPaddingBottom + 20;
    return bottom > d;
  };

  function handleScroll() {
    const newFix = computerBottomFix();
    const newClientWidth = document.querySelector('table')?.clientWidth;
    setState((prev) => {
      // 会造成cartFooter不必要的重复render
      if (prev.fixed === newFix && prev.footerScrollBarWidth === newClientWidth) {
        return prev;
      }
      return {
        ...prev,
        fixed: newFix,
        footerScrollBarWidth: newClientWidth,
      };
    });
  }

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, effects);

  // 给window添加scroll、resize事件
  useEventListener('scroll', handleScroll, window, true);

  return [{ fixed, footerScrollBarWidth }, handleScroll];
}
