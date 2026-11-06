import React, { useState, useEffect } from 'react';
import { Spin, Table, Modal } from 'hzero-ui';

import Link from 'components/Link';
import intl from 'utils/intl';
import { fetchInvoiceService } from 'services/invoiceMadalService';

import style from './index.less';

function InvoiceMadal(props) {
  const [ecEcinvoiceAclines, setEcEcinvoiceAclines] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    visible,
    onClose = (e) => e,
    srmPoNum,
    invoiceTypeName,
    invoiceTypeCode,
    ecPoSubNum,
    ecPlatformCode,
    invoiceMethodCode,
  } = props;
  const columns = [
    {
      title: intl.get(`mallf.common.model.common.invoiceCode`).d('发票代码'),
      dataIndex: 'ivcCode',
      width: '33.33%',
    },
    {
      title: intl.get(`mallf.common.model.common.invoiceNum`).d('发票号码'),
      dataIndex: 'ivcNo',
      width: '33.33%',
    },
    {
      title:
        invoiceTypeCode === '2'
          ? intl.get(`mallf.common.model.common.invoiceTrack`).d('发票物流')
          : intl.get(`mallf.common.model.common.downInvoice`).d('下载电子普通发票'),
      dataIndex: 'fileUrl',
      width: '33.33%',
      render: (_, record) =>
        invoiceTypeCode === '2' ? (
          <Link to={`/invoice-detail?ecPlatform=${ecPlatformCode}&ecPoSubNum=${ecPoSubNum}`}>
            {intl.get(`mallf.common.model.common.viewTrackDetail`).d('查看物流详情')}
          </Link>
        ) : record.fileUrl ? (
          <Link to={record.fileUrl}>
            {intl.get(`mallf.common.model.common.viewEcInvoice`).d('查看电子发票')}
          </Link>
        ) : (
          '-'
        ),
    },
  ];

  function fetchInvoice(platFormCode = 'JD', id, invCode) {
    setLoading(true);
    fetchInvoiceService(platFormCode, id, invCode)
      .then((res) => {
        setEcEcinvoiceAclines(res.ecEcinvoiceAclines || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (ecPoSubNum) {
      fetchInvoice(ecPlatformCode, ecPoSubNum, invoiceMethodCode);
    }
  }, []);

  return (
    <Modal
      title={intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
      onCancel={onClose}
      footer={null}
      visible={visible}
      destroyOnClose
      width={818}
      wrapClassName={`hmall-content-Modal ${style['invoice-modal']}`}
    >
      <Spin spinning={loading}>
        <div className="invoice-content">
          <ul>
            {srmPoNum && (
              <li>
                {intl.get(`mallf.common.model.srmPoNum`).d('SRM订单号')}：<span>{srmPoNum}</span>
              </li>
            )}
            <li>
              {intl.get(`mallf.common.model.common.subPoNum`).d('子订单号')}：
              <span>{ecPoSubNum}</span>
            </li>
            <li title={invoiceTypeName}>
              {intl.get(`mallf.common.model.common.invoiceType`).d('发票类型')}：
              {invoiceTypeName || '-'}
            </li>
          </ul>
          <div className="invoice-list">
            <Table columns={columns} dataSource={ecEcinvoiceAclines} pagination={false} bordered />
          </div>
        </div>
      </Spin>
    </Modal>
  );
}

export default InvoiceMadal;
