import React from 'react';
import { Form, Icon } from 'choerodon-ui';

import { isEmpty } from 'lodash';
import cuxComponent from 'cuxTools/cuxComponent';
import Lov from 'components/NewLov';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { getOrganizationId, getUserConfigInfo, getPrimaryColor } from 'utils/utils';

function InternalPurchasInfo(props) {
  const { order, orderIndex, openModal, changePayAndPurchaseData } = props;
  const { minPurchaseFlag = 1, shoppingCartDTOList = [] } = order;
  const { agreementType } = shoppingCartDTOList[0]; // 销售协议时才展示内采支付信息
  const flag = minPurchaseFlag === 0;
  const organizationId = getOrganizationId();

  const { companyId, hideInnerMenuList = [] } = getUserConfigInfo();

  return (
    agreementType === 'SALE' &&
    !isEmpty(hideInnerMenuList) && (
      <div className="other-info">
        <p className={`other-info-title ${isEmpty(hideInnerMenuList) && 'inner-title'}`}>
          {intl.get('mallf.companyOrder.view.innerInfo').d('内部采购申请')}
        </p>
        {hideInnerMenuList.includes('PAYMENT_METHOD') && (
          <div className="up-down">
            <div className="info-label">
              <div className="info-label-pay label-required">
                {intl.get('mallf.myMall.model.paymentMethod').d('支付方式')}
              </div>
              <div className="pay-way-wrapper">
                <span
                  // key={payment.valueCode}
                  title={order.innerPaymentMethodName}
                  className="default"
                >
                  {order.innerPaymentMethodName}
                  <div className="default-icon">
                    <Icon type="done" />
                  </div>
                </span>
              </div>
            </div>
          </div>
        )}
        {hideInnerMenuList.includes('INVOICE_INFO') && (
          <>
            <div>
              <div className="info-label invoice-title">
                {intl.get('mallf.companyOrder.model.invoiceInfo').d('发票信息')}
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
                {order.innerInvoiceMethodCode === '2' ? (
                  <p className="invoice-info-line">
                    <span className="invoice-info-label text-overflow">
                      {intl.get('mallf.companyOrder.model.invoiceMethod').d('开票方式')}:
                    </span>
                    <span className="invoice-info-content">{order.innerInvoiceStatusName}</span>
                  </p>
                ) : order.innerInvoiceMethodCode &&
                  order.innerInvoiceTypeCode &&
                  order.innerInvoiceTitleTypeCode &&
                  order.innerInvoiceDetailTypeCode ? (
                    <>
                      <p className="invoice-info-line">
                        <span className="invoice-info-label text-overflow">
                          {intl.get('mallf.companyOrder.model.invoiceType').d('发票类型')}:
                        </span>
                        <span className="invoice-info-content">{order.innerInvoiceTypeName}</span>
                      </p>
                      <p className="invoice-info-line">
                        <span className="invoice-info-label text-overflow">
                          {intl.get('mallf.companyOrder.model.invoiceForm').d('发票形式')}:
                        </span>
                        <span className="invoice-info-content">{order.innerSelectInvoiceName}</span>
                      </p>
                    </>
                ) : (
                  <span style={{ color: '#ccc', textAlign: 'left' }}>
                    {intl
                      .get('mallf.companyOrder.view.updateInvoiceInfo')
                      .d('发票信息不完善，请点击修改选择发票信息')}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
        {hideInnerMenuList.includes('RECEIVE_ADDRESS') && (
          <Form.Item>
            <Lov
              disabled={flag}
              inputStyle={{ width: 512 }}
              label={intl
                .get('mallf.companyOrder.view.myMall.invoiceAcAdress')
                .d('收单(发票)接收地址')}
              title={intl
                .get('mallf.companyOrder.view.myMall.invoiceAcAdress')
                .d('收单(发票)接收地址')}
              queryUrl={`${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/invoice-list/choose?addressType=INVOICE&enabledFlag=1&companyId=${companyId}`}
              lovOptions={{ displayField: 'fullAddress', valueField: 'addressId' }}
              columns="acAddressColumns"
              textValue={order.innerInvoiceFullAddress}
              placeholder={intl.get('mallf.companyOrder.view.choose.acAdress').d('请选择收单地址')}
              onOk={(v, values) => {
                changePayAndPurchaseData({
                  index: orderIndex,
                  type: 'innerInvoiceAddressId',
                  val: values.addressId,
                  typeField: 'innerInvoiceFullAddress',
                  typeFieldVal: values.fullAddress,
                });
              }}
            />
          </Form.Item>
        )}
      </div>
    )
  );
}

export default cuxComponent({ path: 'BeforeCompanyOrder/InternalPurchasInfo' })(
  InternalPurchasInfo
);
