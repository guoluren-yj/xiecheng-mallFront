import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

// 比价单Icon
export default function CompareIcon({ lowerFlag }) {
  return (
    <Tooltip
      title={
        lowerFlag
          ? intl
              .get('mcux.common.view.lowerCompareTips')
              .d('根据系统算法，本订单中的该商品，商城有更低单价的推荐')
          : null
      }
    >
      <Icon
        style={{
          fontSize: 14,
          marginLeft: 5,
          marginTop: -2,
          cursor: 'pointer',
          color: lowerFlag ? getUserConfigInfo().theme[`warning-color`] : '#888',
        }}
        type={lowerFlag ? 'error' : 'find_in_page'}
      />
    </Tooltip>
  );
}
