import React from 'react';
import { Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import OverflowTip from 'components/OverflowTip';

export default function SubOrderPayInfo(props) {
  const { order, orderIndex, changePayAndPurchaseData } = props;
  const { minPurchaseFlag = 1, XXYTCompanyPayInfo, productSource } = order;
  const flag = minPurchaseFlag === 0;
  const paymentMethodList = isEmpty(XXYTCompanyPayInfo) ? [] : XXYTCompanyPayInfo;

  return (
    productSource === 'CATA' && (
      <div className="other-info">
        <div className="up-down">
          <div className="info-label">
            <div className="info-label-pay label-required">
              {intl.get('mallf.myMall.model.paymentMethod').d('支付方式')}
            </div>
            <div className="pay-way-wrapper">
              {paymentMethodList.map((payment) => (
                <span
                  key={payment.paymentMethodCode}
                  onClick={
                    flag
                      ? null
                      : () => {
                          changePayAndPurchaseData({
                            index: orderIndex,
                            type: 'paymentMethodCode',
                            val: payment.paymentMethodCode,
                            typeField: 'paymentMethodName',
                            typeFieldVal: payment.paymentMethodName,
                          });
                        }
                  }
                  className={
                    payment.paymentMethodCode === order.paymentMethodCode ? 'default' : 'common'
                  }
                >
                  <OverflowTip style={{ padding: '0 10px' }}>
                    {payment.paymentMethodName}
                  </OverflowTip>
                  {payment.paymentMethodCode === order.paymentMethodCode && (
                    <div className="default-icon">
                      <Icon type="done" />
                    </div>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
