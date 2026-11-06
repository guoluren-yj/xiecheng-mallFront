import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Icon, Spin } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';

import intl from 'utils/intl';
import numberRender from 'utils/numberRender';
import { fetchOMSInvoiceService, fetchOmsInvoiceLogistService } from 'services/invoiceMadalService';
import Link from 'components/Link';
import Loading from 'components/loading';
import OverflowTip from 'components/OverflowTip';
import style from './index.less';

function MyInvoiceModal(props) {
  // const { invoice = {} } = props;
  const [invoice, setInvoice] = useState(props.invoice || {});
  const [invoiceList, setInvoicetList] = useState([]);
  const [loading, setLoading] = useState(false);

  function onExpand(data, index) {
    if (data.invoiceTypeCode !== 'VAT_INVOICE') {
      // 普票不用看物流
      if (!data.expanded && !data.init) {
        // 没有数据则查询
        const setLineLoading = (flag = false) => {
          setInvoicetList((list) =>
            list.map((p, k) => (k === index ? { ...p, loading: flag } : p))
          );
        };
        setLineLoading(true);
        fetchOmsInvoiceLogistService({ consignmentCode: data.consignmentCode })
          .then((res = {}) => {
            if (res) {
              setInvoicetList((list) =>
                list.map((p, k) =>
                  k === index ? { ...p, expanded: !p.expanded, init: true, ...res } : p
                )
              );
            }
          })
          .finally(() => {
            setLineLoading();
          });
      } else {
        setInvoicetList((list) =>
          list.map((p, k) => (k === index ? { ...p, expanded: !p.expanded } : p))
        );
      }
    }
  }

  function fetchInvoiceData() {
    setLoading(true);
    fetchOMSInvoiceService({ consignmentCode: invoice.consignmentCode })
      .then((res = []) => {
        if (res) {
          setInvoice((n) => ({ ...n, ...res[0] }));
          setInvoicetList(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  return (
    <div className={style.content}>
      <Row className="invoice-modal-title">
        {intl.get('mallf.common.view.baseInfo').d('基本信息')}
      </Row>
      <Row className="invoice-modal-header">
        <Col span={2}>
          <OverflowTip>
            {intl.get('mallf.myInvoice.view.order.srmPoNum').d('商城订单号')}
          </OverflowTip>
        </Col>
        <Col span={6}>{invoice.orderCode}</Col>
        <Col span={2}>
          <OverflowTip>
            {intl.get('mallf.myMall.view.catalog.purchaseOrderNum').d('采购订单号')}{' '}
          </OverflowTip>
        </Col>
        <Col span={6}>{invoice.srmOrderCode}</Col>
        <Col span={2}>
          {' '}
          <OverflowTip>
            {intl.get('mallf.myMall.view.order.ecOrderNum').d('电商订单号')}{' '}
          </OverflowTip>
        </Col>
        <Col span={6}>{invoice.cecOrderCode}</Col>
      </Row>
      <Row className="invoice-modal-header">
        <Col span={2}>
          {' '}
          <OverflowTip>
            {intl.get('mallf.myMall.view.order.ecSubOrderNum').d('电商子订单号')}{' '}
          </OverflowTip>
        </Col>
        <Col span={6}>{invoice.ecConsignmentCode}</Col>
        <Col span={2}>
          {' '}
          <OverflowTip>
            {intl.get('mallf.myInvoice.model.invoiceMethod').d('开票方式')}
          </OverflowTip>{' '}
        </Col>
        <Col span={6}>{invoice.invoiceStateName}</Col>
      </Row>
      <Row className="invoice-modal-title padding-top-10">
        {intl.get('mallf.myInvoice.model.invoiceInfo').d('发票信息')}
      </Row>
      {loading ? <Loading /> : ''}
      {invoiceList?.map((item, index) => {
        return (
          <div className="invoice-detail-line">
            <Spin spinning={item.loading || false}>
              <Row onClick={() => onExpand(item, index)} className="invoice-detail-line-head">
                <Col span={7}>
                  <Icon
                    r-if={item.invoiceTypeCode !== 'VAT_INVOICE'}
                    type="navigate_next"
                    className={[
                      'c7n-pro-table-expand-icon',
                      'invoice-detail-expand-icon',
                      { 'c7n-pro-table-expand-icon-expanded': item.expanded },
                    ]}
                  />
                  <Link to={item.fileUrl} disabled={!item.fileUrl}>
                    <span className="invoice-detail-primary">
                      {intl.get('mallf.myInvoice.model.common.invoiceCode').d('发票代码')}：
                      {item.invoiceCode}
                    </span>
                  </Link>
                </Col>
                <Col span={6}>
                  {intl.get('mallf.myInvoice.model.common.TaxinvoiceNo.').d('税务发票号')}：
                  {item.invoiceBatch}
                </Col>
                <Col span={6}>
                  {intl.get('mallf.myInvoice.model.invoiceType').d('发票类型')}：
                  {item.invoiceTypeMeaning}
                </Col>
                <Col span={5} className="invoice-detail-line-last">
                  {intl.get('mallf.myInvoice.model.invoicePrice').d('发票总金额')}：
                  {numberRender(item.invoiceAmount)}
                </Col>
              </Row>
              {item.expanded && (
                <>
                  <Row className="invoice-detail-logistics-title">
                    <Col span={7}>
                      {intl.get('mallf.myInvoice.view.courier.number').d('快递单号')}：
                      {item.logisticsNo}
                    </Col>
                    <Col span={7}>
                      {intl.get('mallf.common.view.logistics.company').d('物流公司')}：
                      {item.logisticsCompany}
                    </Col>
                  </Row>
                  <div className="invoice-detail-logistics-info">
                    <Timeline>
                      {item?.invoiceTrack?.map((li, key) => {
                        return (
                          <div className="time-line">
                            <span className="logistics-time">
                              {item.invoiceTrack?.[key]?.operateTime?.split(' ')[0] !==
                                item.invoiceTrack?.[key - 1]?.operateTime?.split(' ')[0] && (
                                <span>{li.operateTime?.split(' ')[0]}</span>
                              )}
                              <span style={{ marginLeft: 8 }}>{li.operateTime?.split(' ')[1]}</span>
                            </span>
                            <Timeline.Item
                              className={{
                                'logistics-desc': true,
                                'c7n-timeline-item-last': key + 1 === item.invoiceTrack?.length,
                              }}
                            >
                              {li.content}
                            </Timeline.Item>
                          </div>
                        );
                      })}
                    </Timeline>
                  </div>
                </>
              )}
            </Spin>
          </div>
        );
      })}
    </div>
  );
}

export function openOmsInvoiceModal(props = {}, modalProps = {}) {
  Modal.open({
    destroyOnClose: true,
    mask: true,
    closable: false,
    drawer: true,
    style: { width: 1176 },
    title: intl.get('mallf.myInvoice.view.check.invoince').d('查看发票'),
    okText: intl.get('hzero.common.button.close').d('关闭'),
    cancelButton: false,
    children: <MyInvoiceModal {...props} />,
    ...modalProps,
  });
}
