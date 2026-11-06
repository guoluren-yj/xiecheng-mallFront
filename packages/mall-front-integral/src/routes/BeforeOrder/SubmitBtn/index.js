import React from 'react';

import intl from 'utils/intl';
import createOrderList from './createOrderList';

export default function SubmitBtn(props) {
  const { disabled, orderData, miniAmountFlag, setOrderData, setSubmitLoading, history } = props;
  return (
    <a
      onClick={() =>
        createOrderList({
          orderData,
          miniAmountFlag,
          setOrderData,
          setSubmitLoading,
          history,
        })
      }
      disabled={disabled}
    >
      {intl.get(`mallf.common.submit.createReqOrder`).d('提交订单')}
    </a>
  );
}
