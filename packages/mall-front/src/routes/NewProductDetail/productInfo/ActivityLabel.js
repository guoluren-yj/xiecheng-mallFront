import React, { useState, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import Image from 'components/Image';
import { Spin } from 'hzero-ui';

function ActivityLabel(props) {
  const { productGiftDTO, giftLoading = true, giftType = 2 } = props;
  //  赠品 / 附件 聚合
  const giftSkus = productGiftDTO?.giftVOList?.filter((gift) => gift.giftType === giftType) || [];

  return (
    <div className="product-activity-label">
      <div className="activity-label-left">
        {/* giftType 1 附件 2 赠品 */}
        <Icons type={giftType === 2 ? 'icon-gift' : 'a-icon-attachment'} size="14" />
        <span>
          {giftType === 2
            ? intl.get('mallf.common.view.common.giveaway').d('赠品')
            : intl.get(`mallf.common.view.common.annex`).d('附件')}
        </span>
      </div>
      <div className="activity-label-right">
        <span className="no-wrap" title={productGiftDTO.giftDesc}>
          {productGiftDTO.giftDesc}
        </span>
        <Icon type="expand_more" />
      </div>
      <div className="product-activity-card-out">
        <div className="product-activity-card">
          <div className="product-activity-title" r-if={productGiftDTO.promoEndTime}>
            {intl.get('mallf.common.view.gift.promoEndTime').d('活动截止时间')}：
            {productGiftDTO.promoEndTime}
          </div>
          <Spin spinning={!giftLoading} className="product-activity-spin">
            {giftSkus.map((giftSku) => {
              return (
                giftSku?.giftSkuName && (
                  <div className="product-activity-content">
                    <Image // image 组件
                      value={giftSku?.primaryThumbnailImage || giftSku?.primaryImage}
                      width={34}
                      height={34}
                      className="product-activity-img"
                    />
                    <span className="product-activity-info" title={giftSku?.giftSkuName}>
                      {giftSku?.giftSkuName}
                    </span>
                  </div>
                )
              );
            })}
          </Spin>
        </div>
      </div>
    </div>
  );
}

export function getCataGiftLabels(oldProductGiftDTO) {
  const SHOW_NUM = 2;
  const productGiftDTOs =
    oldProductGiftDTO?.giftVOList?.map((gift) => ({
      giftDesc: gift.giftDesc,
      promoEndTime: intl.get('mallf.common.view.gift.promoEndTimeMeaning').d('送完为止'),
      giftVOList: [gift],
    })) || [];
  const [viewMoreFlag, setViewMoreFlag] = useState(false);
  const [showList, setShowList] = useState([]);
  // 写不了overflow: hidden，靠改变数据
  useEffect(() => {
    setShowList(viewMoreFlag ? productGiftDTOs : productGiftDTOs.slice(0, SHOW_NUM));
  }, [viewMoreFlag]);

  return (
    <div className="product-activity-more">
      <div>
        {showList.map((productGiftDTO) => (
          <ActivityLabel productGiftDTO={productGiftDTO} giftType={productGiftDTO.giftType} />
        ))}
      </div>
      {productGiftDTOs.length > SHOW_NUM && (
        <div className="product-activity-more-btn" onClick={() => setViewMoreFlag((flag) => !flag)}>
          {viewMoreFlag
            ? intl.get('mallf.common.button.stowMore').d('收起更多')
            : intl.get('mallf.common.button.viewMore').d('查看更多')}
          <Icon type={viewMoreFlag ? 'expand_less' : 'expand_more'} />
        </div>
      )}
    </div>
  );
}

export default ActivityLabel;
