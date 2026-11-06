import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import { Row, Col, Tooltip, Modal, Button, Attachment, DataSet } from 'choerodon-ui/pro';

import cuxComponent from 'cuxTools/cuxComponent';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { getUserConfigInfo, getPrimaryColor, getCustVisible } from 'utils/utils';
import intl from 'utils/intl';
import FillInfo from 'components/FillInfo';
import { AutoRow } from 'components/AutoGrid';
import { SpanTitle } from 'utils/renderer';
import OverflowTip from 'components/OverflowTip';
import { HEADER_PAYINFO, DOC_INFO, CONSIGNEE_INFO } from 'utils/customizeCode';

import InvoiceModal from './InvoiceModal';
import openPrint from '../MyMall/OMSOrder/common/Print';

const { Group } = Attachment;
function HeaderInfo(props) {
  const {
    colSpan,
    order,
    isSaleType,
    unitConfig,
    headerCode,
    cSupply,
    FillHeaderCode,
    dataSet,
    isReceive,
    orderCode,
    customizeDisplay,
  } = props;
  const [warpDelay, setWarpDelay] = useState(99999999);
  const reamrkPopover = useRef(null);
  const { isNewCart } = getUserConfigInfo();
  const fields = unitConfig?.[headerCode]?.fields || [];
  const companyLov = fields.find((f) => f.fieldCode === 'companyLov') || {};
  const invOrganizationLov = fields.find((f) => f.fieldCode === 'invOrganizationLov') || {};
  const ouLov = fields.find((f) => f.fieldCode === 'ouLov') || {};
  const purchaseOrgLov = fields.find((f) => f.fieldCode === 'purchaseOrgLov') || {};

  const headerInfoDS = useMemo(() => new DataSet({ data: [order] }), []);

  useEffect(() => {
    if (
      reamrkPopover.current &&
      reamrkPopover.current.scrollWidth > reamrkPopover.current.clientWidth
    ) {
      setWarpDelay(0);
    }
  });

  function openInvoice() {
    const modal = Modal.open({
      destroyOnClose: true,
      title: intl.get('mallf.common.view.sigl.invoiceInfo').d('开票信息'),
      mask: true,
      closable: true,
      style: { width: 380 },
      drawer: true,
      children: <InvoiceModal order={order} />,
      footer: [
        <Button onClick={() => modal.close()} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
      ],
    });
  }
  // 展示映射oms头字段
  const { headerCustomizedList: list = [] } =
    order.poOrderEntryVO?.[0]?.orderEntryVOS?.[0].dimValueDTO || {};
  const headerCustomizedList = list.filter((n) => n.mappingHeadFlag === 1);

  return (
    <div className="service-list">
      <div className="service-list-header">
        {intl.get(`mallf.orderDetail.view.orderDetail.detail`).d('订单信息')}
      </div>
      <div className="service-list-content">
        <AutoRow gutter={12}>
          <Col r-if={isReceive} span={colSpan}>
            <Row className="list-title">
              {intl.get(`mallf.orderDetail.view.orderDetail.kufangInfo`).d('库房信息')}
            </Row>
            <Row className="list-title">
              <span className="label">
                <OverflowTip>
                  {intl.get('mallf.myOrder.view.recive.kufang').d('领用库房')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.receiverAddress?.inventoryName}</span>
            </Row>
            <Row style={{ display: 'flex' }} className="list-title">
              <span className="label">
                <OverflowTip>
                  {intl.get('mallf.myOrder.view.kufang.address').d('库房地址')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content" style={{ 'word-break': 'break-all' }}>
                <OverflowTip>{`${order.receiverAddress?.address || '-'}`}</OverflowTip>
              </span>
            </Row>
          </Col>
          <Col r-if={!isReceive} span={colSpan}>
            <Row className="list-title" r-title>
              {intl.get(`mallf.orderDetail.view.orderDetail.recInformation`).d('收货人信息')}
            </Row>
            {customizeDisplay(
              { code: CONSIGNEE_INFO, dataSet: headerInfoDS },
              <>
                <Row className="list-title" data-field="contactName">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.recipient`).d('收货人')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content text-overflow">
                    {order.receiverAddress?.contactName}
                  </span>
                </Row>
                <Row style={{ display: 'flex' }} className="list-title" data-field="recAddress">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.recAddress`).d('收货地址')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">
                    <OverflowTip>
                      {`${order.receiverAddress?.fullAddress || ''}${order.address || ''}`}
                    </OverflowTip>
                  </span>
                </Row>
                <Row className="list-title" data-field="contactInformation">
                  <span className="label">
                    <OverflowTip>
                      {' '}
                      {intl
                        .get(`mallf.orderDetail.view.orderDetail.contactInformation`)
                        .d('联系方式')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">
                    <Tooltip
                      title={
                        <>
                          <Icon
                            type="phone_iphone"
                            style={{ fontSize: '14px', margin: '-3px 5px 0 0' }}
                          />
                          {intl.get(`mallf.common.view.phone`).d('手机')}
                        </>
                      }
                    >
                      <p style={{ marginBottom: '5px', width: 'max-content' }}>
                        {order.receiverAddress?.fullPhone}
                      </p>
                    </Tooltip>
                    <Tooltip
                      title={
                        <>
                          <Icon type="phone" style={{ fontSize: '14px', margin: '-3px 5px 0 0' }} />
                          {intl.get(`mallf.common.view.fixedPhone`).d('固定电话')}
                        </>
                      }
                    >
                      {order.receiverAddress?.telPhone}
                    </Tooltip>
                  </span>
                </Row>
              </>
            )}
          </Col>
          <Col r-if={!isReceive} span={colSpan}>
            <Row className="list-title" r-title>
              {intl.get(`mallf.orderDetail.view.orderDetail.payInformation`).d('付款信息')}
            </Row>
            {customizeDisplay(
              { code: HEADER_PAYINFO, dataSet: headerInfoDS },
              <>
                <Row className="list-title" data-field="paymentTime">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.payTime`).d('支付时间')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">{order.paymentTime || '-'}</span>
                </Row>
                <Row className="list-title" data-field="paymentType">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.payMethod`).d('付款方式')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">
                    {(isSaleType ? order.proxyPaymentTypeMeaning : order.paymentTypeMeaning) || '-'}
                  </span>
                </Row>
                <Row className="list-title" data-field="totalPrice">
                  <span className="label">
                    <OverflowTip>
                      {intl
                        .get(`mallf.orderDetail.view.orderDetail.totalPrice`)
                        .d('商品金额(含税)')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">
                    <SpanTitle>
                      {order?.currencySymbol || ''}
                      {order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
                        order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
                    </SpanTitle>
                  </span>
                </Row>
              </>
            )}
          </Col>
          {!!isNewCart && (
            <Col
              span={colSpan}
              r-if={getCustVisible(fields, [
                { name: 'companyLov' },
                { name: 'ouLov', hidden: isReceive },
                { name: 'invOrganizationLov', hidden: isReceive },
                { name: 'purchaseOrgLov', hidden: isReceive },
              ])}
            >
              <Row
                className="list-title"
                title={intl.get(`mallf.common.view.newCart.tradeInformation`).d('交易组织信息')}
              >
                {intl.get(`mallf.common.view.newCart.tradeInformation`).d('交易组织信息')}
              </Row>
              <Row r-if={companyLov.visible !== 0} className="list-title">
                <span className="label">
                  <OverflowTip>
                    {companyLov.fieldName ||
                      intl.get(`mallf.common.view.company.name`).d('公司名称')}
                  </OverflowTip>
                  ：
                </span>
                <span className="label-content text-overflow" r-title>
                  {order.purchaseCompanyName || '-'}
                </span>
              </Row>
              <Row r-if={ouLov.visible !== 0 && !isReceive} className="list-title">
                <span className="label">
                  <OverflowTip>
                    {ouLov.fieldName || intl.get(`mallf.common.model.businessEntity`).d('业务实体')}
                  </OverflowTip>
                  ：
                </span>
                <span className="label-content text-overflow" r-title>
                  {order.poOrderEntryVO?.[0].orderEntryVOS?.[0]?.ouName || '-'}
                </span>
              </Row>
              <Row r-if={invOrganizationLov.visible !== 0 && !isReceive} className="list-title">
                <span className="label">
                  <OverflowTip>
                    {invOrganizationLov.fieldName ||
                      intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
                  </OverflowTip>
                  ：
                </span>
                <span className="label-content text-overflow" r-title>
                  {order.poOrderEntryVO?.[0].orderEntryVOS?.[0]?.invOrganizationName || '-'}
                </span>
              </Row>
              <Row r-if={purchaseOrgLov.visible !== 0 && !isReceive} className="list-title">
                <span className="label">
                  <OverflowTip>
                    {' '}
                    {purchaseOrgLov.fieldName ||
                      intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
                  </OverflowTip>
                  ：
                </span>
                <span className="label-content text-overflow" r-title>
                  {order.poOrderEntryVO?.[0].orderEntryVOS?.[0]?.purOrganizationName || '-'}
                </span>
              </Row>
            </Col>
          )}
          {!isNewCart &&
            ((order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL') ||
              isSaleType) && (
              <Col span={colSpan}>
                <Row className="list-title" r-title>
                  {intl.get(`mallf.orderDetail.view.orderDetail.invoiceInfo`).d('发票信息')}
                </Row>
                <Row className="list-title">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.invoiceType`).d('发票类型')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">{order.purOrderExtra?.invoiceTypeName}</span>
                </Row>
                <Row className="list-title">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.invoiceModus`).d('发票形式')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">{order.purOrderExtra?.invoiceTitleTypeName}</span>
                </Row>
                <Row className="list-title">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.invoiceTitle`).d('发票抬头')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">{order.purOrderExtra?.invoiceTitle}</span>
                </Row>
                {/* <Row>
                  <span className="label">
                    {intl.get(`mallf.orderDetail.view.orderDetail.invoiceContent`).d('发票内容')}：
                  </span>
                  <span className="label-content">{order.purOrderExtra?.invoiceContentName}</span>
                </Row> */}
              </Col>
            )}
          <Col span={colSpan}>
            <Row className="list-title">{intl.get('mallf.common.model.docInfo').d('单据信息')}</Row>
            {customizeDisplay(
              { code: DOC_INFO, dataSet: headerInfoDS },
              <>
                <Row className="list-title" data-field="cecCreatedTime">
                  <span className="label">
                    <OverflowTip>
                      {intl.get(`mallf.orderDetail.view.orderDetail.orderTime`).d('下单时间')}
                    </OverflowTip>
                    ：
                  </span>
                  <span className="label-content">{order.cecCreatedTime}</span>
                </Row>
                <Row className="list-title" data-field="prType">
                  <OverflowTip className="label">
                    {intl.get(`mallf.orderDetail.view.prType`).d('采购申请类型')}：
                  </OverflowTip>
                  <Tooltip title={order.prTypeName}>
                    <span ref={reamrkPopover} className="label-content">
                      {order.prTypeName}
                    </span>
                  </Tooltip>
                </Row>
                <Row className="list-title" data-field="remark">
                  <span className="label">
                    {intl.get(`mallf.orderDetail.model.remark`).d('备注')}：
                  </span>
                  <Tooltip title={order.remark} mouseEnterDelay={warpDelay}>
                    <span ref={reamrkPopover} className="label-content order-remark">
                      {order.remark}
                    </span>
                  </Tooltip>
                </Row>
              </>
            )}
            <CuxWrapper path="OMSOrderDetail/HeaderInfo/OtherInfo" value={{ data: order }} />
            <Row className="list-title display-flex-item">
              <div className="oprate-btns text-overflow">
                <Group text={intl.get('mallf.common.view.attachment.info').d('附件信息')}>
                  <Attachment
                    readOnly
                    showHistory
                    viewMode="list"
                    funcType="link"
                    label={intl.get('mallf.common.view.innerAttachment').d('内部附件')}
                    labelLayout="float"
                    value={order?.attachmentUuid}
                    bucketName="private-bucket"
                    bucketDirectory="mall-front"
                  />
                  <Attachment
                    readOnly
                    showHistory
                    viewMode="list"
                    funcType="link"
                    label={intl.get('mallf.common.view.outterAttachment').d('外部附件')}
                    labelLayout="float"
                    value={order?.outerAttachmentUuid}
                    bucketName="private-bucket"
                    bucketDirectory="mall-front"
                  />
                </Group>
              </div>
              <FillInfo
                className="oprate-btns text-overflow"
                dataSet={dataSet}
                cSupply={cSupply}
                unitConfig={unitConfig}
                dataSource={order}
                code={headerCode}
                fillCode={FillHeaderCode}
                isReceive={isReceive}
                headerCustomizedList={headerCustomizedList || []}
              />
              <div className="oprate-btns text-overflow" span={6} r-if={isNewCart && !isReceive}>
                <a style={{ color: getPrimaryColor() }} onClick={() => openInvoice()}>
                  <OverflowTip>
                    {intl.get(`mallf.orderDetail.view.orderDetail.invoiceInfo`).d('发票信息')}
                  </OverflowTip>
                </a>
              </div>
              <div
                title={intl.get(`mallf.orderDetail.button.lingyongOrder.print`).d('打印订单')}
                className="oprate-btns text-overflow"
                span={5}
                r-if={isReceive && order.print}
              >
                <a
                  style={{ color: getPrimaryColor() }}
                  onClick={() => openPrint({ ...order, orderCode })}
                >
                  {intl.get(`mallf.orderDetail.button.lingyongOrder.print`).d('打印订单')}
                </a>
              </div>
            </Row>
          </Col>
        </AutoRow>
      </div>
    </div>
  );
}
export default cuxComponent({ path: 'OMSOrderDetail/HeaderInfo' })(HeaderInfo);
