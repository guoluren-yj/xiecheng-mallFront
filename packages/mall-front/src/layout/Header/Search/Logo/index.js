/* eslint-disable global-require */
import React from 'react';
import { connect } from 'dva';

import Link from 'components/Link/index';
import DefaultLogo from '@/assets/images/logo-zy.svg';

import './index.less';

function Logo(props) {
  const { href } = props;
  const {
    webConfig: { logoPath, isSecondWebSite },
  } = props;
  return (
    <>
      {isSecondWebSite && logoPath ? (
        logoPath === 'loading' ? (
          <></>
        ) : (
          <Link to={href} className="hmall-logo">
            <img alt="" style={{ height: logoPath ? null : 30 }} src={logoPath || DefaultLogo} />
          </Link>
        )
      ) : (
        <Link to={href} className="hmall-logo">
          <img alt="" style={{ height: 30, width: 198 }} src={DefaultLogo} />
        </Link>
      )}
    </>
  );
}

export default connect(({ global }) => ({
  webConfig: global.webConfig,
}))(Logo);
