import React from 'react';
import intl from 'utils/intl';

export default function Product({ data }) {
  return (
    <span
      style={{
        backgroundColor: '#EBEBEB',
        margin: '0 10px',
        color: '#191919',
        padding: '0 5px',
        borderRadius: '2px',
      }}
    >
      {intl.get('mcux.common.oms.model.oa.orderNumber').d('OA单号')}：
      {(data || {}).attributeVarchar33}
    </span>
  );
}
