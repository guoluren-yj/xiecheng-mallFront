/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { Modal, Button, Row, Col, Timeline, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import Link from 'components/Link';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import { getPrimaryColor, getOrganizationId } from 'utils/utils';
import {
  fetchInvoiceService,
  fetchInvoiceLogistService,
  fetchOMSInvoiceService,
  fetchOmsInvoiceLogistService,
} from 'services/invoiceMadalService';
import style from './index.less';

const { Sidebar } = Modal;
export default function InvoiceModal(props) {
  const { visible, toggleModal, product, isOMS } = props;
  const {
    itemName,
    ecPoNum, // 电商订单
    poSubNum, // 子订单
    invoiceTypeName = '', // 发票类型
    platformCode,
    invoiceStateName,
    srmPoNum,
    invoiceMaterial,
    consignmentCode,
  } = product;
  const [ecEcinvoiceAclines, setEcEcinvoiceAclines] = useState([]);
  const [omsInvoice, setOmsINvoice] = useState({});
  const [logisVisible, setLogisVisible] = useState(false);
  const [trackData, setTrackData] = useState({});

  function fetchInvoiceData() {
    if (isOMS) {
      fetchOMSInvoiceService({ orderEntryId: product.orderEntryId }).then((res) => {
        setOmsINvoice(res);
        const data = Array.isArray(res) ? res[0] || {} : res;
        if (data.invoiceTypeCode === 'SPECIAL_INVOICE') {
          fetchOmsInvoiceLogistService({ consignmentCode }).then((logist) => {
            setTrackData(logist);
          });
        }
      });
    } else {
      fetchInvoiceService(platformCode, poSubNum).then((res) => {
        setEcEcinvoiceAclines(res.ecEcinvoiceAclines);
      });
    }
  }

  function fetchInvoiceLogist() {
    const query = {
      supplierCode: platformCode,
      thirdOrderId: ecPoNum,
      tenantId: getOrganizationId(),
    };
    fetchInvoiceLogistService(query).then((res) => {
      setTrackData(res);
    });
  }

  useEffect(() => {
    fetchInvoiceData();
    if (invoiceMaterial == 2) {
      fetchInvoiceLogist();
    }
  }, []);

  const invoice = ecEcinvoiceAclines[0] || omsInvoice;

  const data = trackData?.invoiceTrack;

  return (
    <>
      <Sidebar
        title={intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
        className={style.content}
        visible={visible}
        width={742}
        onCancel={toggleModal}
        footer={[
          <Button
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={toggleModal}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <p className="content-title">{itemName}</p>
        <Row className="line-item">
          {ecPoNum && (
            <Col span={12}>
              <span
                className="line-item-label"
                title={intl.get('mallf.common.view.order.ecOrderNum').d('电商订单号')}
              >
                {intl.get('mallf.common.view.order.ecOrderNum').d('电商订单号')}:
              </span>
              <span className="line-item-info">{ecPoNum || invoice.ecConsignmentCode}</span>
            </Col>
          )}
          <Col span={12}>
            <span
              className="line-item-label"
              title={intl.get(`mallf.common.model.srmPoNum`).d('SRM订单号')}
            >
              {intl.get(`mallf.common.model.srmPoNum`).d('SRM订单号')}:
            </span>
            <span className="line-item-info">{srmPoNum || invoice.srmOrderCode}</span>
          </Col>
          <Col span={12}>
            <span
              className="line-item-label"
              title={intl.get('mallf.myMall.model.invoiceMethod').d('开票方式')}
            >
              {intl.get('mallf.myMall.model.invoiceMethod').d('开票方式')}:
            </span>
            <span className="line-item-info">{invoiceStateName || invoice.invoiceStateName}</span>
          </Col>
          <Col span={12}>
            <span
              className="line-item-label"
              title={intl.get('mallf.myMall.model.invoiceType').d('发票类型')}
            >
              {intl.get('mallf.myMall.model.invoiceType').d('发票类型')}:
            </span>
            <span className="line-item-info">{invoiceTypeName || invoice.invoiceTypeName}</span>
          </Col>
          <Col span={12}>
            <span
              className="line-item-label"
              title={intl.get(`mallf.common.model.common.invoiceCode`).d('发票代码')}
            >
              {intl.get(`mallf.common.model.common.invoiceCode`).d('发票代码')}:
            </span>
            <span className="line-item-info">{invoice.ivcCode || invoice.invoiceCode}</span>
          </Col>
          <Col span={12}>
            <span
              className="line-item-label"
              title={intl.get(`mallf.common.model.common.TaxinvoiceNo.`).d('税务发票号')}
            >
              {intl.get(`mallf.common.model.common.TaxinvoiceNo.`).d('税务发票号')}:
            </span>
            <span className="line-item-info">{invoice.ivcNo || invoice.invoiceBatch}</span>
          </Col>
        </Row>
        {invoiceMaterial == 2 || invoice.invoiceTypeCode === 'SPECIAL_INVOICE' ? (
          <div
            style={{ color: getPrimaryColor(), cursor: 'pointer' }}
            onClick={() => setLogisVisible(!logisVisible)}
          >
            <Icons
              size={12}
              type={logisVisible ? 'pull' : 'down'}
              style={{ position: 'relative', top: 1, marginRight: 5 }}
            />
            {logisVisible
              ? intl.get('mallf.common.packingUp.invoice.logistics').d('收起发票物流')
              : intl.get('mallf.common.develop.invoice.logistics').d('展开发票物流')}{' '}
          </div>
        ) : (
          <>
            {invoice.fileUrl && (
              <div style={{ color: getPrimaryColor() }}>
                <Icon type="find_in_page" style={{ fontSize: 12, marginRight: 5 }} />
                <Link to={invoice.fileUrl}>
                  {intl.get('mallf.common.view.check.invoince').d('查看发票')}
                </Link>
              </div>
            )}
          </>
        )}
        {logisVisible && (
          <>
            <div className="logis-table">
              <div className="logis-table-header">
                {/* <span style={{ marginRight: 40 }}>
                  {intl.get('mallf.common.view.courier.number').d('快递单号')}：
                  {trackData?.logisticsNo}
                </span>{' '} */}
                <span>
                  {intl.get(`mallf.common.view.common.shipmentNum`).d('物流单号')}：
                  {trackData?.logisticsNo}
                </span>
              </div>
              <div className="logis-table-content">
                <Timeline>
                  {trackData?.invoiceTrack?.map((item, index) => {
                    return (
                      <div className="time-line">
                        <span className="logistics-time">
                          {data[index]?.operateTime?.split(' ')[0] !==
                            data[index - 1]?.operateTime?.split(' ')[0] && (
                            <span>{item.operateTime?.split(' ')[0]}</span>
                          )}
                          <span style={{ marginLeft: 8 }}>{item.operateTime?.split(' ')[1]}</span>
                        </span>
                        <Timeline.Item
                          className={classNames({
                            'logistics-desc': true,
                            'c7n-timeline-item-last': index + 1 === data.length,
                          })}
                        >
                          {item.content}
                        </Timeline.Item>
                      </div>
                    );
                  })}
                </Timeline>
              </div>
            </div>
          </>
        )}
      </Sidebar>
    </>
  );
}
