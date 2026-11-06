import { getRouterData as fn } from 'utils/router.js';
import defaultRouters from 'mall-front/lib/config/routers';
import siglRouters from 'mall-front-integral/lib/config/routers';
import currentRouters from '../config/routers';
import cuxConfig from '../cux-config';

export function getRouterData(params) {
  return fn({
    ...params,
    defaultRouters: [...currentRouters, ...defaultRouters, ...siglRouters],
    cuxConfig,
  });
}
