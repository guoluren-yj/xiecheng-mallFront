import React from 'react';
import { connect } from 'dva';
import dynamicImport from 'utils/dynamicImport';

function Layout(props) {
  const DefaultLayout = dynamicImport(
    () => import(/* webpackChunkName: "layout" */ 'mall-front/lib/layout'),
    ['user']
  );
  const IntegralLayout = dynamicImport(
    () => import(/* webpackChunkName: "sigl-layout" */ 'mall-front-integral/lib/layout'),
    ['user']
  );
  switch (props.mallType) {
    case 'sigl': // 积分商城
      return <IntegralLayout {...props} />;
    default:
      // 标准商城
      return <DefaultLayout {...props} />;
  }
}

export default connect(({ global }) => ({ mallType: global.mallType }))(Layout);
