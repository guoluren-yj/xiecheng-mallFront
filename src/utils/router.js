/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { getRouterData as fn } from 'utils/router.js';
import defaultRouters from 'mall-front/lib/config/routers';
import IntegralRouters from 'mall-front-integral/lib/config/routers'; // 积分商城
import routers from '../config/routers';

function getCuxData(params = {}) {
  const { tenantNum } = params;
  if (!tenantNum) return {};
  try {
    const cuxData = require(`../../packages/mall-front-cux-${tenantNum
      .replace('SRM-', '')
      .toLowerCase()}/lib/cux-config.js`).default;
    return cuxData || {};
  } catch (e) {
    return {};
  }
}

export function getRouterData(params) {
  return fn({
    ...params,
    defaultRouters: [...IntegralRouters, ...defaultRouters, ...routers],
    cuxConfig: getCuxData(params),
  });
}
