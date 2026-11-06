import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export default function GiftItem(props) {
  const { giftData } = props;
  const { productGiftDTOList = [], productGiftExistFlag, productSource } = giftData || {};
  const giftList = productGiftDTOList.reduce((pre, curr) => {
    const { giftVOList = [] } = curr;
    const giftSkuIdList = pre.map((n) => n.skuId);
    let newPre = pre;
    if (productSource === 'CATA') {
      newPre = pre.map((n) => {
        const { num } = giftVOList.find((m) => m.giftSkuId === n.giftSkuId) || {};
        return {
          ...n,
          num: math.plus(n.num, num || 0),
        };
      });
    }
    const addList = giftVOList.filter((n) => !giftSkuIdList.includes(n.skuId));
    newPre.push(...addList);
    return newPre;
  }, []);
  return giftList.map((item) => {
    const { giftType, giftSkuName, num } = item;
    return (
      <div className="gift-content">
        <div className="gift-content-info">
          <span className="gift-type">
            {giftType === 2
              ? intl.get(`mallf.common.view.common.giveaway`).d('赠品')
              : intl.get(`mallf.common.view.common.annex`).d('附件')}
          </span>
          <span className="gift-product-name text-overflow" title={giftSkuName}>
            {giftSkuName}
          </span>
        </div>
        <div r-if={!isNil(num)} className="gift-product-quantity text-overflow">
          x{num}
        </div>
        {productGiftExistFlag && (
          <Tooltip
            title={intl
              .get('mallf.common.view.giftOver.warn')
              .d('不同地址区域可能存在赠品不足情况')}
          >
            <Icon
              type="info"
              size={13}
              style={{ marginLeft: 6, color: getUserConfigInfo().theme[`warning-color`] }}
            />
          </Tooltip>
        )}
      </div>
    );
  });
}
