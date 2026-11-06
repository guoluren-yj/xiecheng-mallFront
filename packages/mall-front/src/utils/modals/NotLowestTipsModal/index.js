import React from 'react';
import intl from 'utils/intl';

export default function NotLowestTipsModal(props) {
  const { modal, onOk, weakFlag, strongFlag } = props;
  modal.handleOk(() => {
    if (weakFlag) {
      onOk();
    }
  });

  return (
    <div>
      {strongFlag
        ? intl
            .get('mallf.common.disabled.exitLowerPrice')
            .d('存在比该商品更低价格的商品，无法购买，请重新选择商品')
        : intl
            .get('mallf.common.confirm.exitLowerPrice')
            .d('存在比该商品更低价格的商品，是否继续加购/下单')}
    </div>
  );
}
