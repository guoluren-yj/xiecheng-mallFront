import React from 'react';
import { Tooltip } from 'choerodon-ui';

export function headFirstGridAddRow() {
  const overflowStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const tipTitle =
    '如需修改地址，请选择右下方返回购物车进行修改。注意：每个订单仅可配送一个地址，不同地址的商品将拆分成不同订单，需要分别审批';

  return (
    <>
      <span className="grid-tag">提示语：</span>
      <Tooltip title={tipTitle} placement="bottom">
        <span className="grid-content" style={overflowStyle}>
          {tipTitle}
        </span>
      </Tooltip>
    </>
  );
}
