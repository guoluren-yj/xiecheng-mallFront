import * as React from 'react';
import { DataSet, Spin, Select, Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import notification from 'hzero-front/lib/utils/notification';

import { downloadFileByAxios } from './api';

import DraggerUpload from './DraggerUpload';
import styles from './index.less';
import _store, { tableDS, EImportType, EState } from './stores';
import { setFieldProperties } from './utils/FieldProperties';

const { HZERO_IMP } = getEnvConfig();

declare module 'axios' {
  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>;
  }
}

interface ImportProps {
  infoDs: DataSet;
  code?: string;
  tenantId: string | number;
  prefixPatch: string;
  importType: string;
  servicePath: string;
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({
  infoDs,
  code,
  tenantId,
  prefixPatch,
  modal,
  servicePath,
  importType,
  modalProps,
}) => {
  const {
    setDataSource,
    setDraggerData,
    draggerData: { isAuto, state, queryTimer },
    dataSource: {
      templateTargetList,
      code: templateCode,
      businessObjectList,
      businessObjectTemplates,
      refreshButton,
      auto,
      prefixPatch: actualPrefixPatch,
    },
  } = React.useContext<any>(_store as any).store;

  const uploadRef = React.useRef<any>();

  React.useEffect(() => {
    if (importType === EImportType.templateCode) {
      infoDs.setQueryParameter('importType', EImportType.templateCode);
      infoDs.setQueryParameter('tenantId', tenantId);
      infoDs.setQueryParameter('prefixPatch', prefixPatch);
      infoDs.setQueryParameter('code', code);
      infoDs.query().then((res) => {
        if (infoDs.current) {
          infoDs.current.set('template', res.templateCode);

          if (res.templateType === 'c' && !res.prefixPatch && !prefixPatch) {
            setDataSource({ ...res, prefixPatch: HZERO_IMP });
          } else {
            setDataSource(res);
          }
        }
      });
    } else {
      infoDs.setQueryParameter('tenantId', tenantId);
      infoDs.setQueryParameter('importType', importType);
      infoDs.setQueryParameter('code', code);
      infoDs.query().then((res: any[]) => {
        if (getResponse(res)) {
          if (!isEmpty(res)) {
            const arr =
              res?.map((item) => {
                return {
                  templateCode: item.templateCode,
                  templateName: item.templateName,
                  servicePath: item.servicePath,
                };
              }) || [];
            infoDs.create({}, 0);
            if (infoDs.current) {
              infoDs.current.set('template', arr?.[0]?.templateCode);
            }
            setDataSource({
              prefixPatch:
                servicePath ||
                (importType === EImportType.businessObjectTemplateCategory
                  ? HZERO_IMP
                  : `/${res[0]?.servicePath}` || HZERO_IMP),
              actualTemplateCode:
                importType === EImportType.businessObjectTemplateCategory
                  ? undefined
                  : res[0].templateCode,
              businessObjectList: arr,
              businessObjectTemplates: res,
            });
          } else {
            notification.error({
              message: intl.get('hzero.common.componenets.import.message.notFind').d('未找到模板'),
            });
          }
        }
      });
    }
  }, []);

  React.useEffect(() => {
    modal.handleCancel(() => {
      if (modalProps.destroyOnClose !== false) {
        clearInterval(queryTimer);
        setDraggerData('isAuto', false);
        setDraggerData('queryTimer', undefined);
      }
    });
  }, [queryTimer]);

  React.useEffect(() => {
    if (code) {
      modal.update({
        footer: (
          <>
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                clearInterval(queryTimer);
                setDraggerData('isAuto', false);
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
            <Button onClick={uploadRef.current?.handleOpenHistory}>
              {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
            </Button>
            {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
              <Button
                key="refresh"
                icon="sync"
                onClick={() => uploadRef.current?.handleRefresh({ flag: true })}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>
            )}
            {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
              <Button key="auto-refresh" icon={isAuto ? 'restore' : 'sync'} onClick={handleSetAuto}>
                {isAuto
                  ? intl.get('hzero.common.button.cancelAutoReload').d('取消自动刷新')
                  : intl.get('hzero.common.button.autoReload').d('自动刷新')}
              </Button>
            )}
          </>
        ),
        modalFlag: false,
      });
    }
  }, [templateCode, isAuto, state, modal.props.modalFlag]);

  const handleSetAuto = React.useCallback(() => {
    setDraggerData('isAuto', !isAuto);
  }, [isAuto]);

  const handleDownloadTemplateExcel = React.useCallback(() => {
    const t = infoDs.current?.get('template');
    let templatePrefixPatch = servicePath || actualPrefixPatch;
    const obj = businessObjectList.find((i) => i.templateCode === t);
    templatePrefixPatch =
      servicePath || (obj ? `/${obj.servicePath}` : undefined) || templatePrefixPatch;
    const api =
      importType !== EImportType.templateCode
        ? `${templatePrefixPatch}/v1/${tenantId}/import/data/model/${importType !== EImportType.businessObjectTemplateCategory
          ? code
          : infoDs.current?.get('template')
        }/excel`
        : `${templatePrefixPatch}/v1/${tenantId}/import/template/${code}/excel`;
    downloadFileByAxios({ requestUrl: api, method: 'GET', queryParams: [], queryData: {} }).catch((e) => {
      notification.error({
        message: e.message,
      });
    });
  }, [actualPrefixPatch, importType, businessObjectList, servicePath]);

  React.useEffect(() => {
    const dsMap = new Map();

    if (!isEmpty(templateTargetList) && importType === EImportType.templateCode) {
      const arr = [] as Array<any>;
      templateTargetList.forEach((temp) => {
        const tableDs = tableDS();
        if (!isEmpty(temp.templateLineList)) {
          temp.templateLineList.forEach((item) => {
            let pattern;
            if (item.regularExpression) {
              pattern = new RegExp(item.regularExpression);
            }
            let field = {};

            switch (item.columnType.toLowerCase()) {
              case 'decimal':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  // ts没加
                  type: 'number',
                  pattern,
                  max: item.maxValue,
                  min: item.minValue,
                  required: item.nullable === 1,
                };
                break;

              case 'long':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'number',
                  pattern,
                  precision: 0,
                  max: item.maxValue,
                  min: item.minValue,
                  required: item.nullable === 1,
                };
                break;
              case 'boolean':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'boolean',
                };
                break;
              case 'multi':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'intl',
                  pattern,
                  required: item.nullable === 1,
                };
                break;
              default:
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'string',
                  pattern,
                  required: item.nullable === 1,
                };
                break;
            }
            if (tableDs.fields) {
              tableDs.fields.push(field);
            }
          });
        }
        arr.push(tableDs);
      });
      dsMap.set(templateCode, arr);
      setDataSource({ dsMap });
    } else if (!isEmpty(businessObjectTemplates)) {
      businessObjectTemplates.forEach((i) => {
        const arr = [] as Array<any>;
        i.importTemplateSheets.forEach((temp) => {
          const tableDs = tableDS();
          if (!isEmpty(temp.importTemplateColumns)) {
            temp.importTemplateColumns.forEach((item) => {
              if (item.enabledFlag) {
                const filedPropertied = setFieldProperties(item.componentType, item);
                if (tableDs.fields) {
                  tableDs.fields.push(filedPropertied);
                }
              }
            });
          }
          arr.push(tableDs);
        });
        dsMap.set(i.templateCode, arr);
      });
      setDataSource({ dsMap });
    }
  }, [templateTargetList, businessObjectTemplates]);

  // FIXME: 有病吧，为啥要子传父
  const RefUpload = React.forwardRef(() => <DraggerUpload myRef={uploadRef} />);

  return (
    <Spin dataSet={infoDs}>
      <span className={styles['common-import-title']}>
        {intl.get('hzero.common.components.import.message.excel').d('导入符合模版规范的Excel文件')}
      </span>
      <RefUpload />
      <div className={styles['common-import-template']}>
        <span className={styles['common-import-template-title']}>
          {intl.get('hzero.common.components.import.downloadTemplate').d('下载模板')}
        </span>
        {importType === EImportType.businessObjectTemplateCategory && (
          <Select
            dataSet={infoDs}
            name="template"
            clearButton={false}
            className={styles['common-import-template-select']}
          >
            {businessObjectList.map((item) => (
              <Select.Option value={item.templateCode} key={item.templateCode}>
                {item.templateName}
              </Select.Option>
            ))}
          </Select>
        )}
        <Button
          className={styles['common-import-template-button']}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          onClick={handleDownloadTemplateExcel}
          disabled={!actualPrefixPatch}
          icon="get_app"
        >
          {intl.get('hzero.common.components.import.downloadTemplate').d('下载模板')}
        </Button>
      </div>
    </Spin>
  );
};

export default observer(Drawer);
