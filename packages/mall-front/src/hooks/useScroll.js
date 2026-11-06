/**
 * useScroll - 自定义hooks 返回鼠标滚动高度值
 * @date: 2019-08-28
 * @author: <peng.yang05@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { useState, useEffect } from 'react';

export default function useScroll() {
  const [scrollTop, setScrollTop] = useState(document.body.scrollTop || 0);
  const [scrollBottom, setScrollBottom] = useState(
    document.body.scrollHeight - document.body.scrollTop - document.body.clientHeight || 0
  );

  const onScroll = () => {
    setScrollTop(document.body.scrollTop);
    setScrollBottom(
      document.body.scrollHeight - document.body.scrollTop - document.body.clientHeight
    );
  };

  useEffect(() => {
    document.body.addEventListener('scroll', onScroll, false);

    return () => {
      document.body.removeEventListener('scroll', onScroll, false);
    };
  }, []);

  return { scrollTop, scrollBottom };
}
