import React, { useEffect, useState } from 'react';
import { Modal, Button, Table } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { fetchProductAcceptRecord } from 'services/productAcceptService';
import style from './index.less';

const { Sidebar } = Modal;
function AcceptRecord(props) {
  const { visible, toggleModal, product } = props;
  const { productName, asnLineId } = product;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData(params = {}) {
    // const { asnLineIdList = [] } = state;
    // const asnLineIdList = [6543216426, 6543216381];
    // const queryParam = { ...params, size: params.size || 10, asnLineIdList, ...formData };
    const queryParam = { ...params, asnLineIdList: [asnLineId] };
    setLoading(true);
    fetchProductAcceptRecord(queryParam)
      .then((res) => {
        const { content = [], ...pagination } = res;
        setList(content);
        setPage(pagination);
      })
      .finally(() => setLoading(false));
  }

  const columns = [
    {
      title: intl.get(`mallf.orderDetail.model.displayTrxNum`).d('接收编号'),
      dataIndex: 'displayTrxNum',
    },
    {
      title: intl.get(`mallf.orderDetail.model.trxDate`).d('接收日期'),
      dataIndex: 'trxDate',
    },
    {
      title: intl.get(`mallf.orderDetail.model.rcvTrxTypeName`).d('接收类型'),
      dataIndex: 'rcvTrxTypeName',
    },
    {
      title: intl.get(`mallf.orderDetail.model.accept.quantity`).d('接收数量'),
      dataIndex: 'quantity',
    },
    {
      title: intl.get(`mallf.orderDetail.model.receiptPerson`).d('接收人'),
      dataIndex: 'receivedBy',
    },
    {
      title: intl.get(`mallf.orderDetail.model.asnNum`).d('送货单号'),
      dataIndex: 'asnNum',
    },
    {
      title: intl.get(`mallf.orderDetail.model.remark`).d('备注'),
      dataIndex: 'remark',
    },
    {
      title: intl.get(`mallf.orderDetail.view.common.annex`).d('附件'),
      dataIndex: 'sinvLineAttachmentUuid',
      width: 160,
      render: (val) => (
        <Attachment
          readOnly
          showHistory
          viewMode="popup"
          funcType="link"
          labelLayout="float"
          value={val}
          bucketName="private-bucket"
          bucketDirectory="mall-front"
        />
      ),
    },
  ];

  return (
    <>
      <Sidebar
        title={intl.get('mallf.orderDetail.view.catalog.acceptRecord').d('接收记录')}
        className={style.content}
        visible={visible}
        width={1090}
        onCancel={toggleModal}
        footer={[
          <Button
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={toggleModal}
          >
            {intl.get('mallf.orderDetail.button.close').d('关闭')}
          </Button>,
        ]}
        //   confirmLoading={spinning}
        closable
      >
        <p className="content-title">{productName}</p>
        <Table
          filterBar={false}
          dataSource={list}
          loading={loading}
          columns={columns}
          pagination={page}
          onChange={fetchData}
        />
      </Sidebar>
    </>
  );
}

export default formatterCollections({ code: ['mallf.orderDetail'] })(AcceptRecord);
