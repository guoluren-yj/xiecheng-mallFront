import React, { useEffect } from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import Footer from '@/layout/Footer';
import Header from '@/layout/Header';
import Lay from '@/layout/Lay';
import CuxFn from '@/cuxTools/cuxFn';
// import { useRangersData } from '@/hooks/useRangersData';
import webSocketManager from 'Hutils/webSoket';
import { config } from 'utils/newApm';

function Layout(props) {
  const { routerData } = props;
  // useRangersData({ userInfo, routerData }); // 端侧监控
  useEffect(() => {
    CuxFn({ name: 'Layout-fn-init' })();
    webSocketManager.initWebSocket();
    // 数据漫游埋点接入配置
    config(() => {
      const {
        location: { pathname },
      } = props;
      return {
        pathname,
        routerData,
      };
    });
  }, []);

  return <>{!isEmpty(props.userInfo) && <Lay {...props} Footer={Footer} Header={Header} />}</>;
}

export default connect(({ global }) => ({
  isNewCart: global.isNewCart,
  routerData: global.routerData,
  userInfo: global.userInfo,
  settings: global.settings,
  language: global.language,
  webConfig: global.webConfig,
  footerPaddingBottom: global.constants.footerPaddingBottom,
  mallType: global.mallType,
}))(Layout);
