import React, { ReactNode, useState, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import { Button, Modal, DataSet } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { isEmpty, isFunction } from 'lodash';

import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import intl from 'utils/intl';
import { listenDownloadError } from 'hzero-front/lib/utils/utils';
import notification from 'utils/notification';
import { downloadFileByAxios, initiateAsyncExport } from 'hzero-front/lib/services/api';
import ExportContent from './ExportContent';
// import ExportHistory from './ExportHistory';
import { ExportTemplateTypeEnum } from './util';
import { baseQueryDS, exportTreeDS } from './exportDS';
import './index.less';

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'downloadError',
  intl.get('hzero.common.notification.export.error').d('导出异常')
);

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'asyncRequestSuccess',
  intl.get('hzero.common.notification.export.async').d('异步导出任务已提交'),
  'success'
);

interface IObjectKeyProps {
  [key: string]: string;
}

interface TableColumnsProps {
  name: string;
  title: string;
}

export interface IExcelExportProps {
  requestUrl: string;
  method?: 'GET' | 'POST' | 'get' | 'post';
  queryParams?: any;
  allBody?: boolean;
  code?: string;
  fileName?: string;
  title?: string;
  buttonText?: string;
  exportAsync?: boolean;
  defaultConfig?: any;
  defaultSelectAll?: boolean;
  otherButtonProps?: IObjectKeyProps;
  // exportType?: ExportTypeEnum;
  queryFormItem?: ReactNode; // 渲染导出
  templateCode?: string;
  tableRef?: any;
}

const ExcelExport: React.FC<IExcelExportProps> = observer(props => {
  const {
    exportAsync = false,
    requestUrl,
    method = 'GET',
    defaultSelectAll,
    defaultConfig,
    buttonText = intl.get('hzero.common.button.export').d('导出'),
    title = intl.get(`hzero.common.components.export`).d('导出Excel'),
    fileName = '',
    queryParams = {},
    queryFormItem,
    templateCode,
    allBody = false,
    otherButtonProps,
    tableRef,
  } = props;
  const [configChecked, setConfigChecked] = useState<any>([]);
  const [tableColumns, setTableColumns] = useState<TableColumnsProps[]>([]);
  const [defaultRequestMode, setDefaultRequestMode] = useState<any>(null);
  const [showAsync, setShowAsync] = useState<boolean>(true);

  // 判断当前 table 是 hzero-ui 还是 choerodon-ui
  useEffect(() => {
    if (tableRef?.current?.columns) {
      const columns = tableRef?.current?.columns;
      columns.forEach(i => {
        tableColumns.push({
          name: i.dataIndex,
          title: i.name,
        });
        setTableColumns(tableColumns);
      });
    } else if (tableRef?.current?.tableStore?.columns?.slice()) {
      const columns = tableRef?.current?.tableStore?.columns?.slice();
      columns.forEach(i => {
        tableColumns.push({
          name: i.name,
          title: i.name,
        });
        setTableColumns(tableColumns);
      });
    }
  }, [tableRef]);

  const buttonProps = {
    icon: 'unarchive',
    type: 'c7n-pro',
    tooltip: 'none',
    ...otherButtonProps,
  };

  const queryArea = useMemo(() => new DataSet(baseQueryDS()), []);
  const treeArea = useMemo(() => new DataSet(exportTreeDS()), []);

  useEffect(() => {
    if (templateCode) {
      setDefaultRequestMode('ASYNC');
      queryArea.setState('defaultRequestMode', 'ASYNC');
    }
  }, [templateCode]);

  // const openHistoryModal = () => {
  //   Modal.open({
  //     key: 'exportHistoryModal',
  //     drawer: true,
  //     size: 'large',
  //     style: {
  //       width: '1000px',
  //     },
  //     title: intl.get('hzero.common.excelExport.view.title.asyncData').d('异步数据'),
  //     children: <ExportHistory />,
  //   });
  // };

  const openModal = () => {
    const modal = Modal.open({
      key: 'exportModal',
      drawer: true,
      title,
      className: 'srm-common-export-modal',
      children: (
        <ExportContent
          queryArea={queryArea}
          treeArea={treeArea}
          exportAsync={exportAsync}
          queryFormItem={queryFormItem}
          templateCode={templateCode}
          handleExport={handleExport}
        />
      ),
      footer: (
        <>
          <Button
            color={ButtonColor.primary}
            disabled={treeArea.getState('openFlag') === false}
            onClick={async () => {
              const flag = await handleExport();
              if (flag) {
                modal.close();
              }
            }}
          >
            {intl.get('hzero.common.button.confirm.export').d('导出')}
          </Button>
          <Button
            onClick={() => {
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  };

  const queryColumnData = (config?: {}, open?: boolean) => {
    treeArea.setQueryParameter('requestUrl', requestUrl);
    treeArea.setQueryParameter('method', method);
    treeArea.setQueryParameter('defaultSelectAll', defaultSelectAll);
    treeArea.setQueryParameter('templateCode', templateCode || '');
    treeArea.setQueryParameter('templateType', templateCode ? ExportTemplateTypeEnum.DEFAULT : '');
    treeArea.setState('tableColumns', templateCode ? tableColumns : '');
    treeArea.setState('openFlag', false);
    if (open) {
      openModal();
    }
    const defaultList: any = [];
    treeArea
      .query()
      .then(res => {
        if (res) {
          if (defaultSelectAll) {
            res.forEach(item => {
              defaultList.push(item?.id);
            });
          } else {
            res.forEach(i => {
              if (i.checked) {
                defaultList.push(i.id);
              }
            });
          }
          const headData = res[0];
          setShowAsync(isEmpty(headData?.defaultRequestMode));
          setDefaultRequestMode(headData?.defaultRequestMode);
          queryArea.setState(
            'defaultRequestMode',
            templateCode ? 'ASYNC' : headData?.defaultRequestMode
          );
          queryArea.setState('templateCode', templateCode);
          queryArea.setState('treeParams', headData);
          treeArea.setState('openFlag', true);
          const enableAsync = !!headData?.enableAsync || false;
          if (!enableAsync && queryArea?.current?.get('async') === 'true') {
            queryArea.current.set('async', 'false');
          }
        }
      })
      .finally(() => {
        if (!isEmpty(config)) {
          traversalTreeNodes(defaultList);
          handleExport(config);
        }
      });
  };

  const handleExport = (config = {}) => {
    return new Promise((resolve, reject) => {
      let queryData: any = {};
      let newQueryParams = queryParams;
      if (isFunction(queryParams)) {
        newQueryParams = queryParams();
      }
      if (method !== 'GET' && method !== 'get') {
        queryData = {
          ...queryArea.toData()[0],
          ...config,
          exportTemplateCode: treeArea.getQueryParameter('templateCode'),
          exportTemplateType: treeArea.getQueryParameter('templateType'),
        };
      } else {
        newQueryParams = {
          ...newQueryParams,
          ...queryArea.toData()[0],
          ...config,
          exportTemplateCode: treeArea.getQueryParameter('templateCode'),
          exportTemplateType: treeArea.getQueryParameter('templateType'),
        };
      }

      if (!showAsync) {
        newQueryParams.async = defaultRequestMode === 'ASYNC';
      }
      const checkedKeysAll = configChecked.concat(treeArea.toJSONData());
      if (!checkedKeysAll || checkedKeysAll.length === 0) {
        notification.warning({
          message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        });
        reject();
      } else {
        let params: any = [];
        if (method !== 'GET' && method !== 'get') {
          queryData.ids = checkedKeysAll.map(i => i.id);
          queryData.exportType = 'DATA';
          queryData.columns = checkedKeysAll;
        } else {
          params = checkedKeysAll.map(i => i.id).map(item => ({ name: 'ids', value: item }));
          params.push({ name: 'exportType', value: 'DATA' });
        }

        // 添加表单查询参数
        if (allBody) {
          let customData;
          try {
            customData = JSON.stringify(newQueryParams);
          } catch (e) {
            console.error(e);
          }
          queryData.customData = customData;
        } else {
          for (const key of Object.keys(newQueryParams)) {
            if (newQueryParams[key] !== undefined && newQueryParams[key] !== '') {
              params.push({ name: key, value: newQueryParams[key] });
            }
          }
        }
        // 添加导出Excel参数
        if ((queryArea.toData()[0] as any)?.async === 'true') {
          initiateAsyncExport({ requestUrl, queryParams: params, method, queryData }).then(() => {
            // if (res) {
            //   notification.success({
            //     message: intl
            //       .get('hzero.common.notification.export.asyncWithUid', { uuid: res.uuid })
            //       .d(`异步导出任务已提交${res.uuid}`),
            //   });
            // }
          });
          resolve(true);
        } else {
          downloadFileByAxios({ requestUrl, queryParams: params, method, queryData }, fileName)
            .catch(() => {
              // if (err && getResponse(err) && err.uuid) {
              //   notification.success({
              //     message: intl
              //       .get('hzero.common.notification.export.asyncWithUid', { uuid: err.uuid })
              //       .d(`异步导出任务已提交${err.uuid}`),
              //   });
              // }
              resolve(true);
            })
            .then(res => {
              if (res) {
                if (!isEmpty(config)) {
                  setConfigChecked([]);
                }
              }
              resolve(true);
            });
        }
      }
    });
  };

  /**
   * 将 defaultConfig 配置的数据默认勾选上
   * @function traversalTreeNodes - 遍历树的子节点
   * @param {object} data - 列数据
   */
  const traversalTreeNodes = (data = [], arr = []) => {
    const idList = arr;
    data.map((item: any) => {
      const temp = item;
      configChecked.push(temp);
      setConfigChecked(configChecked);
      if (temp.children) {
        traversalTreeNodes(temp.children, idList);
      }
      return temp;
    });
  };

  const openExportModal = () => {
    queryArea.create({}, 0);
    if (!isEmpty(defaultConfig)) {
      const { data, ...others } = defaultConfig;
      if (!isEmpty(data)) {
        traversalTreeNodes(defaultConfig.data);
        handleExport({ fillerType: 'single-sheet', ...others, async: 'false' });
      } else {
        queryColumnData({ fillerType: 'single-sheet', ...others, async: 'false' });
      }
    } else {
      queryColumnData({}, true);
    }
  };

  // const handleMenuClick = ({ key }) => {
  //   if (key === 'async-data') {
  //     openHistoryModal();
  //   } else if (key === 'export') {
  //     openExportModal();
  //   }
  // };

  const clsName = classnames('srm-common-export-button', (otherButtonProps || {}).className);

  return (
    <>
      {/* {exportAsync && isEmpty(defaultConfig) ? (
        <Dropdown
          overlay={
            <Menu onClick={handleMenuClick}>
              <Menu.Item key='export'>{intl.get('hzero.common.button.export').d('导出')}</Menu.Item>
              <Menu.Item key='async-data'>
                {intl.get('hzero.common.excelExport.asyncDataView').d('异步数据查看')}
              </Menu.Item>
            </Menu>
          }
        >
          <Button {...buttonProps}>
            {buttonText}
            <Icon type='down' />
          </Button>
        </Dropdown>
      ) : (
        <Button {...buttonProps} onClick={openExportModal}>
          {buttonText}
        </Button>
      )} */}
      <ButtonPermission {...buttonProps} className={clsName} onClick={openExportModal}>
        {buttonText}
        <span className="srm-common-export-button-tag">NEW</span>
      </ButtonPermission>
    </>
  );
});

export default ExcelExport;
