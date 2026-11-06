import React from 'react';
import { Tooltip, Icon, Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';

export default function MessageRender({ item }) {
  return (
    !!item.poMessageUnReadVO?.unreadFlag &&
    item.cecFromCode === 'CATA' && (
      <span className="order-header-count" style={{ marginRight: 20 }}>
        <Badge size="small" count={item?.poMessageUnReadVO?.unreadCount}>
          <Tooltip
            placement="bottom"
            title={intl
              .get('mallf.myOrder.view.unreadFlag')
              .d('您有未读供应商留言，请点击单号至详情页查看')}
          >
            <Icon size={16} type="message2" style={{ color: getPrimaryColor() }} />
          </Tooltip>
        </Badge>
      </span>
    )
  );
}
