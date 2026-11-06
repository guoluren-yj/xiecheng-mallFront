import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { PreviewList } from 'components/CommonUpload';
import { fetchomsProductAcceptRecord } from 'services/productAcceptService';
import style from './index.less';

const { Sidebar } = Modal;
export default function AcceptRecord(props) {
  const { visible, toggleModal, product } = props;
  const { consignmentCode, orderEntryId, skuName, consignmentLineNum } = product;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData(params = {}) {
    const queryParam = { ...params, consignmentCode, orderEntryId, consignmentLineNum };
    setLoading(true);
    fetchomsProductAcceptRecord(queryParam)
      .then((res) => {
        setList(res);
      })
      .finally(() => setLoading(false));
  }

  const columns = [
    {
      title: intl.get(`mallf.common.model.displayTrxNum`).d('接收编号'),
      dataIndex: 'receiptCode',
    },
    {
      title: intl.get(`mallf.common.model.trxDate`).d('接收日期'),
      dataIndex: 'receiptedTime',
    },
    {
      title: intl.get(`mallf.common.model.rcvTrxTypeName`).d('接收类型'),
      dataIndex: 'receiptTypeDesc',
    },
    {
      title: intl.get(`mallf.common.model.accept.quantity`).d('接收数量'),
      dataIndex: 'quantityMeaning',
      render: (v, record) => {
        return (
          <>
            <p>{v}</p>
            {record.customQuantity && record.customQuantity !== 1 && (
              <p style={{ marginTop: 6 }}>
                {record.packageQuantityMeaning}
                {intl.get(`mallf.cart.model.cart.pieces`).d('件')}
              </p>
            )}
          </>
        );
      },
    },
    {
      title: intl.get(`mallf.common.model.receiptPerson`).d('接收人'),
      dataIndex: 'realName',
    },
    {
      title: intl.get(`mallf.common.model.asnNum`).d('送货单号'),
      dataIndex: 'srmConsignmentCode',
    },
    {
      title: '成本中心',
      dataIndex: 'attributeVarchar1',
    },
    {
      title: '领用类型',
      dataIndex: 'attributeVarchar2',
    },
    {
      title: intl.get(`mallf.common.model.remark`).d('备注'),
      width: 100,
      dataIndex: 'remark',
      render: (val) => (
        <Popover content={val}>
          <div className="accept-remark">{val}</div>
        </Popover>
      ),
    },
    {
      title: intl.get(`mallf.common.view.common.annex`).d('附件'),
      dataIndex: 'attachmentUuid',
      width: 160,
      render: (val) => <PreviewList attachmentUuid={val} bucketName="private-bucket" />,
    },
  ];

  return (
    <>
      <Sidebar
        title={intl.get('mallf.myMall.view.catalog.acceptRecord').d('接收记录')}
        className={style.content}
        visible={visible}
        width={1190}
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
        <p className="content-title">{skuName}</p>
        <Table
          filterBar={false}
          dataSource={list}
          loading={loading}
          columns={columns}
          pagination={false}
          onChange={fetchData}
        />
      </Sidebar>
    </>
  );
}
