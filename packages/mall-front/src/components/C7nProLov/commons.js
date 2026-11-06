import React, { useRef, useImperativeHandle } from 'react';

import C7nProLov from './index';

// 库房lov
export function ReceiveLov(props) {
  const { children, lovPara, onChange, className, onRef = useRef(), ...otherProps } = props;
  const ref = useRef();
  useImperativeHandle(onRef, () => ref.current);
  const C7nProLovProps = {
    fieldProps: {
      lovCode: 'SAGM.SALE_AGREEMENT_INVENTORY',
      lovPara,
    },
    lovProps: {
      className,
      clearButton: false,
      onChange: (val) => {
        onChange(val);
        ref.current.dataSet.loadData([]);
      },
      ref,
      noCache: true,
      ...otherProps,
    },
  };
  return <C7nProLov {...C7nProLovProps}>{children}</C7nProLov>;
}
