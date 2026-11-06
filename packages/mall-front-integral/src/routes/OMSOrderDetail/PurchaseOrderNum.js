import React from 'react';
import { Icon, Badge } from 'choerodon-ui';

import intl from 'utils/intl';
import cuxComponet from 'mall-front/lib/cuxTools/cuxComponent';

function PurchaseOrderNum({ item, firstCurrent, setState = (e) => e }) {
  return (
    item?.srmOrderCode && (
      <div className="product-po-num">
        <span>
          {intl.get('mallf.orderDetail.view.catalog.purchaseOrderNum').d('采购订单号')}：
          {item?.srmOrderCode}
        </span>
        {firstCurrent.srmOrderId && (
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

export default cuxComponet({ path: 'OMSOrderDetail/PurchaseOrderNum' })(PurchaseOrderNum);
