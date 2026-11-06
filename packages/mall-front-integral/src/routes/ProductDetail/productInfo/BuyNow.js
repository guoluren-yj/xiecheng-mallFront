import React from 'react';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';

export default function BuyNow(props) {
  const { hideFieldList, addCartLoading, saleLoading, validateToCart, invalidFlag } = props;
  return (
    <>
      {!hideFieldList.includes('BUY_NOW') &&
        (!invalidFlag ? (
          <div className="product-buy-now buy-now-disabled">
            {intl.get('mallf.common.view.buyNow').d('立即购买')}
          </div>
        ) : (
          <Spin spinning={addCartLoading || saleLoading} size="small">
            <div className="product-buy-now" onClick={() => validateToCart('buyNow')}>
              {intl.get('mallf.common.view.buyNow').d('立即购买')}
            </div>
          </Spin>
        ))}
    </>
  );
}
