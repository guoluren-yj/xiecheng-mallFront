import React from 'react';
import { Icon } from 'hzero-ui';

import cuxComponent from 'cuxTools/cuxComponent';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

function BreadCrumbsRightBtn({ orderData }) {
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
        <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
        {intl
          .get('mallf.companyOrder.view.orderQuantityPrompt', {
            value: orderData?.length,
          })
          .d(`根据您的拆单规则，本次采购申请拆分为${orderData?.length}个采购申请单`)}
      </span>
    </>
  );
}

export default cuxComponent({ path: 'BeforeCompanyOrder/BreadCrumbsRightBtn' })(
  BreadCrumbsRightBtn
);
