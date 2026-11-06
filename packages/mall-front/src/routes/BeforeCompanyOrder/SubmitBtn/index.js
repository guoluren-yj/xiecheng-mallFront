import React from 'react';

import intl from 'utils/intl';
import cuxComponent from 'cuxTools/cuxComponent';
import createOrderList from '@/routes/BeforeCompanyOrder/SubmitBtn/createOrderList';

function SubmitBtn(props) {
  const {
    disabled,
    orderData,
    miniAmountFlag,
    setOrderData,
    setSubmitLoading,
    headerCode,
    eCLineCode,
    cataLineCode,
    isOMS,
    history,
    hasSiglProduct,
    siglCount,
    allSigluse,
  } = props;
  return (
    <a
      onClick={() =>
        createOrderList({
          orderData,
          miniAmountFlag,
          setOrderData,
          setSubmitLoading,
          headerCode,
          eCLineCode,
          cataLineCode,
          isOMS,
          history,
          hasSiglProduct,
          siglCount,
          allSigluse,
        })
      }
      disabled={disabled}
    >
      {intl.get(`mallf.companyOrder.submit.createReqPurchase`).d('提交采购申请')}
    </a>
  );
}

export default cuxComponent({ path: 'BeforeCompanyOrder/SubmitBtn' })(SubmitBtn);
