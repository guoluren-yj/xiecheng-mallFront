/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';
// FIXME: 3月份mox说过要废弃使用useLocalObservable替代，但装的版本没有useLocalObservable
import { useLocalStore } from 'mobx-react-lite';
import { runInAction } from 'mobx';

import intl from 'utils/intl';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';


const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

const { HZERO_IMP, HZERO_PLATFORM, HZERO_HMDE } = getEnvConfig();

const infoDS: () => DataSetProps = () => ({
  selection: false,
  autoQuery: false,
  paging: false,

  transport: {
    read: ({ data: { prefixPatch, tenantId, code, importType } }): AxiosRequestConfig => {
      let url = prefixPatch
        ? `${prefixPatch}/v1/${tenantId}/import/template/${code}/info`
        : `${HZERO_IMP}/v1/${!isTenant ? `${tenantId}/` : ''}template/${code}/info${
            isTenant ? `?tenantId=${organizationId}` : ''
          }`;
      let data: any = !prefixPatch && isTenant ? { tenantId: organizationId } : {};
      if (importType !== EImportType.templateCode) {
        url = `${HZERO_HMDE}/v1/${tenantId}/business-object-import-templates/list`;
        data =
          importType === EImportType.businessObjectTemplateCode
            ? {
                templateCode: code,
              }
            : {
                templateCategory: code,
              };
      }
      return {
        method: 'GET',
        url,
        data,
        params: {},
      };
    },
  },
});

const tableDS: () => DataSetProps = () => ({
  primaryKey: '_id',
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'HIMP.DATA_STATUS',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('数据状态'),
    },
  ],
  fields: [
    {
      name: '_dataStatus',
      type: FieldType.string,
      lookupCode: 'HIMP.DATA_STATUS',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('数据状态'),
    },
    {
      name: '_info',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.message').d('信息'),
    },
  ],
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      const {
        prefixPatch,
        tenantId,
        importType,
        batch,
        templateCode,
        sheetIndex,
        businessObjectTemplateCode,
        businessObjectTemplateCategory,
      } = data;
      return {
        url: `${prefixPatch}/v1/${tenantId}/import/data${
          importType === EImportType.templateCode ? '' : '/model'
        }`,
        method: 'GET',
        data: {
          ...data,
          batch,
          templateCode,
          sheetIndex,
          businessObjectTemplateCode,
          businessObjectTemplateCategory,
          ...params,
        },
        transformResponse: (res) => {
          let formatData: any = {};
          let newContent = [];
          try {
            formatData = JSON.parse(res);
          } catch (e) {
            return e;
          }
          if (getResponse(formatData)) {
            if (formatData && formatData?.content.length > 0) {
              newContent = formatData?.content.map((item) => {
                let obj = {};
                try {
                  obj = JSON.parse(item?._data);
                } catch (e) {
                  return item;
                }
                return { ...item, ...obj };
              });
            }

            return { ...formatData, content: newContent };
          } else {
            return null;
          }
        },
      };
    },
  },
});

const historyTableDS: (importType: string) => DataSetProps = (importType) => ({
  primaryKey: 'batch',
  selection: false,
  autoQuery: false,
  queryFields: [
    importType !== EImportType.templateCode && {
      name: 'fileName',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.fileName').d('文件'),
    },
    importType !== EImportType.templateCode && {
      name: 'creationDate',
      type: FieldType.dateTime,
      label: intl.get('hzero.common.components.import.model.creationDate').d('提交时间'),
    },
    importType !== EImportType.templateCode && {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'HIMP.IMPORT_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    importType === EImportType.templateCode && {
      name: 'creationDateFrom',
      type: FieldType.dateTime,
      label: intl.get('hzero.common.components.import.model.creationDateFrom').d('创建日期从'),
    },
    importType === EImportType.templateCode && {
      name: 'creationDateTo',
      type: FieldType.dateTime,
      label: intl.get('hzero.common.components.import.model.creationDateTo').d('创建日期至'),
    },
  ].filter(Boolean) as FieldProps[],
  fields: [
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'HIMP.IMPORT_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'batch',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.batch').d('批次号'),
    },
    {
      name: 'dataCount',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.dataCount').d('数据数量'),
    },

    {
      name: 'fileName',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.fileName').d('文件'),
    },
    {
      name: 'description',
      type: FieldType.string,
      label: intl.get('hzero.common.explain').d('说明'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.creationDate').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      const { prefixPatch, tenantId, importType: oldImportType, ...others } = data;
      return {
        url: `${
          importType === EImportType.templateCode ? prefixPatch : HZERO_PLATFORM
        }/v1/${tenantId}${
          importType === EImportType.templateCode
            ? '/import/manager'
            : '/import-tasks/page/by-import'
        }`,
        method: 'GET',
        data: { ...others, ...params },
      };
    },
    destroy: ({ data, dataSet }): AxiosRequestConfig => {
      const prefixPatch = dataSet?.getQueryParameter('prefixPatch');
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `${prefixPatch}/v1/${tenantId}/import/manager`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const sourceStore = createContext({});

export enum EImportStatus {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  CHECKING = 'CHECKING',
  CHECKED = 'CHECKED',
  CHECK_FAILED = 'CHECK_FAILED',
  IMPORTING = 'IMPORTING',
  IMPORTED = 'IMPORTED',
  IMPORT_FAILED = 'IMPORT_FAILED',
}

export enum EState {
  init = 'init',
  done = 'done',
  uploading = 'uploading',
  uploaded = 'uploaded',
  checking = 'checking',
  checkFailed = 'check_failed',
}

export enum EImportType {
  templateCode = 'templateCode',
  businessObjectTemplateCode = 'businessObjectTemplateCode',
  businessObjectTemplateCategory = 'businessObjectTemplateCategory',
}

export interface IDraggerData {
  status: EImportStatus;
  state: EState;
  checkProgress: number;
  importProgress: number;
  isAuto: boolean;
  ready: number;
  count: number;
  autoRefreshInterval: number;
  queryTimer?: any;
  progress: number;
}

export interface IObjectProps {
  [propName: string]: any;
}

export interface ITemplateListObj {
  templateCode: string;
  templateName: string;
}

export interface IDataSource {
  prefixPatch: string;
  servicePath: string;
  tenantId: string;
  code: string;
  batch: string;
  args: any;
  templateType: string;
  templateTargetList: any[];
  templateCode: string;
  templateCategory: string;
  templateName: string;
  templateId: string;
  fragmentFlag: number;
  importType: EImportType;
  businessObjectList: ITemplateListObj[];
  businessObjectTemplates: any[];
  actualTemplateCode: string | undefined;
  dsMap: any[];
  restoreShowAllButton: boolean;
  refreshButton: boolean;
  successCallBack: () => any;
  errorCallBack: () => any;
}

export interface ISourceManagerStore {
  draggerData: IDraggerData;
  dataSource: IDataSource;
  setState: (key: EState) => void;
  setDraggerData: (key: string, value: any) => void;
  setDataSource: (dataSource: IDataSource) => void;
}

function SourceManagerProvider(props) {
  const { children } = props;

  const store = useLocalStore(
    (): ISourceManagerStore => ({
      draggerData: {
        status: EImportStatus.UPLOADING,
        state: EState.init,
        checkProgress: 0,
        importProgress: 0,
        isAuto: false,
        autoRefreshInterval: 5000,
        ready: 0,
        count: 0,
        queryTimer: undefined,
        progress: 0,
      },
      dataSource: {
        templateCode: '',
        templateCategory: '',
        templateName: '',
        templateId: '',
        batch: '',
        prefixPatch: '',
        servicePath: '',
        tenantId: getCurrentOrganizationId(),
        code: '',
        args: {},
        templateType: '',
        templateTargetList: [],
        fragmentFlag: 0,
        importType: EImportType.templateCode,
        businessObjectList: [],
        businessObjectTemplates: [],
        dsMap: [],
        actualTemplateCode: undefined,
        restoreShowAllButton: true,
        refreshButton: false,
        successCallBack: () => undefined,
        errorCallBack: () => undefined,
      },
      setState(state) {
        // FIXME: 严格模式下,异步数据操作需要用runInAction包裹
        this.draggerData.state = state;
      },
      setDraggerData(key: string, value: any) {
        this.draggerData[key] = value;
      },
      setDataSource(dataSource: any) {
        runInAction(() => {
          Object.keys(dataSource).forEach((i) => {
            if (i === 'prefixPatch' && this.dataSource.servicePath) {
              this.dataSource.prefixPatch = this.dataSource.servicePath;
            } else {
              this.dataSource[i] = dataSource[i];
            }
          });
        });
      },
    })
  );

  return (
    <sourceStore.Provider
      value={{
        store,
        history: props.history,
      }}
    >
      {children}
    </sourceStore.Provider>
  );
}

export default sourceStore;
export { infoDS, tableDS, historyTableDS, SourceManagerProvider };
