/**
 * lov - 商城lov重构
 * @date: 2019-08-29
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Input, Icon, Modal, Select } from 'hzero-ui';
import { Input as C7nInput, Icon as C7nIcon, Button } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import request from 'utils/request';
import intl from 'utils/intl';
import { filterNullValueObject, generateUrlWithGetParam, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';

import LinkLov from './LinkLov';
import ReactTable from './ReactTable';
import Pagination from '../Pagination';
import NewTable from './newTable';
import styles from './index.less';
import { getPrimaryColor } from '@/utils/utils';

export default function Lov(props) {
  const {
    textValue,
    newTable,
    placeholder,
    lovCode,
    queryParams = {},
    notAllowClear,
    c7n,
    label = '',
    setDefaultValue = false,
    isBtn,
    btnLabel,
  } = props;
  const { tenantId } = getUserConfigInfo();
  const [viewInfo, setViewInfo] = useState(props?.viewInfo || {});
  const { columns = [] } = viewInfo;
  const [queryUrl, setQueryUrl] = useState(viewInfo?.queryUrl);
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
  }, [columns]);

  const [visible, setVisible] = useState(false); // 表格开关
  const [dataSource, setDataSource] = useState([]); // 查询到的Lov数据
  const [pagination, setPagination] = useState({}); // 分页
  const [selectedRow, setSelectedRow] = useState({}); // 选中的行
  const [displayValue, setDisplayValue] = useState(textValue || ''); // 展示值
  const [queryData, setQueryData] = useState(paramsData); // 查询参数
  const [loading, setLoading] = useState(false); // 查询loading

  // 查询值集视图配置
  useEffect(() => {
    if (lovCode) {
      const url = `${HmallConfig.apiGateway}/hpfm/v1/${tenantId}/lov-view/info?viewCode=${lovCode}`;
      request(url).then((res) => {
        if (res) {
          const { tableFields, queryFields, valueField } = res;
          const newvViewInfo = {
            ...res,
            lovRowKey: valueField,
            columns: tableFields.map((n) => ({
              ...n,
              isQuery: queryFields.map((query) => query.field).includes(n.dataIndex),
            })),
          };
          // viewInfo可覆盖的默认的值集视图配置
          setViewInfo({ ...newvViewInfo, ...props?.viewInfo });
        }
      });
    }
  }, [lovCode]);

  useEffect(() => {
    setDisplayValue(textValue);
  }, [textValue]);

  useEffect(() => {
    if (setDefaultValue && !textValue && !isEmpty(viewInfo) && queryUrl) {
      request(queryUrl).then((res) => {
        if (res) {
          // 设置默认值为第一行数据
          const { displayField, valueField } = viewInfo;
          const { onOkCallback = (e) => e } = props;
          const data = res?.content[0] || {};
          setDisplayValue(data[displayField]);
          onOkCallback({
            [displayField]: data[displayField],
            [valueField]: data[valueField],
            data,
          });
        }
      });
    }
  }, [viewInfo, queryUrl]);

  useEffect(() => {
    if (lovCode && !isEmpty(viewInfo)) {
      const newQueryUrl = handleUrl(viewInfo);
      setQueryUrl(newQueryUrl);
    }
  }, [viewInfo, queryParams]);

  /**
   * lov数据请求url
   * @param {*} lovViewConfig - lov视图配置参数
   */
  function handleUrl(lovViewConfig = {}) {
    const { lovTypeCode = 'URL', queryUrl: lovQueryUrl, lovCode: code } = lovViewConfig;
    const newQueryUrl =
      lovTypeCode === 'URL'
        ? generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`, queryParams)
        : generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`, {
            ...queryParams,
            lovCode: code || lovCode,
          });
    return newQueryUrl.indexOf('{organizationId}')
      ? newQueryUrl.replace('{organizationId}', tenantId)
      : newQueryUrl;
  }

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
        } else if (res) {
          setDataSource(res || []);
        }
      })
      .finally(() => setLoading(false));
  }

  /**
   * 切换模态框
   */
  const toggleModal = useCallback(() => {
    document.querySelector('body').style.overflowY = visible ? 'auto' : 'hidden';
    if (document.querySelector('#footer')) {
      document.querySelector('#footer').style.display = visible ? 'block' : 'none';
    }
    setVisible(!visible);
    if (!visible) {
      fetchLovData();
    } else {
      setDataSource([]);
      setQueryData(paramsData);
    }
  }, [visible, paramsData, queryUrl]);

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
      if (document.querySelector('body')) {
        document.querySelector('body').style.overflowY = 'auto';
      }
      const { onOkCallback = (e) => e } = props;
      const { displayField, valueField } = viewInfo;
      if (Object.keys(selectedRow).length === 0) {
        Modal.warning({
          title: intl.get(`mallf.common.model.selectOneMsg`).d('请至少选择一条数据'),
          okText: intl.get(`mallf.common.model.know`).d('知道了'),
          zIndex: 10000,
        });
      } else {
        setDisplayValue(data[displayField]);
        setVisible(false);
        setDataSource([]);
        setQueryData(paramsData);
        setSelectedRow({});
        onOkCallback({
          [displayField]: data[displayField],
          [valueField]: data[valueField],
          data,
        });
      }
    },
    [selectedRow, paramsData]
  );

  /**
   * 清除lov数据
   */
  function onClear() {
    const { onOkCallback = (e) => e } = props;
    const { displayField, valueField } = viewInfo;
    setDisplayValue('');
    setDataSource([]);
    setSelectedRow({});
    onOkCallback({
      [displayField]: '',
      [valueField]: undefined,
    });
  }

  /**
   * 设置查询参数
   * @param {string} dataIndex
   * @param {object} e
   */
  function setQuery(dataIndex, e) {
    setQueryData({
      ...queryData,
      // [dataIndex]: e.target.value,
      [dataIndex]: e.target ? e.target.value : e,
    });
  }

  /**
   * 初始化lov表格
   */
  function initContent() {
    const { width = '750px', lovRowKey, title } = viewInfo;
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
          <div className="lov-query-form" style={{ margin: '10px 0' }}>
            {columns.map((column) => {
              return (
                column.isQuery && (
                  <div
                    key={column.dataIndex}
                    className="lov-query-input"
                    style={{ lineHeight: '0' }}
                  >
                    <span>{column.title}: </span>
                    {/* <input
                      value={queryData[column.dataIndex]}
                      onChange={(e) => setQuery(column.dataIndex, e)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          fetchLovData();
                        }
                      }}
                    /> */}
                    {column.isSelect ? (
                      <Select
                        className="lov-query-select"
                        onChange={(e) => setQuery(column.queryDataIndex, e)}
                        value={queryData[column.queryDataIndex]}
                      >
                        {column.queryData?.map((n) => (
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
              <div className="lov-query-btn" style={{ lineHeight: '0' }}>
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
            {newTable ? (
              <NewTable
                loading={loading}
                selected
                onRowClick={onRowClick}
                onRowDoubleClick={onOk}
                rowKey={lovRowKey}
                columns={columns}
                maxHeight="260px"
                dataSource={dataSource}
              />
            ) : (
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
            )}
            <Pagination
              zeroStart
              // showQuickJumper
              {...pagination}
              onForward={fetchLovData}
              // allPages='true'
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
          </div>
        </div>
      </div>
    );
  }

  const {
    disabled,
    linkStyle,
    width = '120px',
    height = 'auto',
    require = false,
    addAdress = false,
    style = {},
  } = props;
  const suffix = (
    <div
      className="lov-icon-group"
      style={{
        position: 'relative',
        top: '1px',
      }}
    >
      <Icon
        key="clear"
        className={`lov-clear ${displayValue ? 'lov-clear-hover' : ''}`}
        type="close-circle"
        onClick={onClear}
      />
      <Icon
        key="search"
        type="search"
        style={{
          fontSize: 16,
          cursor: 'pointer',
          color: '#bfbfbf',
        }}
        onClick={() => {
          if (!disabled) {
            toggleModal();
          }
        }}
      />
    </div>
  );

  const c7nSuffix = (
    <div
      style={{
        position: 'relative',
        width: 46,
      }}
    >
      {!notAllowClear && !disabled && (
        <Icon
          key="clear"
          className={`lov-clear ${displayValue ? 'lov-clear-hover' : ''}`}
          type="close-circle"
          onClick={onClear}
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
        />
      )}
      <C7nIcon
        key="search"
        type="search"
        style={{
          fontSize: 16,
          cursor: 'pointer',
          color: '#bfbfbf',
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClick={() => {
          if (!disabled) {
            toggleModal();
          }
        }}
      />
    </div>
  );
  return (
    <>
      {isBtn ? (
        <>
          <Button
            disabled={disabled}
            style={{ color: getPrimaryColor() }}
            onClick={() => {
              if (!disabled) {
                toggleModal();
              }
            }}
          >
            {btnLabel}
          </Button>
          {visible && initContent()}
        </>
      ) : c7n ? (
        <>
          <C7nInput
            className={styles['c7n-lov-input']}
            disabled={disabled}
            value={displayValue}
            readOnly
            style={{
              width,
              height,
              cursor: disabled ? 'not-allowed' : 'text',
              color: '#999',
              verticalAlign: 'top',
              position: 'relative',
            }}
            label={label}
            placeholder={placeholder}
            onFocus={() => {
              if (!disabled) {
                toggleModal();
              }
            }}
            suffix={c7nSuffix}
          />
          {visible && initContent()}
        </>
      ) : (
        <div
          className={styles['h-lov']}
          style={{
            ...style,
            height,
          }}
        >
          {linkStyle ? (
            <LinkLov
              require={require}
              displayValue={textValue}
              disabled={disabled}
              toggleModal={toggleModal}
              addAdress={addAdress}
            />
          ) : (
            <div className="h-lov-inputBox" style={{ height }}>
              <Input
                readOnly
                disabled={disabled}
                value={displayValue}
                placeholder={placeholder}
                style={{
                  width,
                  height,
                  cursor: disabled ? 'not-allowed' : 'text',
                  paddingRight: 35,
                  color: '#999',
                  verticalAlign: 'top',
                  position: 'relative',
                }}
                suffix={notAllowClear ? '' : suffix}
                onFocus={() => {
                  if (!disabled) {
                    toggleModal();
                  }
                }}
              />
            </div>
          )}
          {visible && initContent()}
        </div>
      )}
    </>
  );
}
