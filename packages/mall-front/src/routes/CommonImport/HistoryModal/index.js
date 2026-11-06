import React, { useEffect, useRef } from 'react';
import { Modal, Table } from 'hzero-ui';

import intl from 'utils/intl';
import useState from '@/hooks/useState';
import Pagination from 'components/Pagination';
import { queryImportHistory, deleteImportHistory } from 'services/commonImportService';

import Form from './Form';
import Tag from '../Tag';
import './index.less';

export default function (props) {
  const {
    visible,
    onCancel = (e) => e,
    templateCode,
    prefixPatch,
    tenantId,
    onRecordRestore = (e) => e,
    dataImportStatus = [],
  } = props;

  const form = useRef({});

  const [state, setState] = useState({
    loading: false,
    dataSource: [],
    pagination: {},
  });

  const { loading, dataSource, pagination } = state;

  const fetchList = (page = { page: 0, size: 10 }) => {
    const { getFieldsValue } = form.current;
    let params = { ...page };
    if (getFieldsValue) {
      const { creationDateFrom, creationDateTo } = getFieldsValue();
      params = {
        ...page,
        creationDateFrom: creationDateFrom && creationDateFrom.format('YYYY-MM-DD hh:mm:ss'),
        creationDateTo: creationDateTo && creationDateTo.format('YYYY-MM-DD hh:mm:ss'),
      };
    }
    setState({ loading: true });
    queryImportHistory({ templateCode, prefixPatch, tenantId }, params)
      .then((res) => {
        if (res) {
          const { content, ...paginationData } = res;
          setState({
            dataSource: content || [],
            pagination: paginationData || {},
          });
        }
      })
      .finally(() => {
        setState({ loading: false });
      });
  };

  const handleDelete = (record) => {
    deleteImportHistory({ prefixPatch, tenantId }, [record]).then(() => {
      fetchList();
    });
  };

  const handleBindRef = (refForm) => {
    form.current = refForm || {};
  };

  const columns = [
    {
      title: intl.get('mallf.commonImport.model.batch').d('批次号'),
      dataIndex: 'batch',
    },
    {
      title: intl.get('mallf.commonImport.model.dataCount').d('数据数量'),
      dataIndex: 'dataCount',
      width: 100,
    },
    {
      title: intl.get('mallf.commonImport.view.status').d('状态'),
      dataIndex: 'status',
      width: 130,
      render: (val) => {
        const statusList = [
          { status: 'UPLOADING', color: '#7bbd53' /* , text: 'Excel导入' */ },
          { status: 'UPLOADED', color: '#c88f08' /* , text: '验证成功' */ },
          { status: 'CHECKING', color: '#7bbd53' /* , text: '验证失败' */ },
          { status: 'CHECKED', color: '#c88f08' /* , text: '导入成功' */ },
          { status: 'IMPORTING', color: '#7bbd53' /* , text: '导入失败' */ },
          { status: 'CHECK_FAILED', color: '#d05211' /* , text: '导入失败' */ },
          { status: 'IMPORT_FAILED', color: '#d05211' /* , text: '导入失败' */ },
          { status: 'IMPORTED', color: '#c88f08' /* , text: '数据异常' */ },
        ];
        const tagProps = dataImportStatus
          .map((item) => ({
            color: statusList.find((f) => f.status === item.value)?.color,
            text: item.meaning,
            status: item.value,
          }))
          .find((f) => f.status === val);
        return tagProps && <Tag {...tagProps} style={{ width: 90 }} />;
      },
    },
    {
      title: intl.get('mallf.commonImport.model.creationDate').d('创建日期'),
      dataIndex: 'creationDate',
      width: 160,
    },
    {
      title: intl.get('mallf.commonImport.view.operation').d('操作'),
      key: 'operator',
      width: 110,
      render: (_, record) => {
        // TODO: 操作逻辑
        const actions = [
          {
            key: 'restore',
            action: intl.get('mallf.commonImport.model.restore').d('恢复'),
            event: onRecordRestore,
          },
        ];
        if (['IMPORTED', 'CHECKED', 'UPLOADED'].includes(record.status)) {
          actions.push({
            key: 'delete',
            action: intl.get('mallf.commonImport.button.delete').d('删除'),
            event: handleDelete,
          });
        }
        return (
          <React.Fragment>
            {actions.map((item) => (
              <a key={item.key} style={{ marginRight: 8 }} onClick={() => item.event(record)}>
                {item.action}
              </a>
            ))}
          </React.Fragment>
        );
      },
    },
  ];

  useEffect(() => {
    fetchList();
  }, []);

  const scrollX =
    columns
      .filter((c) => c.width)
      .map((m) => m.width)
      .reduce((prev, next) => prev + next) + 200;

  return (
    <Modal
      destroyOnClose
      wrapClassName="hmall-content-Modal import-history-modal"
      width={990}
      title={intl.get('mallf.commonImport.model.history.record').d('历史记录')}
      visible={visible}
      footer={null}
      onCancel={onCancel}
    >
      <div className="form-search">
        <Form onRef={handleBindRef} onSearch={fetchList} />
      </div>
      <Table
        bordered
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: scrollX }}
      />
      <div style={{ marginTop: 16 }}>
        <Pagination
          zeroStart
          // showQuickJumper
          {...pagination}
          onForward={fetchList}
          allPages
        />
      </div>
    </Modal>
  );
}
