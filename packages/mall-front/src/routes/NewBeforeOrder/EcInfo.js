import React, { useMemo } from 'react';
import { Form, Icon } from 'choerodon-ui';

import qs from 'querystring';
import { isEmpty } from 'lodash';

import Lov from 'components/NewLov';
import CuxFn from '@/cuxTools/cuxFn';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { getOrganizationId, getPrimaryColor } from 'utils/utils';
import OverflowTip from 'components/OverflowTip';

export default function EcInfo(props) {
  const { order, orderIndex, count, invoiceData, openModal, changePayAndPurchaseData } = props;
  const { minPurchaseFlag = 1, hideList = [] } = order;
  const flag = minPurchaseFlag === 0;
  const organizationId = getOrganizationId();
  // const [isOpen, setIsOpen] = useState(false);
  const invoiceInfo = useMemo(() => {
    const {
      [`${order.shoppingCartDTOList[0].productSource}${
        order.shoppingCartDTOList[0].dataType || ''
      }${order.proxySupplierCompanyId || order.companyId}invoiceData`]: invoices = {},
    } = invoiceData;
    return invoices;
  }, [invoiceData, count]);
  const { paymentMethod = [], freightType = [] } = invoiceInfo;

  // 发票lov的值集参数
  const getInvoiceParams = CuxFn({
    name: 'NewBeforeOrder-fn-getECInvoiceParams', // 永祥二开收单地址
    value: { order },
  })(() => {
    return qs.stringify({
      addressType: 'INVOICE',
      enabledFlag: 1,
      companyId: order?.proxySupplierCompanyId || order?.companyId,
      isFlag: order?.proxySupplierCompanyId ? 1 : 0,
    });
  });

  const getColumns = CuxFn({
    name: 'NewBeforeOrder-fn-getColumns',
  })(() => 'acAddressColumns');

  // 支付方式TODO
  const hidePaymentList = useMemo(() => {
    return hideList.map((hide) => {
      let newHide = hide;
      switch (newHide) {
        // 账期支付
        case 'ACCOUNT':
          newHide = '1';
          return newHide;
        // 货到付款
        case 'DELIVERY':
          newHide = '2';
          return newHide;
        // 公司转账
        case 'COMPANY':
          newHide = '3';
          return newHide;
        // 余额支付
        case 'BALANCE':
          newHide = '4';
          return newHide;
        // 在线支付
        case 'ONLINE':
          newHide = '5';
          return newHide;
        // 汇款支付
        case 'REMITTANCE':
          newHide = '6';
          return newHide;
        default:
          break;
      }
      return newHide;
    });
  }, [hideList]);
  // console.log(invoiceData, hideList, paymentMethod);
  const paymentMethodList = paymentMethod.filter((n) => !hidePaymentList.includes(n.valueCode));

  return (
    <div className="other-info">
      {/* <p className="other-info-title">内部采购申请</p> */}
      {!isEmpty(paymentMethodList) && (
        <div className="up-down">
          <div className="info-label">
            <div className="info-label-pay label-required">
              {intl.get('mallf.myMall.model.paymentMethod').d('支付方式')}
            </div>
            <div className="pay-way-wrapper">
              {paymentMethodList.map((payment) => (
                <span
                  key={payment.valueCode}
                  onClick={
                    flag
                      ? null
                      : () => {
                          changePayAndPurchaseData({
                            index: orderIndex,
                            type: 'paymentMethodCode',
                            val: payment.valueCode,
                            typeField: 'paymentMethodName',
                            typeFieldVal: payment.valueName,
                          });
                        }
                  }
                  className={payment.valueCode === order.paymentMethodCode ? 'default' : 'common'}
                >
                  <OverflowTip style={{ padding: '0 10px' }}>{payment.valueName}</OverflowTip>
                  {payment.valueCode === order.paymentMethodCode && (
                    <div className="default-icon">
                      <Icon type="done" />
                    </div>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {!hideList.includes('FREIGHT_TYPE') && (
        <div>
          <div className="info-label label-required">
            {intl.get('mallf.common.model.FreightType').d('运费类型')}
          </div>
          <div className="pay-way-wrapper">
            {freightType.length > 0 ? (
              freightType.map((freight) => (
                <span
                  key={freight.valueCode}
                  onClick={() => {
                    changePayAndPurchaseData({
                      index: orderIndex,
                      type: 'freightType',
                      val: freight.valueCode,
                      typeField: 'freightTypeName',
                      typeFieldVal: freight.valueName,
                    });
                  }}
                  className={freight.valueCode === order.freightType ? 'default' : 'common'}
                >
                  <OverflowTip style={{ padding: '0 10px' }}>{freight.valueName}</OverflowTip>
                  {freight.valueCode === order.freightType && (
                    <div className="default-icon">
                      <Icon type="done" />
                    </div>
                  )}
                </span>
              ))
            ) : (
              <span style={{ color: '#ff0000', textAlign: 'left' }}>
                {intl
                  .get('mallf.common.model.FreightTypeNull')
                  .d('未维护运费类型，该申请单无法提交')}
              </span>
            )}
          </div>
        </div>
      )}
      {!hideList.includes('INVOICE_INFO') && (
        <>
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
        </>
      )}
      {!hideList.includes('ADDRESS') && (
        <Form.Item required>
          <Lov
            disabled={flag}
            inputStyle={{ width: 512 }}
            label={intl.get('mallf.myMall.view.myMall.invoiceAcAdress').d('收单(发票)接收地址')}
            title={intl.get('mallf.myMall.view.myMall.invoiceAcAdress').d('收单(发票)接收地址')}
            queryUrl={`${HmallConfig.apiGateway}/${
              HmallConfig.serviceName
            }/v1/${organizationId}/addresss/invoice-list/choose?${getInvoiceParams()}`}
            lovOptions={{ displayField: 'fullAddress', valueField: 'addressId' }}
            columns={getColumns()}
            textValue={order.fullInvoiceAddress}
            placeholder={intl.get('mallf.common.view.choose.acAdress').d('请选择收单地址')}
            onOk={(v, values) => {
              changePayAndPurchaseData({
                index: orderIndex,
                type: 'invoiceAddressId',
                val: values.addressId,
                typeField: 'fullInvoiceAddress',
                typeFieldVal: values.fullAddress,
              });
            }}
          />
        </Form.Item>
      )}
    </div>
  );
}
