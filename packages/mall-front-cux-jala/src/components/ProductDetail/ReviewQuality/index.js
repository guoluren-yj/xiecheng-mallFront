import React from 'react';

import intl from 'utils/intl';
import styles from './index.less';

export default function ReviewQuality(props) {
  const {
    productData: { productSaleQuantity, productClicks },
  } = props;
  const saleQualityMeaning =
    productSaleQuantity > 10000
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
      : Math.round(productSaleQuantity || 0);

  const reviewQualityMeaning =
    productClicks > 10000
      ? intl
          .get('mallf.productDetail.view.saleQuality.w', {
            value:
              Math.floor(productClicks / 10000) > 999 ? 999 : Math.floor(productClicks / 10000),
          })
          .d(
            `${
              Math.floor(productClicks / 10000) > 999 ? 999 : Math.floor(productClicks / 10000)
            }万+`
          )
      : Math.round(productClicks || 0);
  return (
    <div className={styles.content}>
      <div className="review-quality-header">数据统计</div>
      <div className="review-quality-content">
        <div className="left-count">
          <p className="quality text-overflow" title={saleQualityMeaning}>
            {saleQualityMeaning}
          </p>
          <p className="quality-desc">销量</p>
        </div>
        <div className="right-count">
          <p className="quality text-overflow" title={reviewQualityMeaning}>
            {reviewQualityMeaning}
          </p>
          <p className="quality-desc">浏览量</p>
        </div>
        <div className="line" />
      </div>
    </div>
  );
}
