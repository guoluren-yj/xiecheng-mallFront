import React, { memo, FC } from 'react';

import { openPage } from 'utils/utils';

interface Iprops {
  to?: string; // 跳转路径 兼容原写法
  href?: string; // 跳转路径 兼容原写法
  disabled?: boolean;
  [extProp: string]: any;
}

const Link: FC<Iprops> = (props) => {
  const { children, href, to, disabled = false, ...otherProps } = props;
  return (
    <a // react link要必须在Route中，在modal中会有问题，所以换a标签
      disabled={disabled}
      onClick={(e) => {
        if(disabled) return;
        e.preventDefault();
        openPage(to || href);
      }}
      href={to || href}
      {...otherProps}
    >
      {children}
    </a>
  );
};

export default memo(Link);
