/* eslint-disable global-require */
import React from 'react';
import { connect } from 'dva';

import Image from 'components/Image/index';
import DefaultLogo from '@/assets/images/logo-zy.svg';

import './index.less';

function Logo(props) {
  const {
    webConfig: { logoPath, isSecondWebSite },
  } = props;
  return (
    <>
      {isSecondWebSite && logoPath ? (
        logoPath === 'loading' ? (
          <></>
        ) : (
          <a className="hmall-logo">
            <Image height={logoPath ? null : 30} value={logoPath || DefaultLogo} />
          </a>
        )
      ) : (
        <a className="hmall-logo">
          <Image height={30} value={DefaultLogo} />
        </a>
      )}
    </>
  );
}

export default connect(({ global }) => ({
  webConfig: global.webConfig,
}))(Logo);
