import { getRouterData as fn } from 'utils/router.js';
import defaultRouters from 'mall-front/lib/config/routers';
import currentRouters from '../config/routers';

export function getRouterData(params) {
  return fn({ ...params, defaultRouters: [...currentRouters, ...defaultRouters] });
}
