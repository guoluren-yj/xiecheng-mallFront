import React, { useMemo } from 'react';
import { Form, Icon } from 'choerodon-ui';

// import moment from 'moment';
import { isEmpty } from 'lodash';

import Lov from 'components/NewLov';
// import Lov from 'components/lov';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import {
  getOrganizationId,
  // timestampToTime,
  getUserConfigInfo,
  getPrimaryColor,
} from 'utils/utils';

// const agentColumns = [
//   {
//     title: intl.get('mallf.myMall.model.purchaseAgentCode').d('采购员编码'),
//     width: 200,
//     dataIndex: 'purchaseAgentCode',
//     isQuery: true,
//   },
//   {
//     title: intl.get(`mallf.myMall.model.purchaseAgentName`).d('采购员名称'),
//     width: 200,
//     dataIndex: 'purchaseAgentName',
//     isQuery: true,
//   },
// ];
export default function EcInfo(props) {
  // const primaryColor = getPrimaryColor();
  const {
    defaultSetting,
    order,
    orderIndex,
    count,
    invoiceData,
    openModal,
    // orderTime,
    // invoiceCheckData = {},
    changePayAndPurchaseData,
    // form: { getFieldDecorator, setFieldsValue },
  } = props;
  const { minPurchaseFlag = 1, hideList = [] } = order;
  const flag = minPurchaseFlag === 0;
  const organizationId = getOrganizationId();
  // const [isOpen, setIsOpen] = useState(false);
  const invoiceInfo = useMemo(() => {
    const {
      [`${order.shoppingCartDTOList[0].productSource}${
        order.shoppingCartDTOList[0].dataType || ''
      }invoiceData`]: invoices = {},
    } = invoiceData;
    return invoices;
  }, [invoiceData, count]);
  const { paymentMethod = [], freightType = [] } = invoiceInfo;

  const { companyId } = getUserConfigInfo();
  // useEffect(() => {
  //   document.body.addEventListener('click', handleCloseTime, false);
  //   return () => {
  //     document.body.removeEventListener('click', handleCloseTime, false);
  //   };
  // }, []);

  // const handleCloseTime = e => {
  //   const element = document.querySelector('.ant-calendar-picker-container');
  //   if (element && !element.contains(e.target)) {
  //     setIsOpen(false);
  //   }
  // };

  // const handleTime = time => {
  //   return time.split(' ')[0];
  // };

  // 支付方式TODO
  const hidePaymentList = useMemo(() => {
    return (hideList || []).map((hide) => {
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
  const paymentMethodList = paymentMethod.filter((n) => !hidePaymentList.includes(n.valueCode));
  return (
    <div className="other-info">
      {defaultSetting && !isEmpty(paymentMethodList) && (
        <div className="up-down">
          <div className="info-label">
            <div className="info-label-pay label-required">
              {intl.get('mallf.companyOrder.model.paymentMethod').d('支付方式')}
            </div>
            <div className="pay-way-wrapper">
              {paymentMethodList.map((payment) => (
                <span
                  key={payment.valueCode}
                  title={payment.valueName}
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
                  {payment.valueName}
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
      {defaultSetting && !hideList.includes('FREIGHT_TYPE') && (
        <div>
          <div className="info-label label-required">
            {intl.get('mallf.companyOrder.model.FreightType').d('运费类型')}
          </div>
          <div className="pay-way-wrapper">
            {freightType.length > 0 ? (
              freightType.map((freight) => (
                <span
                  key={freight.valueCode}
                  title={freight.valueName}
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
                  {freight.valueName}
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
                  .get('mallf.companyOrder.model.FreightTypeNull')
                  .d('未维护运费类型，该申请单无法提交')}
              </span>
            )}
          </div>
        </div>
      )}
      {defaultSetting && !hideList.includes('INVOICE_INFO') && (
        <>
          <div>
            <div className="info-label invoice-title">
              {intl.get('mallf.companyOrder.model.invoiceInfo').d('发票信息')}
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
                {intl.get('mallf.companyOrder.view.check.invoiceInfo').d('请核对发票信息')}
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
                      {intl.get('mallf.companyOrder.model.invoiceType').d('发票类型')}:
                    </span>
                    <span className="invoice-info-content">{order.invoiceTypeName}</span>
                  </p>
                  <p className="invoice-info-line">
                    <span className="invoice-info-label text-overflow">
                      {intl.get('mallf.companyOrder.model.invoiceForm').d('发票形式')}:
                    </span>
                    <span className="invoice-info-content">{order.selectInvoiceName}</span>
                  </p>
                  {/* <p className="invoice-info-line">
                    <span className="invoice-info-label text-overflow">
                      {intl.get('mallf.myMall.model.invoiceDetail').d('开票明细')}:
                    </span>
                    <span className="invoice-info-content">{order.invoiceContentName}</span>
                  </p> */}
                </React.Fragment>
              ) : (
                <span style={{ color: '#ccc', textAlign: 'left' }}>
                  {intl
                    .get('mallf.companyOrder.view.updateInvoiceInfo')
                    .d('发票信息不完善，请点击修改选择发票信息')}
                </span>
              )}
            </div>
            {/* <div className="invoice-info" style={{ marginTop: 15 }}>
              <span>{intl.get('mallf.myMall.view.checkInvoiceInfo').d('发票详情查看')}</span>
              <p style={{ marginTop: 10 }} className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.myMall.model.invoiceTitle').d('发票抬头')}:
                </span>
                <span className="invoice-info-content">{invoiceCheckData.invoiceHeader}</span>
              </p>
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.myMall.model.taxId').d('税务登记号')}:
                </span>
                <span className="invoice-info-content">
                  {invoiceCheckData.taxRegistrationNumber}
                </span>
              </p>
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.myMall.model.openingBank').d('开户行')}:
                </span>
                <span className="invoice-info-content">{invoiceCheckData.depositBank}</span>
              </p>
              <p className="invoice-info-line">
                <span className="invoice-info-label text-overflow">
                  {intl.get('mallf.myMall.model.openingBankId').d('开户行账号')}:
                </span>
                <span className="invoice-info-content">{invoiceCheckData.bankAccountNum}</span>
              </p>
            </div> */}
          </div>
        </>
      )}
      {/* <div style={{ marginBottom: '20px' }}>
        <span className="info-label">
          {intl.get('mallf.myMall.model.requestDate').d('需求日期')}
        </span>
        <span>{handleTime(order.neededDate)}</span>
        <a
          style={{ marginLeft: '24px', color: flag ? '#ccc' : primaryColor }}
          onClick={flag ? null : () => setIsOpen(true)}
        >
          {intl.get('mallf.common.model.update').d('修改')}
        </a>
        <DatePicker
          open={isOpen}
          style={{ visibility: 'hidden' }}
          format="YYYY-MM-DD hh:mm:ss"
          allowClear={false}
          defaultValue={moment(order.neededDate)}
          onChange={(_, dateString) => {
            orderTime(dateString, orderIndex);
            setIsOpen(false);
          }}
          disabledDate={currentDate => moment(timestampToTime()).isAfter(currentDate, 'day')}
        />
      </div> */}
      {defaultSetting && !hideList.includes('ADDRESS') && (
        <Form.Item required>
          <Lov
            disabled={flag}
            inputStyle={{ width: 512 }}
            label={intl
              .get('mallf.companyOrder.view.myMall.invoiceAcAdress')
              .d('收单(发票)接收地址')}
            title={intl
              .get('mallf.companyOrder.view.myMall.invoiceAcAdress')
              .d('收单(发票)接收地址')}
            queryUrl={`${HmallConfig.apiGateway}/${
              HmallConfig.serviceName
            }/v1/${organizationId}/addresss/invoice-list/choose?addressType=INVOICE&enabledFlag=1&companyId=${
              order?.proxySupplierCompanyId || companyId
            }&isFlag=${order?.proxySupplierCompanyId ? 1 : 0}`}
            lovOptions={{ displayField: 'fullAddress', valueField: 'addressId' }}
            columns="acAddressColumns"
            textValue={order.invoiceFullAddress}
            placeholder={intl.get('mallf.companyOrder.view.choose.acAdress').d('请选择收单地址')}
            onOk={(v, values) => {
              changePayAndPurchaseData({
                index: orderIndex,
                type: 'invoiceAddressId',
                val: values.addressId,
                typeField: 'invoiceFullAddress',
                typeFieldVal: values.fullAddress,
              });
            }}
          />
        </Form.Item>
      )}
      {/* <InitContent
        initStyle
        visible={acAdressVisible}
        address
        viewInfo={{
          width: 940,
          lovRowKey: 'addressId',
          queryUrl: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list?addressType=INVOICE&enabledFlag=1&companyId=${companyId}`,
          columns: addressColumns,
          title: intl.get(`mallf.myMall.model.view.acAddressQuery`).d('收单地址查询'), // 地址查询
          displayField: 'fullAddress',
          valueField: 'addressId',
          otherField: 'fullAddress',
        }}
        // item={item}
        // textValue={item.address}
        addressType="INVOICE"
        onOkCallback={chooseAddress}
        toggle={() => setAcAdressVisible(prev => !prev)}
      /> */}
    </div>
  );
}
