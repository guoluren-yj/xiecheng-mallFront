import React from 'react';
import { Checkbox } from 'choerodon-ui';

import intl from 'utils/intl';

export default function CheckSigl({ siglCount, orderData, orderIndex, setOrderData }) {
  const handleCheckSigl = (flag) => {
    // eslint-disable-next-line no-param-reassign
    const newData = [...orderData];
    newData[orderIndex].siglPayFlag = flag ? 1 : 0;
    setOrderData(newData);
  };

  return (
    <div className="other-info">
      <p className="other-info-title">{intl.get('mallf.common.view.paymentInfo').d('支付信息')}</p>
      <p>
        <strong>{intl.get('mallf.common.view.sigl.useSigl').d('使用积分')}</strong>
        <span style={{ color: '#F56649' }}>*</span>
      </p>
      <p style={{ marginTop: 10 }}>
        <Checkbox
          checked={orderData[orderIndex].siglPayFlag === 1}
          onChange={(e) => handleCheckSigl(e.target.checked)}
        />
        <span>{intl.get('mallf.common.viwe.sigl.leftCore').d('可用积分总额')}</span>：
        {intl.get('mallf.common.view.sigl.price', { value: siglCount || 0 }).d(`${siglCount}积分`)}
      </p>
    </div>
  );
}
