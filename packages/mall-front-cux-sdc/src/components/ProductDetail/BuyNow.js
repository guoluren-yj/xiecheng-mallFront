import React from 'react';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';

export default function BuyNow(props) {
  const {
    sourceFrom,
    onCataStock,
    getAddCartBtnStatus,
    hideFieldList,
    addCartLoading,
    saleLoading,
    validateToCart,
    shelfFlag,
    disabled = false,
  } = props;
  return (
    <>
      {!hideFieldList.includes('BUY_NOW') &&
        (disabled ||
        shelfFlag !== 1 ||
        ((onCataStock || sourceFrom !== 'CATA') && getAddCartBtnStatus) ? (
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
