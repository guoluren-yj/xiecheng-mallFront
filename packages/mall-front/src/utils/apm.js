import RangersSiteSDK from '@apm-insight-web/rangers-site-sdk';
import { configure } from 'choerodon-ui';
import { getCurrentTenant, getCurrentUser } from 'utils/utils';

const dataRangersAppId = null;
const envName = process.env.ENV_NAME;

const eventContext = new Map();
const tabsMap = new Map();

function findMenuPath(menus, pathname, paths = []) {
  const found = menus.find((menu) => {
    const { path, children } = menu;
    if (children && children.length) {
      paths.push(menu);
      const ret = findMenuPath(children, pathname, paths);
      if (ret.length) {
        return true;
      } else {
        paths.pop();
      }
    } else if (pathname.startsWith(path)) {
      paths.push(menu);
      return true;
    }
    return false;
  });
  if (found) {
    return paths;
  }
  return [];
}

function reportTab() {
  const eventProps = Object.fromEntries(eventContext);
  delete eventProps.route;
  window.collectEvent('workPlt_pageview', eventProps);
}

export default function init() {
  if (dataRangersAppId) {
    RangersSiteSDK('config', {
      app_id: dataRangersAppId,
      ignoreAjax: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
    });
    // DataRangers的 datatransfer 初始化
    window.collectEvent('init', {
      app_id: Number(dataRangersAppId), //  必须替换成申请的 app_id
      channel: 'cn', // 数据发送地址，默认国内
      log: true, // 开启调试日志
      enable_ab_test: true, // boolean类型，是否开启A/B实验功能
      autotrack: false, // 开启全埋点采集，默认关闭，需要热力图及圈选功能可开启
    });
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
      onTabsChange({ title, groupTitle }) {
        const tabName = groupTitle ? `${groupTitle}-${title}` : title;
        eventContext.set('tab_name', tabName);
        const pathname = eventContext.get('route');
        if (pathname) {
          tabsMap.set(pathname, tabName);
        }
        reportTab();
      },
      onButtonClick({ title, icon }) {
        const eventProps = Object.fromEntries(eventContext);
        delete eventProps.route;
        eventProps.btnName = title || `icon[type=${icon}]`;
        window.collectEvent('button_active', eventProps);
      },
    });
  }
}
let started = false;
let oldMenus;
let oldEnvMenus;

function start() {
  if (!started) {
    started = true;
    window.collectEvent('start');
  } else {
    window.collectEvent('predefinePageView');
    window.collectEvent('resetStayDuration');
  }
}

export function config(getConfig) {
  if (dataRangersAppId) {
    const { menus, pathname } = getConfig();
    if (menus && menus.length) {
      eventContext.clear();
      const { tenantNum, tenantName } = getCurrentTenant();
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
      };
      const apmInsightConfig = {
        app_id: dataRangersAppId,
        user_unique_id,
        context,
      };
      const evtParams = {
        role_tenant: userTenant,
        role: currentRoleName,
        language,
        environment_name: envName,
        tenant_information: tenant,
      };
      const dataFinderConfig = {
        user_unique_id,
        evtParams,
      };
      eventContext.set('route', pathname);
      const tabName = tabsMap.get(pathname);
      if (tabName) {
        eventContext.set('tab_name', tabName);
        reportTab();
      }
      const menuInfo = {};
      const evtParamsMenuInfo = {};
      if (pathname === '/workplace') {
        menuInfo['1级菜单'] = '工作台';
        evtParamsMenuInfo.menu_path_level1 = '工作台';
        evtParamsMenuInfo.menu_name = '工作台';
      } else {
        const menuPath = findMenuPath(menus, pathname);
        const deep = menuPath.length;
        // 未找到菜单
        if (!deep) {
          return;
        }
        menuPath.forEach((menu, index) => {
          const { menuItem, title } = menu;
          const { flex } = menuItem || {};
          const { defaultName } = flex || {};
          const menuName = defaultName || title;
          menuInfo[`${index + 1}级菜单`] = menuName;
          if (index === 0 || index === 1) {
            evtParamsMenuInfo[`menu_path_level${index + 1}`] = menuName;
          }
          if (index === deep - 1) {
            evtParamsMenuInfo.menu_name = menuName;
          }
        });
      }
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
  }
}
