import React, { useEffect } from 'react';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchPayInfo } from '@/services/paymentResultService';
import useSetState from '@/hooks/useState';
import style from './index.less';
import PayFailed from './PayFailed';
import PaySuccess from './PaySuccess';
import PayPending from './PayPending';

let timer;

function PaymentResult(props) {
  const { amount, order } = qs.parse(props.location.search.substr(1));

  const [paymentData, setPaymentData] = useSetState({
    status: 'PAYMENT_PROCESSING',
  });

  const { status } = paymentData;

  // merchantOrderNum; - oms支付单号
  // paymentOrderNum;  - 支付平台到支付单号
  // channelTradeNo;   - 交易流水号（支付宝/银行）
  // buyerPayAmount;   - 金额

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = () => {
    const { merchantOrderNum } = qs.parse(props.location.search.substr(1));
    if (merchantOrderNum) {
      setPaymentData({ loading: true });
      fetchPayInfo({ merchantOrderNum })
        .then((res) => {
          if (res) {
            if (res.status === 'PAYMENT_PROCESSING') {
              clearInterval(timer);
              timer = setInterval(() => {
                fetchPaymentInfo();
              }, 1500);
            } else {
              clearInterval(timer);
              setPaymentData(res);
            }
          }
        })
        .finally(() => {
          setPaymentData({ loading: false });
        });
    }
  };

  const handleJump = () => {
    props.history.push('/my-mall/my-order?displayStatus=WAITING_SENT');
  };

  const handleJumpTOPay = () => {
    props.history.push('/my-mall/my-order?displayStatus=WAITING_PAY');
  };

  return (
    <div className="container">
      <div
        className={style.content}
        style={{ height: window.innerHeight - 200, display: 'flex', alignItems: 'center' }}
      >
        {status === 'PAID' ? (
          <PaySuccess
            amount={amount}
            order={order}
            handleJump={handleJump}
            paymentData={paymentData}
          />
        ) : status === 'CANCELLED' ? (
          <PayFailed
            amount={amount}
            order={order}
            handleJumpTOPay={handleJumpTOPay}
            paymentData={paymentData}
          />
        ) : (
          status === 'PAYMENT_PROCESSING' && <PayPending />
        )}
      </div>
    </div>
  );
}

export default formatterCollections({ code: 'mallf.payResult' })(PaymentResult);
