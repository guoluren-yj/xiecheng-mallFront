import React from 'react';
import { Button } from 'choerodon-ui';

import intl from 'utils/intl';

export default function PayNow({ orderData, payLoading, handlePay }) {
  return (
    <>
      {+orderData.paymentFlag === 1 && (
        <span className="primary-color" style={{ float: 'right' }}>
          <Button
            type="primary"
            loading={payLoading}
            funcType="flat"
            icon="payment"
            onClick={handlePay}
          >
            {intl.get('mallf.common.view.goto.pay').d('立即支付')}
          </Button>
        </span>
      )}
    </>
  );
}
