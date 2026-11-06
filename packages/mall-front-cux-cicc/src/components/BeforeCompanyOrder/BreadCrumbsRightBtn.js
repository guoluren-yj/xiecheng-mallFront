import React from 'react';
import { Icon, Tooltip } from 'hzero-ui';

import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

export default function BreadCrumbsRightBtn({ orderData }) {
  return (
    <>
      <span
        r-if={orderData.length > 1}
        style={{
          float: 'right',
          lineHeight: '23px',
          color: getUserConfigInfo().theme['warning-color'],
        }}
      >
        <Tooltip
          title={
            <span r-if={orderData.length > 1}>
              根据您所选择商品的{orderData?.[0]?.groupKeyDesc}不同，本次采购申请拆分为
              {orderData?.length}个采购申请单
            </span>
          }
          placement="bottom"
        >
          <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
        </Tooltip>
        {intl
          .get('mallf.companyOrder.view.orderQuantityPrompt', {
            value: orderData?.length,
          })
          .d(`根据您的拆单规则，本次采购申请拆分为${orderData?.length}个采购申请单`)}
      </span>
    </>
  );
}
