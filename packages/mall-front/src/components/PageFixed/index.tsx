// 页面固定容器

import React, { useEffect, useState } from 'react';
import useEventListener from '../../hooks/useEventListener';
import styles from './index.less';

interface IProps {
  fixId: string;
  zIndex?: number;
  fixTop?: number;
  bgColor?: string;
  boxShadow?: string;
  children?: React.ReactNode;
  style?: Object;
}

export default function PageFixed(props: IProps) {
  const { fixId, zIndex, fixTop, bgColor, boxShadow, style } = props;
  const [fixed, setFixed] = useState(false);

  useEventListener(
    'scroll',
    () => {
      handleScroll();
    },
    window,
    true
  );

  function handleScroll() {
    const fixDom = document.getElementById(fixId);
    if (fixDom) {
      const fixDomRect = fixDom.getBoundingClientRect();
      setFixed(fixDomRect.top - (fixTop || 0) < 0);
    }
  }

  useEffect(() => {
    handleScroll();
  }, [fixId]);

  return (
    <div
      className={styles['mall-page-fixed-wrapper']}
      style={{
        zIndex,
        top: fixTop || 0,
        background: bgColor,
        boxShadow,
        display: fixed ? 'block' : 'none',
      }}
    >
      <div className={styles['mall-page-fixed-container']} style={style}>
        {props.children}
      </div>
    </div>
  );
}
