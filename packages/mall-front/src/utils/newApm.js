import raf from 'raf';
import qs from 'querystring';
import { getCurrentUser } from 'utils/utils';

// const { DATA_RANGERS_APP_ID: dataRangersAppId, MALLENV_NAME: envName } = window.$$env;
const publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCinoSln7a6Plw90igdsJAATEsWNpjLkzWuUBnOe7WxW4fTXPJDGmwPE9znBz8j/xnG0nkXo1+drCeuRDpBt3LFQd9MhTVsk+gVWvNSxtRSzHGU/C2I9Sll/Cy8tVFCUWicQzKA3MjoMstJqEcwadEuxQCAbjWEJ3ooLcwzfFxRQQIDAQAB';
const { collectBrowserEvent } = window;

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestError';
  }
}

class UIError extends Error {
  constructor(message, stack) {
    super(message);
    this.name = 'UIError';
    this.stack = stack;
  }
}

let inited = false;
let started = false;
let paused = false;
let rafId;
let oldMenuInfo;
let getMenus;

const apm = [];
window.$$apm = apm;

function onPageView(pathname) {
  if (rafId) {
    raf.cancel(rafId);
    rafId = null;
  }
  if (getMenus) {
    const { routerData } = getMenus();
    const path = routerData?.[pathname]?.path;
    if (!path) {
      if (!paused) {
        paused = true;
        collectBrowserEvent('pause');
      }
      rafId = raf(() => {
        onPageView(pathname);
      });
    }
    if (path) {
      const context = {};
      const menuInfo = {
        pathname,
        path,
      };
      if (pathname === '/workplace') {
        menuInfo.menu = '工作台';
        menuInfo.page = '工作台';
      } else {
        const mallEnvName = process.env.MALLENV_NAME;
        const pageName = `商城-${routerData?.[pathname]?.title || pathname}`;
        menuInfo.page = path;
        menuInfo.menu = `${mallEnvName}>${pageName}`;
      }
      if (oldMenuInfo) {
        if (oldMenuInfo.page !== menuInfo.page && menuInfo.menu !== oldMenuInfo.menu) {
          menuInfo.forwardPage = oldMenuInfo.page;
          menuInfo.forwardMenu = oldMenuInfo.menu;
        } else {
          menuInfo.forwardPage = oldMenuInfo.forwardPage;
          menuInfo.forwardMenu = oldMenuInfo.forwardMenu;
        }
      }
      Object.assign(context, menuInfo);
      collectBrowserEvent('context.clear');
      collectBrowserEvent('context.merge', context);
      if (inited && !started) {
        started = true;
        const {
          loginName,
          realName,
          id,
          tenantNum,
          // currentRoleName,
          // language,
          // additionInfo: { organizationName, organizationNum },
        } = getCurrentUser();
        // const userTenant = organizationName ? `${organizationNum}-${organizationName}` : 'unknown';
        const userUniqueId = loginName && realName ? `${loginName}-${realName}` : 'unknown';
        const newApmConfig = {
          // aid: dataRangersAppId,
          userId: id,
          user: userUniqueId,
          // env: envName,
          tenant: tenantNum,
          publicKey,
        };
        collectBrowserEvent('config', newApmConfig);
        collectBrowserEvent('start');
      } else if (paused) {
        paused = false;
        collectBrowserEvent('start');
      }
      oldMenuInfo = menuInfo;
    }
  }
}

export default function init() {
  if (collectBrowserEvent) {
    inited = true;
    collectBrowserEvent('init', {
      // aid: dataRangersAppId,
      senderSize: 100,
      plugins: {
        ignoreUrls: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
        breadcrumb: false,
        fmp: false,
        tti: false,
        pageview: {
          onPidUpdate(pathname) {
            onPageView(pathname);
          },
        },
        performance: {
          fp: false,
          fcp: false,
          fid: false,
          cls: false,
          mpfid: false,
          timing: false,
          longtask: false,
        },
      },
      fetch: {
        ignoreUrls: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
      },
      // integrations: [
      // SPALoadPlugin(),
      // actionPlugin({ types: ['click'] })
      // ],
    });

    const reportedSpa = new Set();

    collectBrowserEvent('on', 'report', (event) => {
      if (event && event.eventType === 'performance') {
        const path = event.extra?.context?.path;
        if (path) {
          if (reportedSpa.has(path)) {
            return;
          } else {
            reportedSpa.add(path);
          }
        }
        // if (envName === '商城主站DEV' || window.$$apmDebug === true) {
        //   apm.push(event);
        // }
      }
      return event;
    });
    // configure({
    //   performanceEnabled: { Table: true },
    //   onPerformance(type, event) {
    //     switch (type) {
    //       case 'Table': {
    //         const { timing, url, size, name } = event;
    //         const renderTime = timing.renderEnd - timing.renderStart;
    //         const fetchTime = timing.fetchEnd - timing.fetchStart;
    //         const loadTime = timing.loadEnd - timing.loadStart;
    //         RangersSiteSDK('emit', 'custom', {
    //           event_name: 'table_render',
    //           metrics: { renderTime, fetchTime, loadTime, size },
    //           tags: {
    //             url,
    //             code: name,
    //           },
    //         });
    //         // 新apm测试版 only dev
    //         browserClient('sendEvent', {
    //           name: 'table_render',
    //           metrics: { renderTime, fetchTime, loadTime, size },
    //           categories: {
    //             url,
    //             code: name,
    //           },
    //         });
    //         break;
    //       }
    //       default:
    //     }
    //   },
    //   // onTabsChange({ title, groupTitle }) {
    //   //   const tabName = groupTitle ? `${groupTitle}-${title}` : title;
    //   //   eventContext.set('tab_name', tabName);
    //   //   const pathname = eventContext.get('route');
    //   //   if (pathname) {
    //   //     tabsMap.set(pathname, tabName);
    //   //   }
    //   //   reportTab();
    //   // },
    //   onButtonClick({ title, icon }) {
    //     const eventProps = Object.fromEntries(eventContext);
    //     delete eventProps.route;
    //     eventProps.btnName = title || `icon[type=${icon}]`;
    //     window.collectEvent('button_active', eventProps);
    //   },
    // });
  }
}

export function config(getConfig) {
  if (inited && collectBrowserEvent) {
    getMenus = getConfig;
    const { pathname } = getMenus();
    if ((pathname || pathname === '/') && !started) {
      onPageView(pathname);
    }
  }
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
    throw new UIError(error.message, error.stack);
  }, 0);
}
