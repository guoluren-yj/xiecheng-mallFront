import { useEffect } from 'react';
import { isEmpty } from 'lodash';
import { configure } from 'choerodon-ui';
import RangersSiteSDK from '@apm-insight-web/rangers-site-sdk';
import qs from 'querystring';
import { getCurrentUser, getAccessToken } from 'utils/utils';

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestError';
  }
}

class UIError extends Error {
  constructor(stack) {
    super(stack);
    this.name = 'UIError';
  }
}

const eventContext = new Map();

let started = false;
let oldMenus;
let oldEnvMenus;
let inited = false;

function start() {
  if (inited) {
    if (!started) {
      started = true;
      window.collectEvent('start');
    } else {
      window.collectEvent('predefinePageView');
      window.collectEvent('resetStayDuration');
    }
  }
}

function RangersConfig(params) {
  const { pathname, envName, dataRangersAppId, menuInfo, evtParamsMenuInfo } = params;
  eventContext.clear();
  const { tenantNum, tenantName } = getCurrentUser();
  const {
    loginName,
    realName,
    currentRoleName,
    language,
    additionInfo: { organizationName, organizationNum },
  } = getCurrentUser();
  // eslint-disable-next-line camelcase
  const user_unique_id = `${loginName}-${realName}`;
  const tenant = `${tenantNum}-${tenantName}`;
  const userTenant = organizationName ? `${organizationNum}-${organizationName}` : 'unknown';
  const context = {
    环境名称: envName,
    租户信息: tenant,
    子账户所属租户: userTenant,
    页面路由: pathname,
    ...menuInfo,
  };
  const apmInsightConfig = {
    app_id: dataRangersAppId,
    user_unique_id,
    pid: `mall-front${window.location.pathname}`, // 页面标识
    context,
  };
  const evtParams = {
    role_tenant: userTenant,
    role: currentRoleName,
    language,
    environment_name: envName,
    tenant_information: tenant,
    ...menuInfo,
  };
  const dataFinderConfig = {
    user_unique_id,
    evtParams,
    ...menuInfo,
  };
  eventContext.set('route', pathname);
  const menuKeys = Object.keys(menuInfo);
  const envMenuKeys = Object.keys(evtParamsMenuInfo);
  Object.assign(context, menuInfo);
  Object.assign(evtParams, evtParamsMenuInfo);
  if (oldMenus) {
    oldMenus.forEach((key) => {
      if (!(key in menuInfo)) {
        context[key] = '';
      }
    });
  }
  if (oldEnvMenus) {
    oldEnvMenus.forEach((key) => {
      if (!(key in evtParamsMenuInfo)) {
        evtParams[key] = undefined;
      }
    });
  }
  RangersSiteSDK('config', apmInsightConfig);
  window.collectEvent('config', dataFinderConfig);
  start();
  oldMenus = menuKeys;
  oldEnvMenus = envMenuKeys;
}

function c7nConfig() {
  configure({
    performanceEnabled: { Table: true },
    onPerformance(type, event) {
      switch (type) {
        case 'Table': {
          const { timing, url, size, name } = event;
          const renderTime = timing.renderEnd - timing.renderStart;
          const fetchTime = timing.fetchEnd - timing.fetchStart;
          const loadTime = timing.loadEnd - timing.loadStart;
          RangersSiteSDK('emit', 'custom', {
            event_name: 'table_render',
            metrics: { renderTime, fetchTime, loadTime, size },
            tags: {
              url,
              code: name,
            },
          });
          break;
        }
        default:
      }
    },
    onButtonClick({ title, icon }) {
      const eventProps = Object.fromEntries(eventContext);
      delete eventProps.route;
      eventProps.btnName = title || `icon[type=${icon}]`;
      window.collectEvent('button_active', eventProps);
    },
  });
}

export default function init() {
  const appId = null;
  if (appId && !isNaN(+appId) && appId !== '0') {
    inited = true;
    RangersSiteSDK('config', {
      app_id: appId,
      ignoreAjax: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
    });
    // DataRangers的 datatransfer 初始化
    window.collectEvent('init', {
      app_id: Number(appId), //  必须替换成申请的 app_id
      channel: 'cn', // 数据发送地址，默认国内
      log: true, // 开启调试日志
      enable_ab_test: true, // boolean类型，是否开启A/B实验功能
      autotrack: false, // 开启全埋点采集，默认关闭，需要热力图及圈选功能可开启
    });
    c7nConfig();
  }
}

export function useRangersData({ userInfo, routerData }) {
  useEffect(() => {
    if (!isEmpty(userInfo)) {
      init();
    }
  }, [userInfo]);

  useEffect(() => {
    const { tenantNum } = userInfo;
    const appId = null;
    const envName = process.env.MALLENV_NAME;
    if (appId && tenantNum && !isNaN(+appId)) {
      const pageName = `商城-${
        routerData?.[window.location.pathname]?.title || window.location.pathname
      }`;
      const menuInfo = {
        '1级菜单': process.env.MALLENV_NAME,
        '2级菜单': pageName,
        menu_path_level1: process.env.MALLENV_NAME,
        menu_path_level2: pageName,
        bearer: Math.floor(Math.random() * 10) + getAccessToken() + Math.floor(Math.random() * 10),
        version: window.mallVersion,
      };
      const evtParamsMenuInfo = {
        ...menuInfo,
        menu_path_level1: process.env.MALLENV_NAME,
        menu_path_level2: pageName,
        menu_name: pageName,
      };
      if (window.collectEvent) {
        RangersConfig({
          pathname: window.location.pathname,
          dataRangersAppId: appId,
          envName,
          menuInfo,
          evtParamsMenuInfo,
        });
        window.collectEvent('OpenPage', {
          页面名称: pageName,
        });
      }
    }
  }, [window.location.pathname, routerData, process.env]);
}

export function processRequestError({
  url,
  status,
  responseBody,
  method,
  requestBody,
  requestQuery,
}) {
  if (
    status === 200 &&
    responseBody &&
    responseBody.failed &&
    responseBody.type &&
    String(responseBody.type).toLowerCase() === 'error'
  ) {
    setTimeout(() => {
      const message = JSON.stringify({
        URL: url,
        METHOD: method,
        BODY: JSON.stringify(responseBody),
        REQUEST_BODY: requestBody ? JSON.stringify(requestBody) : null,
        REQUEST_QUERY: requestQuery ? qs.stringify(requestQuery) : null,
      });

      if (
        [
          'error.error',
          'error.db.column_violation',
          'error.db.locktimeout',
          'error.db.timeout',
        ].includes(responseBody.code)
      ) {
        throw new URIError(message);
      } else {
        throw new RequestError(message);
      }
    }, 0);
  }
}

export function processUIError(error) {
  setTimeout(() => {
    throw new UIError(error.stack?.replace('TypeError: ', ''));
  }, 0);
}
