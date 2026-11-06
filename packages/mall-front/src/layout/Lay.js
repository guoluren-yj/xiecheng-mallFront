import React, { useEffect, useLayoutEffect } from 'react';
import { withRouter } from 'dva/router';
import qs from 'qs';

import { loadLocale } from '@/hooks/useIntl';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import WainringUserInfoModal from 'components/WainringUserInfoModal';
import changeTheme from 'utils/changeColor';
import HelpRobotChatProvider from './HelpRobot/chatProvider';
import HelpRobot from './HelpRobot';
import UseUserConfig from '@/hooks/useUserConfig';
import useGreyMode from '@/hooks/useGreyMode';
import useWaterMark from '@/hooks/useWaterMark';
import useAutoLogout from '@/hooks/useAutoLogout';
import '@/layout/styles/index.less';
import RouterList from './RouterList';
import PrivacyPolicies from './PrivacyPolicies';
import 'utils/c7nUIConfig';

function Layout(props) {
  const {
    dispatch,
    language,
    footerPaddingBottom,
    userInfo,
    settings,
    pub,
    Header,
    Footer,
    webConfig,
    mallType,
    isNewCart,
  } = props;
  const previewInfo = qs.parse(window.location.search.substr(1));
  useGreyMode({
    location: props.location,
    webConfig,
  });
  UseUserConfig({
    history: props.history,
    location: props.location,
    dispatch,
    language,
    userInfo,
    webConfig,
    mallType,
  });
  useWaterMark({
    container: document.querySelector('#gb-layout'),
  });
  const { location } = window;

  const {
    custWebConfig: { botShowConfig },
  } = getUserConfigInfo();
  const isShowRobot = (botShowConfig || 'SHOW') === 'SHOW';

  useLayoutEffect(() => {
    changeTheme({ dispatch, colorCode: webConfig.colorCode });
  }, [webConfig.colorCode]);

  useLayoutEffect(() => {
    document.title =
      webConfig.pageTitle || intl.get('mallf.common.view.web.title').d('企业商城采购');
  }, []);

  useEffect(() => {
    window.onresize = () => {
      const gbWidth = document.querySelector('.gb-wrapper')?.offsetWidth || '100%';
      const domHeader = document.querySelector('#header');
      const domCompare = document.querySelector('#mall-compare');
      if (domHeader) domHeader.style.width = `${gbWidth}px`;
      if (domCompare) domCompare.style.width = `${gbWidth}px`;
    };
  }, []);

  useEffect(() => {
    loadLocale(language);
  }, [location.pathname]);

  WainringUserInfoModal({ history: props.history, settings });

  useAutoLogout({
    duration: userInfo?.additionInfo?.autoLogoutDuration || 720,
  });

  const isHome = [
    '/',
    '/sigl',
    '/pub',
    '/sigl/product-detail',
    '/product-detail',
    '/cata-product-detail',
    '/new-product-detail',
    '/zone-product-detail',
    '/oms-sale-detail',
    '/sale-detail',
    '/product-accept-record',
    '/order-comment',
    '/pub/forbidden',
    '/exception',
    '/oms-sale-applicat',
    '/sigl/oms-sale-applicat',
  ].includes(location.pathname);

  return (
    <HelpRobotChatProvider>
      <div
        onDragOver={(event) => {
          event.preventDefault();
        }}
      >
        <div className="gb-wrapper">
          <div
            id="gb-layout"
            style={{
              position: 'relative',
              paddingBottom: footerPaddingBottom,
              overflow: 'hidden',
              minHeight: `${window.innerHeight}px`,
            }}
            className={`${!isHome ? 'body-bg-color' : 'home-bg-color'} `}
          >
            {!pub && <Header dispatch={dispatch} finish isNewCart={isNewCart} />}
            {/* 挂个空div，当header浮起来时加个paddingTop */}
            <div />
            <div
              style={{ minHeight: 420 }}
              className={`${!isHome ? 'body-bg-color' : 'home-bg-color'}`}
            >
              <RouterList />
            </div>
            {(!pub || previewInfo.showFooter) && <Footer />}
            <HelpRobot r-if={isShowRobot} />
          </div>
        </div>
        <PrivacyPolicies />
      </div>
    </HelpRobotChatProvider>
  );
}

export default withRouter(Layout);
