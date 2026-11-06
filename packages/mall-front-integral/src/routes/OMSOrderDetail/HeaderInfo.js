import React from 'react';
import { Row, Col, Icon, Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getPrimaryColor, numberRender } from 'utils/utils';
import { SpanTitle } from 'mall-front/lib/utils/renderer';
import OverflowTip from 'components/OverflowTip';
import InvoiceModal from './InvoiceModal';

export default function HeaderInfo(props) {
  const { order, isSaleType, getOrderTotalMount } = props;

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

  return (
    <div className="service-list">
      <div className="service-list-header">
        {intl.get(`mallf.orderDetail.view.orderDetail.detail`).d('订单信息')}
      </div>
      <div className="service-list-content">
        <Row gutter={12}>
          <Col span={8}>
            <Row className="list-title">
              {intl.get(`mallf.orderDetail.view.orderDetail.recInformation`).d('收货人信息')}
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.recipient`).d('收货人')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.receiverAddress?.contactName}</span>
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {' '}
                  {intl.get(`mallf.orderDetail.view.orderDetail.contactInformation`).d('联系方式')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.receiverAddress?.fullPhone}</span>
            </Row>
            <Row style={{ display: 'flex' }}>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.recAddress`).d('收货地址')}
                </OverflowTip>
                ：
              </span>
              <span
                className="label-content content-address"
                title={`${order.receiverAddress?.fullAddress || ''}${order.address || ''}`}
              >
                {`${order.receiverAddress?.fullAddress || ''}${order.address || ''}`}
              </span>
            </Row>
          </Col>
          <Col span={8}>
            <Row className="list-title">
              {intl.get(`mallf.orderDetail.view.orderDetail.payInformation`).d('付款信息')}
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.orderTime`).d('下单时间')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.cecCreatedTime}</span>
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.payTime`).d('支付时间')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.paymentTime || '-'}</span>
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.payMethod`).d('付款方式')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content">{order.paymentModelMeaning}</span>
            </Row>
            <Row>
              <span className="label">
                <OverflowTip>
                  {intl.get(`mallf.orderDetail.view.orderDetail.totalPrice`).d('商品金额(含税)')}
                </OverflowTip>
                ：
              </span>
              <span className="label-content text-overflow">
                <span r-if={+getOrderTotalMount().totalSigl !== 0}>
                  <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                  <SpanTitle>{numberRender(getOrderTotalMount().totalSigl)}</SpanTitle>
                  <span
                    r-if={+getOrderTotalMount().totalMoney !== 0}
                    style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
                  >
                    +
                  </span>
                </span>
                <span r-if={+getOrderTotalMount().totalMoney !== 0}>
                  {order?.currencySymbol || ''}
                  <SpanTitle>{getOrderTotalMount().totalMoney}</SpanTitle>
                </span>
              </span>
            </Row>
          </Col>
          {((order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL') || isSaleType) && (
            <Col span={8}>
              <Row className="list-title">
                {intl.get(`mallf.orderDetail.view.orderDetail.invoiceInfo`).d('发票信息')}
                {order.purOrderExtra?.invoiceState !== 'NO_NEED_INVOICE' && (
                  <Icon
                    type="find_in_page"
                    style={{
                      color: getPrimaryColor(),
                      fontSize: 12,
                      verticalAlign: 'baseline',
                      cursor: 'pointer',
                    }}
                    onClick={() => openInvoice()}
                  />
                )}
              </Row>
              {order.purOrderExtra?.invoiceState !== 'NO_NEED_INVOICE' && (
                <>
                  <Row>
                    <span className="label">
                      <OverflowTip>
                        {intl.get(`mallf.orderDetail.view.orderDetail.invoiceType`).d('发票类型')}
                      </OverflowTip>
                      ：
                    </span>
                    <span className="label-content">{order.purOrderExtra?.invoiceTypeName}</span>
                  </Row>
                  <Row>
                    <span className="label">
                      <OverflowTip>
                        {intl.get(`mallf.orderDetail.view.orderDetail.invoiceModus`).d('发票形式')}
                      </OverflowTip>
                      ：
                    </span>
                    <span className="label-content">
                      {order.purOrderExtra?.invoiceTitleTypeName}
                    </span>
                  </Row>
                  <Row>
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
                      {intl.get(`mallf.orderDetail.view.orderDetail.invoiceContent`).d('发票内容')}
                      ：
                    </span>
                    <span className="label-content">{order.purOrderExtra?.invoiceContentName}</span>
                  </Row> */}
                </>
              )}
              <Row>
                <span className="label">
                  <OverflowTip>
                    {intl.get('mallf.orderDetail.model.invoiceMethod').d('开票方式')}
                  </OverflowTip>
                  ：
                </span>
                <span className="label-content">{order.purOrderExtra?.invoiceStateName}</span>
              </Row>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}
