import React from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';

export default function EcInfo(props) {
  const { order = {}, orderIndex, openModal } = props;
  const { minPurchaseFlag = 1 } = order;
  const flag = minPurchaseFlag === 0;

  return (
    <div className="other-info">
      <div>
        <div className="info-label invoice-title">
          {intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
          <Icon
            onClick={flag ? null : () => openModal(orderIndex)}
            type="mode_edit"
            style={{
              fontSize: 14,
              position: 'relative',
              top: -1,
              left: 7,
              color: flag ? '#ccc' : getPrimaryColor(),
              cursor: 'pointer',
            }}
          />
          <Icon
            type="error"
            style={{
              color: '#FCA000',
              marginLeft: 12,
              marginTop: -3,
              fontSize: 18,
              marginRight: 2,
            }}
          />
          <span style={{ color: '#666666' }}>
            {intl.get('mallf.common.view.check.invoiceInfo').d('请核对发票信息')}
          </span>
        </div>
        <div className="invoice-info">
          {order.invoiceMethodCode &&
          order.invoiceTypeCode &&
          order.invoiceTitleTypeCode &&
          order.invoiceDetailTypeCode ? (
            <React.Fragment>
              {/* <p className="invoice-info-line">
                      <span className="invoice-info-label text-overflow">
                        {intl.get('mallf.myMall.model.invoiceMethod').d('开票方式')}:
                      </span>
                      <span className="invoice-info-content">{order.invoiceStatusName}</span>
                    </p> */}
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.myMall.model.invoiceType').d('发票类型')}:
                </span>
                <span className="invoice-info-content">{order.invoiceTypeName}</span>
              </p>
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.common.model.invoiceForm').d('发票形式')}:
                </span>
                <span className="invoice-info-content">{order.selectInvoiceName}</span>
              </p>
            </React.Fragment>
          ) : (
            <span style={{ color: '#ccc', textAlign: 'left' }}>
              {intl
                .get('mallf.companyOrder.view.updateInvoiceInfo')
                .d('发票信息不完善，请点击修改选择发票信息')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
