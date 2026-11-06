import { createElement } from 'react';
import { uniqBy } from 'lodash';
import dynamic from 'dva/dynamic';

import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

export function getRouter({ defaultRouters, cuxRouters }) {
  return uniqBy([...cuxRouters, ...defaultRouters], 'path');
}

export const dynamicWrapper = (app, models, component) =>
  dynamic({
    app,
    models: () =>
      models.filter((model) => modelNotExisted(app, model)).map((m) => import(`../models/${m}.js`)),
    // add routerData prop
    component: () =>
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      }),
  });

export default function dynamicImport(promise, models = []) {
  return dynamicWrapper(getDvaApp(), models, promise);
}
