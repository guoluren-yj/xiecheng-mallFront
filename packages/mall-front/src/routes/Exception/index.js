import React from 'react';
import { withRouter } from 'react-router-dom';
import intl from 'utils/intl';

import Image from 'components/Image';

import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';
import styles from './index.less';

function Exception(props) {
  const {
    location: { state = {} },
  } = props;
  return (
    <div className={styles['page-exception']}>
      <div className="exception-content">
        <p>
          <Image value={emptyImg} className="no-data-svg" width={136} height={116} />
        </p>
        <p className="message">
          {state.message ||
            intl.get('mallf.common.model.exception.goodsAreOffTheShelves').d('商品已下架')}
        </p>
        <p className="go-home" onClick={() => props.history.push('/')}>
          {intl.get(`mallf.common.model.payResult.backToHomepage`).d('回到首页')}
        </p>
      </div>
    </div>
  );
}

export default withRouter(Exception);
