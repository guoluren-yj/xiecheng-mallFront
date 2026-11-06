import React from 'react';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';

export default function WarningInfo() {
  return (
    <Alert
      style={{
        width: '100%',
        border: 'none',
        color: '#FF9500',
      }}
      showIcon
      iconType="error"
      type="warning"
      message={intl.get('mcux.common.view.warningInfo').d('请点击物料编码查询ERP库存量')}
    />
  );
}
