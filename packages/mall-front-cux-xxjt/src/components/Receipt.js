import React, { useMemo, useEffect } from 'react';
import { Modal, Table, DataSet, Button } from 'choerodon-ui/pro';
import request from 'utils/request';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

const fetchOrderReceiptDoc = (p) => {
  const { organizationId } = getUserConfigInfo();
  const url = `/marmot/v1/${organizationId}/marmot-api/6emYFjQhsibYhn1VAKu1vibZej3oj7pvDMZWhxa3njZrb6ya95L4oAyQicfckytayv4`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(p),
  });
};

function ReceiptDoc(props) {
  const { item } = props || {};
  const downloadDoc = async (url) => {
    window.open(url, '_blank');
  };
  const ds = useMemo(() => {
    return new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          label: '序号',
          name: 'orderSeq',
        },
        {
          label: '子订单号',
          name: 'thirdOrderId',
        },
        {
          label: '操作',
          name: 'operate',
        },
      ],
    });
  }, []);
  const columns = [
    {
      name: 'orderSeq',
      width: 45,
    },
    {
      name: 'thirdOrderId',
    },
    {
      name: 'operate',
      width: 93,
      renderer: ({ record }) => (
        <Button color="primary" funcType="link" onClick={() => downloadDoc(record.get('url'))}>
          {intl.get('mcux.common.xxjt.view.check').d('查看')}
        </Button>
      ),
    },
  ];
  useEffect(() => {
    async function fetchData() {
      const params = { dimension: 'ORDER', orderId: item.orderId };
      try {
        ds.status = 'loading';
        await fetchOrderReceiptDoc(params).then((res) => {
          if (res) {
            const { result = [] } = res || {};
            ds.loadData(result?.map((r, i) => ({ ...r, orderSeq: i + 1 })));
          }
        });
      } finally {
        ds.status = 'ready';
      }
    }
    fetchData();
  }, []);

  return (
    <Table
      dataSet={ds}
      customizedCode="DOWNLOAD_PRINT_DOC"
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    />
  );
}

export function onDownloadOrder(item) {
  Modal.open({
    title: '下载签收单',
    destroyOnClose: true,
    mask: true,
    drawer: true,
    closable: true,
    style: { width: 380 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    cancelButton: false,
    children: <ReceiptDoc item={item} />,
  });
}
