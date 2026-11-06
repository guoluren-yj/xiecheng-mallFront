import React from 'react';
import intl from 'utils/intl';

export default function ValidDay({ validDay }) {
  return (
    <p
      data-field="validDay"
      style={{ display: validDay && validDay <= 45 ? '' : 'none', fontWeight: 600 }}
    >
      <span className="item-label" style={{ color: 'red' }}>
        {intl.get(`mallf.productDetail.view.validDay`).d('价格有效期(天)')}：
      </span>
      <span className="item-content" r-title style={{ color: 'red' }}>
        {validDay}
      </span>
    </p>
  );
}
