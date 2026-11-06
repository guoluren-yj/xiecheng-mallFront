import React, { useMemo } from 'react';
import { Modal, Button, Table, DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';

export default function OtherInfo(props) {
  const { data } = props;
  const expandData = useMemo(() => {
    let result = [];
    try {
      result = JSON.parse(data.priceInfoExpand?.attributeLongtext1 || '[]');
    } catch {
      notification.warning({
        message: '付款阶段解析异常，请联系管理员',
      });
    }
    return result;
  }, [data]);
  const handleOpenModal = () => {
    const ds = new DataSet({
      autoQuery: false,
      paging: false,
      selection: false,
      data: expandData,
      fields: [
        {
          label: '阶段编码',
          name: 'stageNum',
        },
        {
          label: '阶段比例',
          name: 'ratio',
        },
      ],
    });
    const columns = [
      {
        name: 'stageNum',
      },
      {
        name: 'ratio',
        renderer: ({ text }) => (text ? `${+text * 100}%` : '-'),
      },
    ];
    Modal.open({
      title: '查看合同付款阶段',
      destroyOnClose: true,
      mask: true,
      drawer: true,
      closable: true,
      style: { width: 380 },
      okText: '关闭',
      cancelButton: false,
      children: (
        <Table
          dataSet={ds}
          customizedCode="CHECK_DOC"
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      ),
    });
  };
  return (
    <div style={{ margin: '-6px 20px', display: 'flex', alignItems: 'center' }}>
      <span style={{ color: '#666' }}>合同付款阶段：</span>
      {expandData.length > 0 ? (
        <Button
          funcType="link"
          color="primary"
          style={{ height: 18, lineHeight: '18px', padding: 0 }}
          onClick={() => handleOpenModal()}
        >
          查看
        </Button>
      ) : (
        '-'
      )}
    </div>
  );
}
