import React from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';

export default function PayFailed(props) {
  const { handleJumpTOPay, paymentData } = props;

  return (
    <div className="container-page">
      <div className="contain-title">
        <Icon type="cancel" style={{ fontSize: 31 }} />
        <span className="contain-title-label">
          {intl.get('mallf.payResult.view.unable.complete.payment').d('抱歉，无法完成付款')}
        </span>
      </div>
      <div className="contain-pay">
        <span className="contain-amount">
          <span className="amount-label">
            {intl.get('mallf.payResult.view.for.payment').d('待付款(含税)')}:
          </span>
          <span className="amount-number">{`（${paymentData.currencyCode}）${paymentData.buyerPayAmount}`}</span>
        </span>
      </div>
      {/* <div className="contain-order">
        <span className="amount-label">
          {intl.get('mallf.common.Oms.payment.ordernumber').d('oms支付单号')}:
        </span>
        <span className="amount-order">{`${paymentData.merchantOrderNum}`}</span>
      </div> */}
      <div>
        <div>
          <button type="button" className="tips-btn" onClick={handleJumpTOPay}>
            {intl.get('mallf.payResult.view.orderCenter').d('订单中心')}
          </button>
        </div>
      </div>
    </div>
  );
}
