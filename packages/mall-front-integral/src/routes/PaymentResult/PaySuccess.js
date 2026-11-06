import React, { useState, useRef, useEffect } from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';

export default function PayFailed(props) {
  const { handleJump, paymentData } = props;

  const [second, setSecond] = useState(5);

  const countdownClock = useRef();

  useEffect(() => {
    countdownClock.current = setInterval(() => {
      setSecond(second - 1);
    }, 1000);
  }, [second]);

  useEffect(() => {
    if (second < 1) {
      clearInterval(countdownClock.current);
      handleJump();
    }
  }, [second]);

  return (
    <div className="container-page">
      <div className="contain-title">
        <Icon type="check_circle" style={{ fontSize: 31 }} />
        <span className="contain-title-label">
          {intl.get('mallf.common.paid.successfully').d('您已付款成功')}!
        </span>
      </div>
      <div className="contain-pay">
        <span className="contain-amount">
          <span className="amount-label">
            {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}:
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
        <div className="contain-tips">
          <div className="contain-tips-content">
            {intl
              .getHTML(`mallf.common.view.page.jumpto`, {
                value: second,
              })
              .d(
                <span>
                  页面将于<b>{`${second}`}</b>s后跳转到
                </span>
              )}
            <span className="tips-time">
              {intl.get('mallf.common.view.orderCenter').d('订单中心')}
            </span>
          </div>
          <div>
            <button type="button" className="tips-btn" onClick={handleJump}>
              {intl.get('mallf.common.model.applyRes.clickJump').d('点击立即跳转')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
