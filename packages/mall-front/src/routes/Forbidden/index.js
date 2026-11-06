/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React, { useLayoutEffect } from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import styles from './index.less';

const Forbidden = (props) => {
  const {
    webConfig: { colorCode },
  } = getUserConfigInfo();

  const { status, bizErrorMsg, message } = props.location.state || {};

  useLayoutEffect(() => {
    document.getElementById('gb-layout').style.paddingBottom = '0px';
  }, []);

  return (
    <div className={styles['container-content']} style={{ height: window.innerHeight }}>
      <div className="content">
        <img
          alt=""
          src={require(`../../assets/images/forbidden/${`ill_${
            status === 403 ? '403' : 'jurisdiction'
          }_${colorCode}`}.png`)}
        />
        <p>
          {status === 403
            ? intl.get(`hzero.common.requestNotification.403`).d('抱歉，你无权访问该页面')
            : bizErrorMsg || message}
        </p>
      </div>
    </div>
  );
};

export default Forbidden;
