import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

type PropsType = {
  container: Element,
}

export default function useAnchorScroll(props: PropsType) {
  const [index, setIndex] = useState(0);

  const onScroll = debounce(() => {
    const doc = document.querySelector('.c7n-anchor-link-title-active') as HTMLAnchorElement;
    if(doc) {
      const [, ind] = doc.href.split('#');
      const activeIndex = Number(ind) || 0;
      setIndex(activeIndex);
    }
  }, 200);

  useEffect(() => {
    const doc = props.container || document.body;
    doc.addEventListener('scroll', onScroll, false);
    return () => {
      doc.removeEventListener('scroll', onScroll, false);
    };
  }, [props.container]);

  return { index };
}
