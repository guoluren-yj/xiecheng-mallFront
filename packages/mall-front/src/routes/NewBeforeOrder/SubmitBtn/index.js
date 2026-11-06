import React from 'react';

import intl from 'utils/intl';
import createOrderList from './createOrderList';

export default function SubmitBtn(props) {
  const { disabled, ...other } = props;
  return (
    <a onClick={() => createOrderList(other)} disabled={disabled}>
      {intl.get(`mallf.common.submit.createReqPurchase`).d('提交采购申请')}
    </a>
  );
}
