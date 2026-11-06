import React from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function SaleQuality({ productSaleQuantity }) {
  return (
    <div className="buy-quality">
      <div
        className="quality-header"
        title={intl.get('mallf.productDetail.view.history.saleQuality').d('历史销量')}
      >
        {intl.get('mallf.productDetail.view.history.saleQuality').d('历史销量')}
      </div>
      <div className="quality-num text-overflow" title={Math.round(productSaleQuantity)}>
        {productSaleQuantity > 10000
          ? intl
              .get('mallf.productDetail.view.saleQuality.w', {
                value:
                  Math.floor(productSaleQuantity / 10000) > 999
                    ? 999
                    : Math.floor(productSaleQuantity / 10000),
              })
              .d(
                `${
                  Math.floor(productSaleQuantity / 10000) > 999
                    ? 999
                    : Math.floor(productSaleQuantity / 10000)
                }万+`
              )
          : Math.round(productSaleQuantity || 0)}
      </div>
    </div>
  );
}

export default cuxComponent({ path: 'sigl/ProductDetail/productInfo/SaleQuality' })(SaleQuality);
