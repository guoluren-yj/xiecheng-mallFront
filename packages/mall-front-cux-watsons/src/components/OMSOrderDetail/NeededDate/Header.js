import React from 'react';
import intl from 'utils/intl';

export default function EmptyComponent() {
  return (
    <>
      <span style={{ width: 60 }}>{intl.get('mallf.common.view.rule').d('运费规则')}</span>
      <span style={{ width: 50 }}>
        {intl.get(`mallf.common.model.companyOrder.itemTwoCategoryName`).d('二级品类')}
      </span>
    </>
  );
}
