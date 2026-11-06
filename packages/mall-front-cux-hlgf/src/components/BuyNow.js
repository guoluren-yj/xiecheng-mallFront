import React from 'react';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getIsEnabledBuyNowFlag } from 'utils/configUtils';

export default function BuyNow(props) {
  const {
    addCartLoading,
    saleLoading,
    validateToCart,
    disabled = false,
    centralizedFlag,
    addCartDisabled,
    product,
  } = props;
  return (
    <>
      {product.attributeVarchar11 !== '1' &&
        getIsEnabledBuyNowFlag() &&
        !centralizedFlag &&
        (disabled || addCartDisabled ? (
          <div className="product-buy-now buy-now-disabled">
            {intl.get('mallf.productDetail.view.buyNow').d('立即购买')}
          </div>
        ) : (
          <Spin spinning={addCartLoading || saleLoading} size="small">
            <div className="product-buy-now" onClick={() => validateToCart('buyNow')}>
              {intl.get('mallf.productDetail.view.buyNow').d('立即购买')}
            </div>
          </Spin>
        ))}
    </>
  );
}
