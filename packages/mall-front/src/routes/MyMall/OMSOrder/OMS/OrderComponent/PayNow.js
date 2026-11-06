import React from 'react';
import { Button } from 'choerodon-ui/pro';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function PayNow({ item, payLoading, handlePay, product }) {
  return (
    <>
      {+item.paymentFlag === 1 && (
        <Button
          waitType="throttle"
          wait={500}
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
export default cuxComponent({ path: 'MyMall/OMSOrder/OMS/OrderComponent/PayNow' })(PayNow);
