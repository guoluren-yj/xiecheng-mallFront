/**
 * lov - 商城lov重构
 * @date: 2019-08-29
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Select } from 'hzero-ui';

import AddressModal from 'routes/MyMall/AddressList/AddressModal';
import request from 'utils/request';
import intl from 'utils/intl';
import { filterNullValueObject, generateUrlWithGetParam } from 'utils/utils';

import ReactTable from './ReactTable';
import Pagination from '../Pagination';
import styles from './index.less';

export default function InitContent(props) {
  const { viewInfo = {}, item, toggle, visible } = props;
  const { queryUrl, columns = [] } = viewInfo;
  const paramsData = useMemo(() => {
    // 定义查询参数
    const data = {
      page: 0,
      size: 10,
    };
    columns.forEach((column) => {
      if (column.isQuery) {
        data[column.dataIndex] = '';
      }
    });
    return data;
  }, []);
  // const [visible, setVisible] = useState(false); // 表格开关
  const [dataSource, setDataSource] = useState([]); // 查询到的Lov数据
  const [pagination, setPagination] = useState({}); // 分页
  const [selectedRow, setSelectedRow] = useState({}); // 选中的行
  // const [displayValue, setDisplayValue] = useState(textValue || ''); // 展示值
  const [queryData, setQueryData] = useState(paramsData); // 查询参数
  const [loading, setLoading] = useState(false); // 查询loading
  const [addVisible, setAddVisible] = useState(false); // 新建地址开关

  useEffect(() => {
    if (visible) {
      fetchLovData();
    }
  }, [visible]);

  /**
   * 请求Lov数据
   * @param {string} page 分页
   */
  function fetchLovData(page = {}) {
    const filterNullQuery = filterNullValueObject({
      ...queryData,
      ...page,
    });
    const newUrl = generateUrlWithGetParam(queryUrl, filterNullQuery);
    setLoading(true);
    request(newUrl)
      .then((res) => {
        if (res.content) {
          const { content, ...paginationData } = res;
          setDataSource(content || []);
          setPagination(paginationData);
        }
      })
      .finally(() => setLoading(false));
  }

  /**
   * 切换模态框
   */
  const toggleModal = useCallback(() => {
    // document.querySelector('body').style.overflowY = visible ? 'auto' : 'hidden';
    document.querySelector('#footer').style.display = visible ? 'block' : 'none';
    // setVisible(!visible);
    toggle();
    // if (!visible) {
    //   fetchLovData();
    // } else {
    //   setDataSource([]);
    //   setQueryData(paramsData);
    // }
  }, [visible, paramsData]);

  /**
   * 点击行
   */
  const onRowClick = useCallback((data) => {
    setSelectedRow(data);
  }, []);

  /**
   * 选择数据确认
   * @param {object} data
   */
  const onOk = useCallback(
    (data) => {
      const { onOkCallback = (e) => e } = props;
      const { displayField, valueField } = viewInfo;
      if (Object.keys(selectedRow).length === 0) {
        Modal.warning({
          title: intl.get(`mallf.common.model.selectOneMsg`).d('请至少选择一条数据'),
          okText: intl.get(`mallf.common.model.know`).d('知道了'),
          zIndex: 10000,
        });
      } else {
        // setDisplayValue(data[displayField]);
        // setVisible(false);
        toggle();
        setDataSource([]);
        setQueryData(paramsData);
        setSelectedRow({});
        onOkCallback(
          {
            [displayField]: data[displayField],
            [valueField]: data[valueField],
            item,
          },
          data
        );
      }
    },
    [selectedRow, paramsData]
  );

  /**
   * 设置查询参数
   * @param {string} dataIndex
   * @param {object} e
   */
  function setQuery(dataIndex, e) {
    setQueryData({
      ...queryData,
      [dataIndex]: e.target ? e.target.value : e,
    });
  }

  function handleCancel() {
    setAddVisible(false);
  }

  function openModal() {
    toggleModal();
    setAddVisible(true);
  }

  /**
   * 初始化lov表格
   */
  function initContent() {
    const { width, lovRowKey, title } = viewInfo;
    return (
      <div className={styles['lov-content-wrapper']}>
        <div
          className="lov-content"
          style={{
            width,
          }}
        >
          <div className="lov-title">
            <span>{title}</span>
            <div className="close-button" onClick={toggleModal} />
          </div>
          <div className="lov-query-form">
            {columns &&
              columns.length > 0 &&
              columns.map((column) => {
                return (
                  column.isQuery && (
                    <div key={column.dataIndex} className="lov-query-input">
                      <span>{column.title}: </span>
                      {column.isSelect ? (
                        <Select
                          className="lov-query-select"
                          onChange={(e) => setQuery(column.queryDataIndex, e)}
                          value={queryData[column.queryDataIndex]}
                        >
                          {column.queryData.map((n) => (
                            <Select.Option value={n.value} key={n.value}>
                              {n.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <input
                          value={queryData[column.dataIndex]}
                          onChange={(e) => setQuery(column.dataIndex, e)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              fetchLovData();
                            }
                          }}
                        />
                      )}
                    </div>
                  )
                );
              })}
            {columns.length > 0 && (
              <div className="lov-query-btn">
                <button type="button" onClick={() => setQueryData(paramsData)}>
                  {intl.get(`mallf.common.button.reset`).d('重置')}
                </button>
                <button
                  type="button"
                  className="small-button primary-button"
                  onClick={() => {
                    fetchLovData();
                  }}
                >
                  {intl.get(`mallf.common.button.query`).d('查询')}
                </button>
              </div>
            )}
          </div>
          <div className="lov-table">
            <ReactTable
              loading={loading}
              selected
              onRowClick={onRowClick}
              onRowDoubleClick={onOk}
              rowKey={lovRowKey}
              columns={columns}
              maxHeight="260px"
              dataSource={dataSource}
            />
            <Pagination
              zeroStart
              // showQuickJumper
              {...pagination}
              onForward={fetchLovData}
            />
          </div>
          <div className="lov-action">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                onOk(selectedRow);
              }}
            >
              {intl.get(`mallf.common.button.ok`).d('确定')}
            </button>
            <button type="button" onClick={toggleModal}>
              {intl.get(`mallf.common.button.cancel`).d('取消')}
            </button>
            {address ? (
              <button type="button" onClick={openModal}>
                {intl.get(`mallf.common.button.add`).d('新建')}
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    );
  }
  // const openTable = () => {
  //   toggle();
  //   fetchLovData();
  // };

  const { width = 'auto', height = 'auto', style = {}, address } = props;
  return (
    <div
      className={styles['h-lov']}
      style={{
        ...style,
        height,
        width,
      }}
    >
      {/* <LinkInit
        require={require}
        displayValue={textValue}
        disabled={disabled}
        toggleModal={toggleModal}
        addAdress={addAdress}
        initStyle={initStyle}
      /> */}
      {visible && initContent()}
      {addVisible && (
        <AddressModal
          setDefault
          initAddress={{}}
          visible={addVisible}
          onCancel={handleCancel}
          setVisible={setAddVisible}
          // onSuccess={openTable}
        />
      )}
    </div>
  );
}
