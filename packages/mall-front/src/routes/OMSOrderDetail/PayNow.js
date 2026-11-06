import React from 'react';
import { Button } from 'choerodon-ui';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function PayNow({ orderData, payLoading, handlePay }) {
  return (
    <>
      {+orderData.paymentFlag === 1 && (
        <span className="primary-color" style={{ float: 'right' }}>
          <Button
            waitType="throttle"
            wait={500}
            type="primary"
            loading={payLoading}
            funcType="flat"
            icon="payment"
            onClick={handlePay}
          >
            {intl.get('mallf.orderDetail.view.goto.pay').d('立即支付')}
          </Button>
        </span>
      )}
    </>
  );
}
export default cuxComponent({ path: 'OMSOrderDetail/PayNow' })(PayNow);
