import React from 'react';
import { Checkbox } from 'choerodon-ui';

import intl from 'utils/intl';

export default function CheckSigl({ siglCount }) {
  return (
    <div className="other-info">
      <p className="other-info-title">{intl.get('mallf.common.view.paymentInfo').d('支付信息')}</p>
      <p>
        <strong>{intl.get('mallf.common.view.sigl.useSigl').d('使用积分')}</strong>
        <span style={{ color: '#F56649' }}>*</span>
      </p>
      <p style={{ marginTop: 10 }}>
        <Checkbox disabled checked />
        <span>{intl.get('mallf.common.viwe.sigl.leftCore').d('可用积分总额')}</span>：
        {intl
          .get('mallf.common.view.sigl.price', { value: siglCount || 0 })
          .d(`${siglCount || 0}积分`)}
      </p>
    </div>
  );
}
