import { uniqBy } from 'lodash';

import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import { coverCuxSet as componentSet } from 'cuxTools/components';
import { coverCuxSet as functionSet } from 'cuxTools/functions';
import { coverCuxSet as customizeSet } from 'cuxTools/customizes';
import currentRouters from '../config/routers';

export function getRouter({ defaultRouters, cuxRouters }) {
  return uniqBy([...cuxRouters, ...defaultRouters], 'path');
}

export function getRouterData({ tenantNum, defaultRouters = currentRouters, cuxConfig = {} }) {
  const { components = {}, functions = {}, routers = [], customizes = {} } =
    cuxConfig[tenantNum] || {};
  componentSet(components);
  functionSet(functions);
  customizeSet(customizes);
  return getConvertRouter({
    hzeroRoutes: getRouter({ defaultRouters, cuxRouters: routers }),
    options: { app: window.dvaApp },
  })();
}
