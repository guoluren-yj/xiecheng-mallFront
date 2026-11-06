/**
 * choerodon-ui - choerodon-ui 客制化配置文件
 * @Author: wuyunqiang <yunqiang.wu@hand-china.com>
 * @Date: 2019-08-15 09:12:30
 * @LastEditTime: 2019-08-27 09:47:01
 * @Copyright: Copyright (c) 2018, Hand
 */
import axios from 'axios';
import JSONBig from 'json-bigint';
import JSON3 from 'json3';
import { formatNumber } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import { isString, isEmpty, debounce } from 'lodash';
import React, { useState } from 'react';
import { configure, message, notification as c7nNotification } from 'choerodon-ui';
import { Button, Form, Modal, message as C7nMessage } from 'choerodon-ui/pro';
// import 'utils/c7n-ued-polyfill.important.less';
import { apiGateway, HZERO_PLATFORM } from 'utils/api-config';
import intl from 'utils/intl';
import Swal from 'components/swal';
import {
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  generateUrlWithGetParam,
  getOrganizationId,
  getMenuId,
  getCurrentUserId,
  getCurrentUser,
} from 'utils/utils';
import { getConfig } from 'hzero-boot';
import DocumentWizardPopover from 'components/DocumentWizardPopover';
import FilterSelect from 'choerodon-ui/pro/lib/table/query-bar/FilterSelect';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import request from 'utils/request';
import attachmentConfig from './Attachment';

if (typeof window !== 'undefined') {
  JSON3.noConflict();
  window.JSON3 = JSON3;
  window.$JSON = window.$JSON || window.JSON;
  Object.defineProperty(window, 'JSON', {
    get() {
      return JSONBig;
    },
    set() {},
  });
  if (typeof Response !== 'undefined') {
    Response.prototype.json = function () {
      return this.text().then((text) => JSON.parse(text));
    };
  }
}
const { toFixed, toFormat } = BigNumber.prototype;
Object.assign(BigNumber.prototype, {
  // 兼容 React 数字渲染
  [Symbol.iterator]() {
    return this.toString()[Symbol.iterator]();
  },
  // 兼容格式化
  toLocaleString(lang, options) {
    return formatNumber(this, lang, options);
  },
  toFixed(decimalPlaces, roundingMode) {
    const dp = Number(decimalPlaces);
    return toFixed.call(this, isNaN(dp) ? 0 : dp, roundingMode);
  },
  toFormat(decimalPlaces, roundingMode, format) {
    if (decimalPlaces === undefined) {
      // eslint-disable-next-line no-param-reassign
      decimalPlaces = this.dp();
    }
    return toFormat.call(this, decimalPlaces, roundingMode, format);
  },
});
// 兼容 lodash.isNumber
Object.defineProperty(BigNumber.prototype, Symbol.toStringTag, {
  value: 'Number',
});

// eslint-disable-next-line import/no-mutable-exports
let withTokenAxios = {};

// 只执行一次
if (!withTokenAxios._SRM_AXIOS_IS_CONFIGED) {
  // 覆盖hzero axios request拦截器
  // Add a request interceptor
  withTokenAxios = axios;
  withTokenAxios.interceptors.request.use(
    (config) => {
      let { url = '' } = config;
      if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
        url = `${apiGateway}${url}`;
      }
      // Do something before request is sent
      const newConfig = {
        ...config,
        url,
        headers: {
          ...config.headers,
          Authorization: `bearer ${getAccessToken()}`,
        },
      };
      const MenuId = getMenuId();
      if (MenuId) {
        newConfig.headers['H-Menu-Id'] = `${getMenuId()}`;
      }
      // 添加额外的请求头
      const patchRequestHeaderConfig = getConfig('patchRequestHeader');
      let patchRequestHeader;
      if (patchRequestHeaderConfig) {
        if (typeof patchRequestHeaderConfig === 'function') {
          patchRequestHeader = patchRequestHeaderConfig();
        } else {
          patchRequestHeader = patchRequestHeaderConfig;
        }
        newConfig.headers = {
          ...newConfig.headers,
          ...patchRequestHeader,
        };
      }
      return newConfig;
    },
    (error) =>
      // Do something with request error
      Promise.reject(error)
  );

  withTokenAxios._SRM_AXIOS_IS_CONFIGED = true;
}

// axios.defaults.headers.common.Authorization = `bearer ${getAccessToken()}`;
message.config({
  placement: 'top',
  top: window.innerHeight / 4,
  duration: 3,
  maxCount: 3,
});

c7nNotification.config({
  placement: 'bottomRight',
  foldCount: 2,
});

C7nMessage.config({
  placement: 'top',
  top: window.innerHeight / 4,
  duration: 3,
  maxCount: 3,
});

const lovDefineAxiosConfig = (code) => ({
  url: `${apiGateway}${HZERO_PLATFORM}/v1/${
    isTenantRoleLevel() ? `${getOrganizationId() || 0}/` : ''
  }/lov-view/info?viewCode=${code}&tenantId=${getCurrentOrganizationId()}`,
  method: 'GET',
  transformResponse: [
    (data) => {
      // 对 data 进行任意转换处理
      let originData = {};

      try {
        originData = JSON.parse(data);
      } catch (e) {
        console.error(e, data);
        return data;
      }

      const {
        viewCode = code,
        valueField = 'value',
        displayField = 'name',
        pageSize = 5,
        queryFields = [],
        tableFields = [],
        idField = undefined,
        childrenFieldName = undefined,
        // queryUrl,
      } = originData;
      let { title } = originData;
      if (originData.failed) {
        title = intl
          .get('hzero.common.c7n.lov.notDefine', { code })
          .d(`值集视图未定义: "${code}", 请维护值集视图!`);
      } else if (!originData.lovCode) {
        title = `lov ${code} loading...`;
      }
      const lovItems = [];
      let tableWidth = 0;
      queryFields.forEach((queryItem = {}) => {
        const lovItem = {
          lovId: viewCode,
          lovItemId: `query_${queryItem.field}`,
          gridFieldName: queryItem.field,
          gridField: 'N',
          display: queryItem.label,
          autocompleteField: 'Y',
          conditionField: 'Y',
          isAutocomplete: 'N',
          conditionFieldWidth: null,
          conditionFieldLabelWidth: null,
          conditionFieldType: queryItem.dataType,
          conditionFieldSelectCode: queryItem.dataType === 'SELECT' ? queryItem.sourceCode : null,
          conditionFieldLovCode: null,
          conditionFieldName: null,
          conditionFieldTextfield: null,
          conditionFieldNewline: 'N',
          conditionFieldSelectUrl: null,
          conditionFieldSelectVf: null,
          conditionFieldSelectTf: null,
          conditionFieldSequence: 1,
          gridFieldSequence: 1,
        };
        lovItems.push(lovItem);
      });
      tableFields.forEach((tableItem) => {
        const lovItem = {
          lovId: viewCode,
          lovItemId: `table_${tableItem.dataIndex}`,
          gridFieldName: tableItem.dataIndex,
          gridFieldWidth: tableItem.width,
          gridFieldAlign: 'left',
          autocompleteField: 'Y',
          conditionField: 'N',
          isAutocomplete: 'N',
          gridField: 'Y',
          display: tableItem.title,
          conditionFieldWidth: null,
          conditionFieldLabelWidth: null,
          conditionFieldType: null,
          conditionFieldSelectCode: null,
          conditionFieldName: null,
          conditionFieldTextfield: null,
          conditionFieldNewline: 'N',
          conditionFieldSelectUrl: null,
          conditionFieldSelectVf: null,
          conditionFieldSelectTf: null,
          conditionFieldLovCode: null,
          conditionFieldSequence: 1,
          gridFieldSequence: 1,
        };
        lovItems.push(lovItem);
        tableWidth += tableItem.width;
      });

      let queryColumns = 0;
      if (queryFields.length) {
        if (queryFields.length <= 2) {
          queryColumns = queryFields.length;
        } else {
          queryColumns = 2;
        }
      }

      return {
        originData: {
          lovCode: code,
          ...originData,
        },
        code: viewCode,
        title,
        description: title,
        lovId: viewCode,
        // placeholder: title,
        sqlId: viewCode,
        customSql: null,
        queryColumns,
        customUrl: null,
        textField: displayField,
        valueField,
        delayLoad: 'N',
        needQueryParam: 'N',
        editableFlag: 'Y',
        canPopup: 'Y',
        lovPageSize: pageSize,
        treeFlag: childrenFieldName ? 'Y' : 'N',
        idField: idField || valueField,
        parentIdField: childrenFieldName,
        lovItems,
        width: tableWidth ? tableWidth + 300 : 700,
        height: null,
        tableProps: {
          //  暂时注释配置
          // async: !!childrenFieldName
          style: {
            maxHeight: 'calc(100vh - 320px)',
          },
        },
        dataSetProps: {
          paging: !childrenFieldName,
          pageSize: 20,
        },
      };
    },
  ],
});

const lovQueryAxiosConfig = (code, lovConfig = {}, props) => {
  const { queryUrl, lovCode } = lovConfig.originData || {};
  const { data } = props || {};
  let url = `${apiGateway}${HZERO_PLATFORM}/v1/${
    isTenantRoleLevel() ? `${getOrganizationId() || 0}/` : ''
  }lovs/data?lovCode=${lovCode}`;
  if (queryUrl) {
    // 解决特殊值集lovCode和查询条件同key问题
    const HPFM_LOV_DETAIL_CODE = 'HPFM.LOV.LOV_DETAIL';
    const HPFM_LOV_VIEW_CODE = 'HPFM.LOV.VIEW';
    url =
      lovCode.includes(HPFM_LOV_DETAIL_CODE) || lovCode.includes(HPFM_LOV_VIEW_CODE)
        ? queryUrl
        : generateUrlWithGetParam(queryUrl, { lovCode });
    const organizationRe = /{organizationId}|{tenantId}/g;
    if (organizationRe.test(url)) {
      const tId = getCurrentOrganizationId();
      url = url.replace(organizationRe, tId);
    }
    if (!isEmpty(data)) {
      Object.keys(data).forEach((key) => {
        const lovParamsRe = new RegExp('\\{'.concat(key, '\\}'), 'g');
        if (lovParamsRe.test(url)) {
          const val = data[key];
          url = url.replace(lovParamsRe, val);
        }
      });
    }
    // url = `${url}${url.indexOf('?') ? '&' : '?'}lovCode=${lovCode}`;
  }
  return {
    url,
    method: 'GET',
  };
};

// TODO: 批量查询lookupCode只支持独立值集，对于sql值集等的如何处理？？
// const lookupBatchAxiosConfig = codes => {
//   const url = `${apiGateway}${HZERO_PLATFORM}/v1/${
//     isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
//   }lovs/value/batch`;
//   return {
//     url,
//     method: 'GET',
//     params: codes.reduce((obj, code) => {
//       // eslint-disable-next-line
//       obj[code] = code;
//       return obj;
//     }, {}),
//   };
// };

const generatePageQuery = ({
  page,
  pageSize,
  sortName,
  sortOrder,
  count,
  defaultCount,
  totalCount,
  onlyCount,
}) => ({
  page: page === undefined ? page : page - 1,
  size: pageSize,
  sort: sortName && (sortOrder ? `${sortName},${sortOrder}` : sortName),
  asyncCountFlag:
    onlyCount === 'Y'
      ? undefined
      : count === 'N'
      ? 'Y'
      : count === 'Y'
      ? 'N'
      : defaultCount === 'N'
      ? 'DEFAULT'
      : undefined,
  oldTotalElements: totalCount,
  onlyCountFlag: onlyCount,
});

const lovQueryCachedSelected = (code, recordMap) => {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-customize/translateLov?lovViewCode=${code}`,
    {
      body: JSON.stringify([...recordMap.keys()]),
      method: 'POST',
    }
  ).then((res) => {
    return Object.keys(res).reduce((list, key) => {
      const value = res[key];
      if (!isString(value)) {
        list.push(value);
      }
      return list;
    }, []);
  });
};
const AdvancedQueryBarMore = ({
  queryFields,
  queryFieldsLimit = 1,
  buttons,
  dataSet,
  queryDataSet,
}) => {
  let modal;
  const queryListNum = queryFieldsLimit >= 2 ? 2 : queryFieldsLimit;
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      await dataSet.query();
      if (modal) {
        modal.close();
      }
    }
  };
  const topActionNode =
    buttons && buttons.length > 0 && buttons.filter((b) => b.key === 'advanced-query-slot');
  const actionButtons =
    buttons && buttons.length > 0 && buttons.filter((b) => b.key !== 'advanced-query-slot');
  const showAllQuery = () => {
    modal = Modal.open({
      title: intl.get('hzero.c7nProUI.Table.advanced_query_conditions').d('高级查询条件'),
      children: <Form labelLayout="float">{queryFields}</Form>,
      okText: intl.get('hzero.common.status.search').d('查询'),
      onOk: query,
      className: 'c7n-advanced-query-conditions-modal',
      style: {
        width: '3.8rem',
      },
      drawer: true,
    });
  };
  const queryBar = (
    <div className="c7n-customer-advanced-query-bar">
      {actionButtons.length > 0 && topActionNode}
      {queryDataSet ? (
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              display: 'flex',
              marginBottom: '10px',
              alignItems: 'flex-end',
              width: '60%',
            }}
          >
            {actionButtons && actionButtons.length ? (
              <div style={{ marginBottom: 4 }}>{actionButtons}</div>
            ) : (
              <div style={{ marginBottom: 4 }}>{topActionNode}</div>
            )}
          </div>
          <div
            style={{
              width: '40%',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Form
              style={{ flex: 'auto' }}
              columns={queryListNum}
              labelLayout="float"
              dataSet={queryDataSet}
              onKeyDown={(e) => {
                if (e.keyCode === 13) return query();
              }}
            >
              {queryFields.slice(0, queryListNum)}
            </Form>
            {queryFields.length > queryListNum && (
              <div
                style={{
                  marginTop: '10px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 16,
                }}
              >
                <Button
                  onClick={() => {
                    queryDataSet.current.reset();
                    dataSet.fireEvent('queryBarReset', {
                      dataSet,
                      queryFields,
                    });
                  }}
                >
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button dataSet={null} color="primary" onClick={showAllQuery}>
                  {intl.get('hzero.c7nProU.Table.advanced_query').d('查询更多')}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
  const getFilterSelect = () => {
    return (
      <FilterSelect
        key="filter"
        prefixCls="c7n-pro-table-filter-select"
        className="c7n-pro-table-advanced-query-bar-options"
        optionDataSet={dataSet}
        queryDataSet={queryDataSet}
        prefix={`${$l('Table', 'advanced_query_conditions')}:`}
        editable={false}
        filter={(value) =>
          queryFields.slice(0, queryListNum).every((element) => element.props.name !== value)
        }
        hiddenIfNone
      />
    );
  };
  return [queryBar, getFilterSelect()];
};

const QueryBarMore = ({
  queryFields: propsQueryFields,
  buttons,
  // queryFieldsLimit = 3,
  dataSet,
  queryDataSet,
  defaultShowMore,
  onBeforeQuery,
}) => {
  const queryFieldsLimit = propsQueryFields?.length >= 3 ? 3 : 2;
  const [hidden, setHidden] = useState(!defaultShowMore);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  const query = debounce(async () => {
    if (await dataSet.validate(false, false)) {
      if (onBeforeQuery) {
        onBeforeQuery({ dataSet });
      }
      await dataSet.query();
    }
  }, 100);
  const queryFields = propsQueryFields.map((p) => ({
    ...p,
    props: {
      ...p.props,
      onBlur: query,
    },
  }));
  return (
    <div>
      {queryDataSet ? (
        <div className="mall-c7n-pro-lov-header-form">
          <Form
            labelLayout="float"
            style={{ flex: 'auto' }}
            columns={queryFieldsLimit}
            dataSet={queryDataSet}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return query();
            }}
          >
            {hidden ? queryFields.slice(0, queryFieldsLimit) : queryFields}
          </Form>
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => {
                queryDataSet.current.reset();
                dataSet.fireEvent('queryBarReset', {
                  dataSet,
                  queryFields,
                });
                query();
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            {queryFields.length > queryFieldsLimit && (
              <Button onClick={handleToggle}>
                {hidden
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            )}
            {/* <Button dataSet={null} color="primary" onClick={query}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button> */}
          </div>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
};

const renderQueryBar = (props) => {
  const { buttons } = props;
  if (buttons) {
    if (buttons.findIndex((b) => b.key === 'advanced-query-slot') !== -1) {
      return <AdvancedQueryBarMore {...props} />;
    }
    // if (buttons.findIndex((b) => b.key === 'filter-bar') !== -1) {
    //   return <FilterBar className='c7n-pro-lov-table-query-bar' {...props} />;
    // }
  }
  return <QueryBarMore {...props} />;
};

configure({
  lookupUrl: (code) =>
    `${apiGateway}${HZERO_PLATFORM}/v1/${
      isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
    }lovs/data?lovCode=${code}`,
  modalMovable: false,
  ripple: false,
  useColon: true,
  tableBorder: false,
  tableColumnEditorBorder: true,
  tableHighLightRow: 'focus',
  tableCommandProps: { funcType: 'link', color: 'primary' },
  tableRowHeight: 28,
  tooltip: (target) => (target === 'output' ? undefined : 'overflow'),
  tooltipTheme: (target) => (target === 'table-cell' || target === 'validation' ? 'light' : 'dark'),
  tableColumnDraggable: true,
  tableColumnTitleEditable: true,
  tableHeightChangeable: false,
  tableColumnAlign(_column, field) {
    if (field) {
      switch (field.type) {
        case 'number':
        case 'currency':
          return 'right';
        default:
      }
    }
  },
  tableCustomizable: true,
  tableShowSelectionTips: true,
  tableVirtualCell: true,
  highlightRenderer: ({ ...props }, element) => (
    <DocumentWizardPopover {...props}>{element}</DocumentWizardPopover>
  ),
  dropdownMatchSelectWidth: false,
  showRequiredColorsOnlyEmpty: true,
  attachment: attachmentConfig,
  renderEmpty(componentName) {
    switch (componentName) {
      case 'Attachment':
        return (
          <div
            style={{
              padding: '30px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={require('@/assets/images/illustrator_none.svg')}
              alt="empty"
              style={{ marginBottom: 10 }}
            />
            {$l('Attachment', 'no_attachments')}
          </div>
        );
      case 'Table':
        return $l('Table', 'empty_data');
      case 'Select':
        return $l('Select', 'no_matching_results');
      case 'Output':
        return '-';
      default:
    }
  },
  async tableCustomizedLoad(customizedCode) {
    const tenantId = getCurrentOrganizationId();
    const userId = getCurrentUserId();
    const code = `table.customized.${customizedCode}`;
    const localCode = `${code}.${tenantId}.${userId}`;
    const serializedCustomized = localStorage.getItem(localCode);
    if (serializedCustomized) {
      try {
        const customized = JSON.parse(serializedCustomized);
        if (tenantId === 0 || Date.now() - customized.lastUpdateTime < 60 * 60000) {
          return customized;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (tenantId !== 0) {
      try {
        const { dataJson } = await request(`/spfm/v1/${tenantId}/personal-tables`, {
          method: 'GET',
          query: {
            code,
            tenantId,
            userId,
          },
        });
        const remoteCustomized = {
          ...(dataJson ? JSON.parse(dataJson) : {}),
          lastUpdateTime: Date.now(),
        };
        const newSerializedCustomized = JSON.stringify(remoteCustomized);
        localStorage.setItem(localCode, newSerializedCustomized);
        return remoteCustomized;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      columns: {},
    };
  },
  tableCustomizedSave(customizedCode, customized) {
    const code = `table.customized.${customizedCode}`;
    const tenantId = getCurrentOrganizationId();
    const userId = getCurrentUserId();
    const localCode = `${code}.${tenantId}.${userId}`;
    const serializedCustomized = JSON.stringify({
      ...customized,
      lastUpdateTime: Date.now(),
    });
    localStorage.setItem(localCode, serializedCustomized);
    if (tenantId !== 0) {
      request(`/spfm/v1/${tenantId}/personal-tables`, {
        method: 'POST',
        body: JSON.stringify({
          code,
          tenantId,
          userId,
          dataJson: serializedCustomized,
        }),
      });
    }
  },
  drawerOkFirst: true,
  lovTableProps: {
    className: 'c7n-pro-lov-table',
    // buttons: [<div key="filter-bar" />],
  },
  lovModalProps: {
    // movable: false,
    className: 'c7n-pro-lov-modal',
    okFirst: false,
    drawer: true,
    footer: (okBtn, cancelBtn) => (
      <>
        {okBtn}
        {cancelBtn}
      </>
    ),
    okProps: {
      // funcType: 'flat',
    },
    cancelProps: {
      // funcType: 'flat',
    },
    bodyStyle: {
      minHeight: 'auto',
    },
  },
  pagination: {
    showSizeChangerLabel: true,
    showPager: true,
    pageSizeOptions: ['10', '20', '30'],
  },
  modalOkFirst: false,
  lovNoCache: true,
  lovDefineAxiosConfig,
  lovQueryAxiosConfig,
  lovQueryCachedSelected,
  // lookupBatchAxiosConfig,
  autoCount: false,
  lookupAxiosMethod: 'GET',
  dataKey: 'content',
  // tableSelectedHighLightRow: true,
  totalKey: 'totalElements',
  axios: withTokenAxios,
  generatePageQuery,
  formatter: {
    timeZone: () => <span className="c7n-time-zone"> ({getCurrentUser().timeZone})</span>,
  },
  status: {
    add: 'create',
    update: 'update',
    delete: 'delete',
  },
  // iconfontPrefix: 'c7n',
  statusKey: '_status',
  tlsKey: '_tls',
  // queryBar: props => <QueryBarMore {...props} />,
  // eslint-disable-next-line
  queryBar: renderQueryBar,
  lovQueryBar: renderQueryBar,
  feedback: {
    loadSuccess: () => {},
    loadFailed: (resp) => {
      if (resp && resp.failed) {
        Swal(resp && resp.message);
      } else if (resp && resp.response) {
        Swal(intl.get(`hzero.common.requestNotification.${resp.response.status}`) || resp.message);
      }
    },
    submitSuccess: () => {
      // Swal(resp && resp.message);
    },
    submitFailed: (resp) => {
      if (resp && resp.failed) {
        Swal(resp && resp.message);
      } else if (resp && resp.response) {
        Swal(intl.get(`hzero.common.requestNotification.${resp.response.status}`) || resp.message);
      }
    },
  },
  transport: {
    tls: ({ dataSet, name: fieldName }) => {
      // TODO: 先使用 dataSet.current 下个版本 c7n 会 把 record 传进来
      const _token = dataSet.current.get('_token');
      return {
        url: `${HZERO_PLATFORM}/v1/multi-language`,
        method: 'GET',
        params: { _token, fieldName },
        transformResponse: (data) => {
          try {
            const jsonData = JSON.parse(data);
            if (jsonData && !jsonData.faied) {
              const tlsRecord = {};
              jsonData.forEach((intlRecord) => {
                tlsRecord[intlRecord.code] = intlRecord.value;
              });
              return [{ [fieldName]: tlsRecord }];
            }
          } catch (e) {
            // do nothing, use default error deal
          }
          return data;
        },
      };
    },
  },
});

export { withTokenAxios as axios, lovDefineAxiosConfig, lovQueryAxiosConfig };
