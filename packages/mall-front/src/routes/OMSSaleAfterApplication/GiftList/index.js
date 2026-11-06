import React from 'react';

import intl from 'utils/intl';
import Image from 'components/Image';
import styles from './index.less';

export default function GiftList({
  productNameWidth,
  giftList = [],
  style,
  saleNumDesc,
  saleNumField,
}) {
  return (
    <div className={styles['gift-list']} style={style}>
      {giftList?.map((gift) => {
        return (
          <div className="gift-item">
            <div className="gift-item-left" />
            <div className="gift-item-right">
              <Image width={40} height={40} value={gift.mediaPath || gift.primaryUrl} />
              <div className="gift-product-info">
                <p className="gift-product-name-box">
                  <span className="gift-product-tag">
                    {gift.skuType !== 'ATTACHMENT'
                      ? intl.get(`mallf.common.view.common.giveaway`).d('赠品')
                      : intl.get(`mallf.common.view.common.annex`).d('附件')}
                  </span>
                  <span
                    className="text-overflow gift-product-name"
                    r-title
                    style={productNameWidth ? { width: productNameWidth } : {}}
                  >
                    {gift.skuName}
                  </span>
                </p>
                <p className="gift-product-num" r-if={saleNumDesc}>
                  {saleNumDesc}：
                  <span style={{ color: '#191919' }}>{gift[saleNumField || 'quantity']}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
