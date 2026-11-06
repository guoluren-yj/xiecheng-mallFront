import React from 'react';
import { withRouter } from 'react-router-dom';
import Link from 'components/Link';
import intl from 'utils/intl';

import styles from './index.less';

const PageNotFound = () => {
  return (
    <div>
      <div className={styles['page-404']}>
        <div className="page-heard" />
        <div className="page-pin" />
        <div className="page">
          <div>error</div>
          <span>404</span>
        </div>
        {/* <h1>哎哟喂！页面让狗狗叼走了！</h1>
        <h2>大家可以到狗狗没有叼过的地方看看！</h2> */}
        <div>
          <Link to="/">{intl.get('mallf.common.model.toHome').d('点击进入首页')}</Link>
        </div>
      </div>
    </div>
  );
};

export default withRouter(PageNotFound);
