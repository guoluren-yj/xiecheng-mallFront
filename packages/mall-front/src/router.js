import 'intersection-observer';
import React, { useEffect } from 'react';
import { routerRedux, Switch, Route } from 'dva/router';

import { getRouterError } from 'utils/utils';
import PermissionButtonProvider from 'components/Permission/PermissionProvider';
import { initIoc } from 'hzero-front/lib/utils/iocUtils';
import LocalProviderAsync from 'utils/intl/LocaleProviderAsync';
import PermissionProvider from 'components/PermissionProvider';
import dynamicImport from 'utils/dynamicImport';
import ErrorBoundary from 'components/ErrorBoundary';
// import { processUIError } from 'hooks/useRangersData';
import { processUIError } from 'utils/newApm';
import '@/typings/global.d.ts';
import './index.less';
import './initScuz';

const { ConnectedRouter } = routerRedux;

// 初始化ioc容器
initIoc();

const DefaultLayout = dynamicImport(() => import('@/layout'), ['user']);

export default function App({ history, ConvertLayout }) {
  const Layout = ConvertLayout || DefaultLayout;

  useEffect(() => {
    const errRouterFlag = getRouterError();
    if (errRouterFlag) {
      window.location.href = '/';
    }
  }, [window.location]);

  function handleError(error) {
    processUIError(error);
  }

  return (
    <ErrorBoundary onError={handleError}>
      <PermissionProvider>
        <PermissionButtonProvider>
          <LocalProviderAsync>
            <ConnectedRouter history={history}>
              <Switch>
                <Route path="/pub" render={(props) => <Layout {...{ ...props, pub: true }} />} />
                <Route path="/" render={(props) => <Layout {...props} />} />
              </Switch>
            </ConnectedRouter>
          </LocalProviderAsync>
        </PermissionButtonProvider>
      </PermissionProvider>
    </ErrorBoundary>
  );
}
