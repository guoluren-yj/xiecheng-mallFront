import React from 'react';
import { Icon, Badge } from 'choerodon-ui';

import intl from 'utils/intl';

function PurchaseOrderNum({ item, isReceive, firstCurrent, setState = (e) => e }) {
  const { orderEntryVOS = [] } = item || {};
  return (
    item?.srmOrderCode &&
    !isReceive && (
      <div className="product-po-num">
        <span>
          {intl.get('mallf.orderDetail.view.catalog.purchaseOrderNum').d('采购订单号')}：
          {item?.srmOrderCode}
        </span>
        {firstCurrent.srmOrderId && orderEntryVOS[0]?.cecFromCode === 'CATA' && (
          <span>
            <Badge
              size="small"
              count={
                firstCurrent.poMessageUnReadVO?.unreadFlag
                  ? firstCurrent.poMessageUnReadVO?.unreadCount
                  : null
              }
            >
              <Icon
                size={16}
                type="message2"
                onClick={() =>
                  setState({
                    leaveWordVisible: true,
                    srmOrderId: firstCurrent.srmOrderId,
                  })
                }
              />
            </Badge>
          </span>
        )}
      </div>
    )
  );
}

export default PurchaseOrderNum;
