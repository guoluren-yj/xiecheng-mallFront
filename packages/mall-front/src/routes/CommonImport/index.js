import React, { useEffect } from 'react';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button, Select, Dropdown, Icon, Menu } from 'hzero-ui';

import { getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { batchGetCodes, downloadFile } from 'services/api';
import {
  loadTemplate,
  loadDataSource,
  queryStatus,
  validateData,
  importData,
  updateOne,
} from 'services/commonImportService';
import Swal from 'components/swal';
import useState from '@/hooks/useState';
import BreadCrumbs from 'components/BreadCrumbs';
import Pagination from 'components/Pagination';

import UploadExcel from './UploadExcel';
import List from './List';
import HistoryModal from './HistoryModal';
import styles from './index.less';

const SelPlus = (props) => {
  const {
    label,
    onChange = (e) => e,
    options = [],
    allowClear,
    value,
    disabled,
    style = {},
    selectStyle = {},
    valueKey = 'value',
    meaingKey = 'meaning',
  } = props;
  return (
    <div className={`select-plus ${disabled ? 'disable-select-plus' : ''}`} style={style}>
      <span title={label}>{label}</span>
      <Select
        allowClear={allowClear}
        onChange={onChange}
        value={value}
        disabled={disabled}
        style={{ width: 90, ...selectStyle }}
      >
        {options.map((item) => (
          <Select.Option key={item[valueKey]} value={item[valueKey]}>
            <span title={item[meaingKey]}>{item[meaingKey]}</span>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

const AUTO_REFRESH_DEBOUNCE = 5000;
let timer;
let newBatch;
function ImportComponent(props) {
  const {
    location: { search = '' },
    match: { params = {} },
  } = props;
  const {
    sync = false, // 是否是同步的接口
    auto = false, // 是否是 同步自动的接口
    prefixPatch: argsPatch,
    args: initArgs = 'null',
    backPath = null, // 预留面包屑上级地址
    backTitle = '', // 预留面包屑上级标题
    action = intl.get('mallf.commonImport.view.default.title').d('商城导入'),
    tenantId = getOrganizationId(),
    importType = '',
  } = qs.parse(search.substr(1));
  const typeList = importType ? importType.split(',') : ['excel', 'csv'];

  const [state, setState] = useState({
    autoRefreshInterval: AUTO_REFRESH_DEBOUNCE,
    dynamicColumns: [], // 动态列
    dataSource: [], // 数据源
    pagination: {}, // 后端分页
    status: null, // 状态
    defaultSheet: '', // 默认sheet
    templateTargetList: [], // 模板sheet数据
    prefixPatch: argsPatch, // 客户端路径前缀
    importStatus: [], // 数据导入状态
    dataImportStatus: [], // 历史记录数据导入状态
    args: JSON.parse(initArgs), // 上传文件时传递的数据
    historyVisible: false, //
    params,
    searchDataImportStatus: '',
    isAutoRefresh: false,
  });

  const {
    batch,
    defaultSheet,
    templateTargetList,
    importStatus,
    dataImportStatus,
    searchDataImportStatus,
    isAutoRefresh,
    historyVisible,
    dataSource,
    dynamicColumns,
    pagination,
    prefixPatch,
    args,
    status,
  } = state;

  // 初始获得状态值集
  const init = () => {
    batchGetCodes({
      importStatus: 'HIMP.DATA_STATUS',
      dataImportStatus: 'HIMP.IMPORT_STATUS',
    }).then((res) => {
      if (res) {
        setState({ ...state, ...res });
      }
    });
  };

  // 打开对应loading
  const handleShowLoading = (loadingKey) => {
    setState({
      [loadingKey]: true,
    });
  };

  // 关闭对应loading
  const handleCloseLoading = (loadingKey) => {
    setState({
      [loadingKey]: false,
    });
  };

  // 获取模板
  const getTemplate = () => {
    handleShowLoading('loadTemplateLoading');
    loadTemplate({ code: params.code, prefixPatch, tenantId })
      .then((res) => {
        if (res) {
          const {
            prefixPatch: newPrefixPatch = '',
            templateType,
            templateTargetList: list = [],
          } = res;
          const { templateLineList = [] } = list[0] || {};
          const sheet = list[0] && list[0].sheetIndex;
          setState({
            prefixPatch: newPrefixPatch || prefixPatch || (templateType === 'C' ? '' : '/himp'),
            templateTargetList: list,
            defaultSheet: sheet,
            dynamicColumns: templateLineList.map((n) => {
              return {
                title: n.columnName,
                dataIndex: n.columnCode,
                width: n.columnName.length * 16 + 32,
                columnType: n.columnType,
                required: n.nullableFlag === 0,
                editable: true, // 可编辑控制
              };
            }),
          });
        }
      })
      .finally(() => {
        handleCloseLoading('loadTemplateLoading');
      });
  };

  /**
   * 导入状态查询状态改变
   */
  const handleDataImportStatusChange = (value) => {
    setState({
      searchDataImportStatus: value,
    });
    getDataSource({ page: 0, size: 10 }, { status: value });
  };

  /**
   * 切换sheet页
   * @param {string} value - sheet页code
   */
  const handleChangeSheet = (value) => {
    const selectSheet =
      templateTargetList.find((item) => {
        return item.sheetIndex === value;
      }) || {};
    const { templateLineList = [] } = selectSheet;
    // 获取不同sheet页的模板列
    if (templateLineList) {
      setState({
        dynamicColumns: templateLineList.map((n, index) => {
          if (index < 2) {
            return {
              title: n.columnName,
              dataIndex: n.columnCode,
              width: n.columnName.length * 16 + 32,
              columnType: n.columnType,
              required: n.nullableFlag === 1,
              editable: true, // 可编辑控制
              fixed: 'left',
            };
          } else {
            return {
              title: n.columnName,
              dataIndex: n.columnCode,
              width: n.columnName.length * 16 + 32,
              columnType: n.columnType,
              required: n.nullableFlag === 1,
              editable: true, // 可编辑控制
            };
          }
        }),
      });
    } else {
      setState({
        dynamicColumns: [],
      });
    }
    setState({ defaultSheet: value });
    getDataSource({ page: 0, size: 10 }, { sheetIndex: value });
  };

  /**
   * 上传excel成功后设置批次号
   * 成功后自动刷新状态 和 数据
   * @param {string} batch - 批次号
   */
  const uploadSuccess = (successBatch) => {
    setState({ batch: successBatch });
    newBatch = successBatch;
    fetchStatus({ batch: successBatch });
  };

  /**
   * 获取导入的数据
   * @param {object} [page={}] 分页参数
   * @param {object} [query={}] 查询参数
   */
  const getDataSource = (page = { page: 0, size: 10 }, query = {}, fetchBatch) => {
    setState({
      loadDataSourceLoading: true,
      cachePagination: page,
    });
    loadDataSource(
      { sync, templateCode: params.code, batch: fetchBatch || batch, prefixPatch, tenantId },
      {
        sheetIndex: defaultSheet,
        status: searchDataImportStatus,
        ...page,
        ...query,
      }
    )
      .then((res) => {
        if (res) {
          const { content = [], ...other } = res;
          const formatData = content.map((item) => {
            const { _data = '{}', ...reset } = item;
            const newData = JSON.parse(_data);
            return { ...newData, ...reset };
          });
          setState({
            dataSource: formatData,
            pagination: other,
          });
        }
      })
      .finally(() => {
        handleCloseLoading('loadDataSourceLoading');
      });
  };

  /**
   * 获取当前状态
   * @param {object} params
   * @param {object} options - 配置
   * @param {boolean} [options.showMessage=true] - 是否显示信息
   */
  const fetchStatus = (query = {}, options = { showMessage: true }) => {
    queryStatus({ sync, prefixPatch, tenantId }, query)
      .then((res) => {
        handleShowLoading('queryStatusLoading');
        if (res) {
          setState({
            status: res.status,
            count: res.count,
            ready: res.ready,
          });
          if (options.showMessage) {
            const msg = `${intl
              .get('mallf.commonImport.model.refreshSuccessDataStatus')
              .d('刷新成功，当前数据状态')}：${res.statusMeaning}`;
            Swal({ msg, timer: 1000 });
          }
        }
        // 当状态是数据导入完成时，获取导入数据
        if (res.status) {
          const { cachePagination } = state;
          getDataSource(cachePagination, {}, query.batch);
        }
      })
      .finally(() => {
        handleCloseLoading('queryStatusLoading');
      });
  };

  /**
   * 模板下载 菜单点击
   */
  const handleDownloadTemplate = (e) => {
    const api = `${HmallConfig.apiGateway}${prefixPatch}/v1/${tenantId}/import/template/${params.code}/${e.key}`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'type', value: 'bpmn20' }] });
  };

  /**
   * 校验数据
   */
  const handleValidateData = () => {
    if (batch) {
      if (prefixPatch) {
        handleShowLoading('validateDataLoading');
        validateData({
          sync,
          templateCode: params.code,
          batch,
          prefixPatch,
          tenantId,
        })
          .then((res) => {
            if (res) {
              refresh();
            }
          })
          .finally(() => {
            handleCloseLoading('validateDataLoading');
          });
      } else {
        Swal(intl.get('mallf.commonImport.view.templateNotPrefix').d('模板客户端路径前缀未配置'));
      }
    } else {
      Swal(intl.get('mallf.commonImport.model.uploadImportFile').d('请上传导入文件'));
    }
  };

  /**
   * 导入数据
   */
  const handleImportData = () => {
    if (batch) {
      if (prefixPatch) {
        handleShowLoading('importDataLoading');
        importData({
          templateCode: params.code,
          sync,
          batch,
          prefixPatch,
          tenantId,
        })
          .then((res) => {
            if (res) {
              refresh();
            }
          })
          .finally(() => {
            handleCloseLoading('importDataLoading');
          });
      } else {
        Swal(intl.get('mallf.commonImport.view.templateNotPrefix').d('模板客户端路径前缀未配置'));
      }
    } else {
      Swal(intl.get('mallf.commonImport.model.uploadImportFile').d('请上传导入文件'));
    }
  };

  /**
   * 保存单条编辑数据
   * @param {number} _id - 导入数据记录的id
   * @param {Function} cb - 关闭编辑模式
   */
  const handleSave = (record, cb = (e) => e) => {
    const {
      $form: { validateFields },
    } = record;
    validateFields((error, row) => {
      if (!error) {
        handleShowLoading('updateOneLoading');
        updateOne({
          sync,
          _id: record._id,
          prefixPatch,
          data: row,
          tenantId,
        })
          .then((res) => {
            if (res) {
              cb();
              refresh();
            }
          })
          .finally(() => {
            handleCloseLoading('updateOneLoading');
          });
      }
    });
  };

  /**
   * 刷行状态和数据
   * @param {object} options - fetchStatus 的配置
   */
  const refresh = (options) => {
    if (newBatch) {
      fetchStatus({ batch: newBatch }, options);
    }
  };

  const handleRefresh = () => {
    refresh({});
  };

  /**
   * 切换 自动刷新
   */
  const handleToggleAutoRefresh = () => {
    if (!timer) {
      timer = setInterval(() => {
        refresh({ showMessage: false });
      }, state.autoRefreshInterval);
      setState({ isAutoRefresh: true });
    } else {
      clearInterval(timer);
      timer = null;
      setState({ isAutoRefresh: false });
      // 强制更新状态
    }
  };

  /**
   * 临时数据导出
   * @param e
   */
  const handleTemporaryDataExportClick = (e) => {
    if (typeList.includes(e.key)) {
      const api = `${HmallConfig.apiGateway}${prefixPatch}/v1/${tenantId}/import/manager/export/${e.key}`;
      downloadFile({
        requestUrl: api,
        queryParams: [
          { name: 'sheetIndex', value: defaultSheet },
          { name: 'batch', value: batch },
          { name: 'status', value: searchDataImportStatus },
          { name: 'templateCode', value: params.code },
        ].filter((param) => {
          return param.value !== undefined && param.value !== null;
        }),
      });
    }
  };

  // 打开历史记录
  const handleOpenHistory = () => {
    setState({
      historyVisible: true,
    });
  };

  // 关闭历史记录
  const handleCloseHistory = () => {
    // TODO: 确认
    setState({
      historyVisible: false,
    });
  };

  // 恢复批次
  const handleRestore = (record) => {
    setState({
      batch: record.batch,
      historyVisible: false,
    });
    newBatch = record.batch;
    fetchStatus({ batch: record.batch });
  };

  useEffect(() => {
    init();
    if (params.code) {
      getTemplate();
    }
  }, []);

  // 模板下载菜单
  const templateDownloadMenu = (
    <Menu onClick={handleDownloadTemplate}>
      {typeList.map((item) => {
        return (
          <Menu.Item key={item}>
            <Icon type={item} />
            {item.toUpperCase()}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  // 数据导出菜单
  const temporaryDataExportMenu = (
    <Menu onClick={handleTemporaryDataExportClick}>
      {typeList.map((item) => {
        return (
          <Menu.Item key={item}>
            <Icon type={item} />
            {item.toUpperCase()}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  // 上传入参
  const uploadExcelProps = {
    args,
    sync,
    auto,
    prefixPatch,
    templateCode: params.code,
    success: uploadSuccess,
    tenantId,
  };

  // 数据表格入参
  const listProps = {
    importStatus,
    onSave: handleSave,
    columns: dynamicColumns,
    dataSource: dataSource.map((item) => ({
      ...item,
      _status: 'update',
    })),
    loading:
      state.loadTemplateLoading ||
      state.validateDataLoading ||
      state.importDataLoading ||
      state.loadDataSourceLoading ||
      state.updateOneLoading,
  };

  // 历史记录入参
  const historyProps = {
    visible: historyVisible,
    onRecordRestore: handleRestore,
    onCancel: handleCloseHistory,
    tenantId,
    prefixPatch,
    templateCode: params.code,
    dataImportStatus,
  };

  const breadValue = backPath
    ? { childTitle1: action, pageTitle: { path: backPath, name: backTitle } }
    : { pageTitle: action };

  return (
    <>
      <BreadCrumbs className="bread-crumbs" value={breadValue} />
      <div className={styles['common-import']}>
        <div className="import-header">
          <div className="option-btns">
            <Button
              icon="profile"
              className="btn-margin"
              onClick={handleOpenHistory}
              title={intl.get('mallf.commonImport.model.history.record').d('历史记录')}
            >
              {intl.get('mallf.commonImport.model.history.record').d('历史记录')}
            </Button>
            <Button
              key="auto-refresh"
              icon={isAutoRefresh ? 'loading' : 'sync'}
              onClick={handleToggleAutoRefresh}
              disabled={state.updateOneLoading || !batch}
              loading={state.queryStatusLoading || state.loadDataSourceLoading}
              className="btn-margin"
              title={
                isAutoRefresh
                  ? intl.get('mallf.commonImport.button.cancelAutoReload').d('取消自动刷新')
                  : intl.get('mallf.commonImport.button.autoReload').d('自动刷新')
              }
            >
              {isAutoRefresh
                ? intl.get('mallf.commonImport.button.cancelAutoReload').d('取消自动刷新')
                : intl.get('mallf.commonImport.button.autoReload').d('自动刷新')}
            </Button>
            <Button
              key="refresh"
              icon="sync"
              onClick={handleRefresh}
              disabled={state.updateOneLoading || !batch}
              loading={state.queryStatusLoading || state.loadDataSourceLoading}
              className="btn-margin"
              title={intl.get('mallf.commonImport.button.reload').d('刷新')}
            >
              {intl.get('mallf.commonImport.button.reload').d('刷新')}
            </Button>
            {!auto && (
              <React.Fragment key="noAutoSync">
                <Button
                  key="import"
                  icon="to-top"
                  onClick={handleImportData}
                  disabled={state.updateOneLoading || !batch}
                  loading={state.importDataLoading}
                  className="btn-margin"
                  title={intl.get('mallf.commonImport.view.button.importData').d('数据导入')}
                >
                  {intl.get('mallf.commonImport.view.button.importData').d('数据导入')}
                </Button>
                <Button
                  key="validate"
                  icon="check-circle-o"
                  onClick={handleValidateData}
                  disabled={!batch}
                  loading={state.validateDataLoading}
                  title={intl.get('mallf.commonImport.view.button.validateData').d('数据验证')}
                >
                  {intl.get('mallf.commonImport.view.button.validateData').d('数据验证')}
                </Button>
              </React.Fragment>
            )}
            <UploadExcel {...uploadExcelProps} />
            <Dropdown overlay={templateDownloadMenu}>
              <Button
                type="primary"
                title={intl.get('mallf.commonImport.view.button.downloadTemplate').d('下载模板')}
              >
                {intl.get('mallf.commonImport.view.button.downloadTemplate').d('下载模板')}
                <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
          <div className="option-forms">
            <SelPlus
              disabled={!batch}
              value={defaultSheet}
              onChange={handleChangeSheet}
              options={templateTargetList}
              valueKey="sheetIndex"
              meaingKey="sheetIndexMeaning"
              label="Sheet"
            />
            <SelPlus
              allowClear
              disabled={!status}
              value={searchDataImportStatus}
              onChange={handleDataImportStatusChange}
              options={importStatus}
              label={intl.get('mallf.commonImport.view.status').d('状态')}
              style={{ marginLeft: 12 }}
            />
            <Dropdown
              disabled={!batch || !status || status === 'UPLOADING'}
              overlay={temporaryDataExportMenu}
            >
              <Button title={intl.get('mallf.commonImport.button.data.export').d('数据导出')}>
                {intl.get('mallf.commonImport.button.data.export').d('数据导出')}
              </Button>
            </Dropdown>
          </div>
        </div>
        <List {...listProps} />
        <div style={{ marginTop: 16 }}>
          <Pagination
            zeroStart
            showQuickJumper
            {...pagination}
            onForward={getDataSource}
            allPages
          />
        </div>
        {historyVisible && <HistoryModal {...historyProps} />}
      </div>
    </>
  );
}

export default formatterCollections({ code: 'mallf.commonImport' })(ImportComponent);
