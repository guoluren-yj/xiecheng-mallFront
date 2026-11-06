import React from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import Footer from 'mall-front/lib/layout/Footer';
import Lay from 'mall-front/lib/layout/Lay';
import Header from './Header';

function Layout(props) {
  return <>{!isEmpty(props.userInfo) && <Lay {...props} Footer={Footer} Header={Header} />}</>;
}

export default connect(({ global }) => ({
  userInfo: global.userInfo,
  settings: global.settings,
  language: global.language,
  webConfig: global.webConfig,
  footerPaddingBottom: global.constants.footerPaddingBottom,
  mallType: global.mallType,
}))(Layout);
