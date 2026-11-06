import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import styles from './index.less';

const OverflowContainer = ({ children, className, style, placement = 'left' }) => {
  const dom = useRef();
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (dom.current) {
      const { clientWidth, scrollWidth, clientHeight, scrollHeight } = dom.current;
      if (scrollWidth > clientWidth || scrollHeight > clientHeight) {
        setIsOverflow(true);
      }
    }
  }, [children]);

  return (
    <Tooltip title={isOverflow ? children : null} placement={placement}>
      <div
        ref={dom}
        style={style}
        className={classNames({ [className]: !!className, [styles['overflow-container']]: true })}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default OverflowContainer;
