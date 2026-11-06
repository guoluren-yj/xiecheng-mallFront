import React from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import OverflowTip from 'components/OverflowTip';

export default function InternalPurchasInfo(props) {
  const { order, orderIndex, openModal } = props;
  const { minPurchaseFlag = 1, shoppingCartDTOList = [] } = order;
  const { agreementType } = shoppingCartDTOList[0]; // 销售协议时才展示内采支付信息
  const flag = minPurchaseFlag === 0;

  return (
    agreementType === 'SALE' && (
      <div className="other-info">
        {/* <p className="other-info-title inner-title">
          {intl.get('mallf.common.view.sigl.invoiceInfo').d('开票信息')}
        </p> */}
        <div>
          <div className="info-label invoice-title">
            {intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
            <Icon
              onClick={flag ? null : () => openModal(orderIndex, 'cata')}
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
          </div>
          <div className="invoice-info">
            {order.innerInvoiceMethodCode &&
            order.innerInvoiceTypeCode &&
            order.innerInvoiceTitleTypeCode &&
            order.innerInvoiceDetailTypeCode ? (
              <React.Fragment>
                <p className="invoice-info-line">
                  <span className="invoice-info-label text-overflow">
                    {intl.get('mallf.myMall.model.invoiceType').d('发票类型')}:
                  </span>
                  <span className="invoice-info-content">{order.innerInvoiceTypeName}</span>
                </p>
                <p className="invoice-info-line">
                  <span className="invoice-info-label text-overflow">
                    {intl.get('mallf.common.model.invoiceForm').d('发票形式')}:
                  </span>
                  <span className="invoice-info-content">{order.innerSelectInvoiceName}</span>
                </p>
              </React.Fragment>
            ) : order.innerInvoiceMethodCode === '2' ? (
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  <OverflowTip>
                    {intl.get('mallf.myMall.model.invoiceMethod').d('开票方式')}
                  </OverflowTip>
                  :
                </span>
                <span className="invoice-info-content">{order.innerInvoiceStatusName}</span>
              </p>
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
    )
  );
}
