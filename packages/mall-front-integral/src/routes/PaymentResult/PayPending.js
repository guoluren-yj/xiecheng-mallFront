import React from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';

export default function PayPending() {
  return (
    <div className="container-page">
      <div className="contain-title">
        <Icon type="watch_later" style={{ fontSize: 31 }} />
        <span className="contain-title-label">
          {intl.get('mallf.common.payment.in.progress').d('订单支付中')}
        </span>
      </div>
      <div className="contain-pay">
        <span className="contain-amount">
          <span className="amount-label">
            {intl.get('mallf.common.waiting.payment.results').d('正在返回支付结果，请稍后')}
          </span>
        </span>
      </div>
    </div>
  );
}
