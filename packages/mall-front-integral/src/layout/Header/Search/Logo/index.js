/* eslint-disable global-require */
import React from 'react';
import { connect } from 'dva';

import Link from 'components/Link/index';
import DefaultLogo from 'mall-front/lib/assets/images/logo-zy.svg';

import './index.less';

function Logo(props) {
  const {
    webConfig: { logoPath, isSecondWebSite, personalTitle },
  } = props;
  return (
    <>
      {isSecondWebSite && logoPath ? (
        logoPath === 'loading' ? (
          <></>
        ) : (
          <Link to="/sigl" className="hmall-logo">
            <img alt="" style={{ height: logoPath ? null : 30 }} src={logoPath || DefaultLogo} />
            {personalTitle && <span className="mini-title">/{personalTitle}</span>}
          </Link>
        )
      ) : (
        <Link to="/sigl" className="hmall-logo">
          <img alt="" style={{ height: 30 }} src={DefaultLogo} />
          {personalTitle && <span className="mini-title">/{personalTitle}</span>}
        </Link>
      )}
    </>
  );
}

export default connect(({ global }) => ({
  webConfig: global.webConfig,
}))(Logo);
