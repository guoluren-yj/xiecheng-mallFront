import React, { useState, memo } from 'react';
import { Radio } from 'hzero-ui';
import Loading from 'components/loading';
import intl from 'utils/intl';
import style from './index.less';

const ReactTable = memo(function ReactTable(props) {
  const [selectedRowKey, setSelectedRowKey] = useState('');
  const {
    columns = [],
    dataSource = {},
    rowKey = '',
    selected = false,
    loading = false,
    maxHeight = undefined,
    onRowClick = (e) => e,
    onRowDoubleClick = (e) => e,
  } = props;

  const rowClick = (data) => {
    setSelectedRowKey(data[rowKey]);
    if (onRowClick) {
      onRowClick(data);
    }
  };

  const rowDoubleClick = (data) => {
    setSelectedRowKey(data[rowKey]);
    if (onRowDoubleClick) {
      onRowDoubleClick(data);
    }
  };

  const renderTd = (datas) => {
    return columns.map((column) => {
      return (
        <td
          style={{
            maxWidth: column.width || 'auto',
            textAlign: column.align || 'left',
            display: `${column.isShow === false ? 'none' : ''}`,
          }}
          key={datas[column.dataIndex]}
          title={datas[column.dataIndex]}
        >
          {column.render ? column.render(datas[column.dataIndex], datas) : datas[column.dataIndex]}
        </td>
      );
    });
  };

  return (
    <div className={style['react-table-wrapper']}>
      <div className="h-react-table-content">
        <div className="table-loading" style={{ display: `${loading ? ' flex' : 'none'}` }}>
          <Loading />
        </div>
        <div className="h-react-table-header">
          <table style={{ border: 'none' }} className="h-react-table">
            <col style={{ width: '30px' }} />
            {columns.map((column) => {
              return (
                <col
                  style={{
                    width: column.width || 'auto',
                    display: `${column.isShow === false ? 'none' : ''}`,
                  }}
                />
              );
            })}
            <thead className="h-table-thead">
              <tr>
                <td />
                {columns.map((column) => {
                  return (
                    <td
                      style={{
                        textAlign: column.align || 'left',
                        display: `${column.isShow === false ? 'none' : ''}`,
                      }}
                      key={column.dataIndex}
                    >
                      {column.title}
                    </td>
                  );
                })}
              </tr>
            </thead>
          </table>
        </div>
        <div
          style={{
            maxHeight,
            overflowY: `${loading ? 'hidden' : 'auto'}`,
            overflow: 'hidden',
          }}
        >
          <table className="h-react-table">
            <col style={{ width: '30px' }} />
            {columns.map((column) => {
              return (
                <col
                  style={{
                    width: column.width || 'auto',
                    display: `${column.isShow === false ? 'none' : ''}`,
                  }}
                />
              );
            })}
            <tbody className="h-table-tbody">
              {dataSource.length > 0 ? (
                dataSource.map((data) => {
                  return (
                    <tr
                      key={data[rowKey]}
                      onClick={() => rowClick(data)}
                      onDoubleClick={() => rowDoubleClick(data)}
                    >
                      {selected && (
                        <td style={{ maxWidth: '30px' }}>
                          <Radio value={data[rowKey]} checked={selectedRowKey === data[rowKey]} />
                        </td>
                      )}
                      {renderTd(data)}
                    </tr>
                  );
                })
              ) : (
                <tr className="h-table-no-data">
                  {intl.get(`mallf.common.view.noData`).d('暂无数据')}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default ReactTable;
