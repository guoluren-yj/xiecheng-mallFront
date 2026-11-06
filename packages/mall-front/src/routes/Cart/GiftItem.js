import React from 'react';
import { isNil } from 'lodash';

import intl from 'utils/intl';

export default function GiftItem(props) {
  const { giftData = {} } = props;
  const { giftVOList = [] } = giftData;
  return giftVOList.map((item) => {
    const { giftType, giftSkuName, num } = item;
    return (
      <div className="gift-content">
        <div className="gift-type">
          {giftType === 2
            ? intl.get(`mallf.common.view.common.giveaway`).d('赠品')
            : intl.get(`mallf.common.view.common.annex`).d('附件')}
        </div>
        <div className="gift-product-name text-overflow" title={giftSkuName}>
          {giftSkuName}
        </div>
        <div r-if={!isNil(num)} className="gift-product-quantity text-overflow">
          x{num}
        </div>
      </div>
    );
  });
}
