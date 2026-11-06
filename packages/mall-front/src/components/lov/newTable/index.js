import React, { useState } from 'react';
import { Table } from 'hzero-ui';
import Loading from 'components/loading';
import style from './index.less';

const NewTable = function NewTable(props) {
  const [selectedRowKey, setSelectedRowKey] = useState([props.selectedRowKey]);
  const {
    columns = [],
    dataSource = [],
    loading = false,
    maxHeight = 300,
    onRowClick = e => e,
    onRowDoubleClick = e => e,
  } = props;

  const rowClick = data => {
    setSelectedRowKey([data.categoryCode]);
    if (onRowClick) {
      onRowClick(data);
    }
  };

  const rowDoubleClick = data => {
    setSelectedRowKey([data.categoryCode]);
    if (onRowDoubleClick) {
      onRowDoubleClick(data);
    }
  };

  const selectOnChange = selectedRowKeys => {
    setSelectedRowKey(selectedRowKeys);
  };

  return (
    <div className={style['react-table-wrapper']}>
      <div className="h-react-table-content">
        <div className="table-loading" style={{ display: `${loading ? ' flex' : 'none'}` }}>
          <Loading />
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="categoryCode"
          bordered
          pagination={false}
          rowSelection={{
            type: 'radio',
            onChange: (selectedRowKeys, selectedRows) => {
              selectOnChange(selectedRowKeys, selectedRows);
            },
            selectedRowKeys: selectedRowKey,
          }}
          onRow={record => {
            return {
              onDoubleClick: () => {
                rowDoubleClick(record);
              },
              onClick: () => {
                rowClick(record);
              },
            };
          }}
          scroll={{ y: maxHeight }}
        />
      </div>
    </div>
  );
};

export default NewTable;
