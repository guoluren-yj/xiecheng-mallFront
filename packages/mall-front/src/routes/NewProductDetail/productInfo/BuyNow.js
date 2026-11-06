import React from 'react';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { getIsEnabledBuyNowFlag } from 'utils/configUtils';
import cuxComponent from 'cuxTools/cuxComponent';

function BuyNow(props) {
  const {
    addCartLoading,
    saleLoading,
    validateToCart,
    disabled = false,
    centralizedFlag,
    addCartDisabled,
  } = props;
  const { budgetSwitch, isNewCart } = getUserConfigInfo();
  return (
    <>
      {(budgetSwitch !== '1' || !!isNewCart) &&
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

export default cuxComponent({ path: 'ProductDetail/productInfo/BuyNow' })(BuyNow);
