import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default function PayNow({ item, payLoading, handlePay, product }) {
  return (
    <>
      {+item.paymentFlag === 1 && (
        <Button
          loading={payLoading}
          color="primary"
          className="primary-btn text-overflow"
          onClick={() => handlePay(product)}
          title={intl.get('mallf.myOrder.view.goto.pay').d('立即支付')}
        >
          {intl.get('mallf.myOrder.view.goto.pay').d('立即支付')}
        </Button>
      )}
    </>
  );
}
