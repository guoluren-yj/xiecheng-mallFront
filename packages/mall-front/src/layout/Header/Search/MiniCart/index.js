import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import { connect } from 'dva';

import Link from 'components/Link';
import intl from 'utils/intl';
import { getCartCountService } from 'services/headerService';
import style from './index.less';
import { getUserConfig } from '@/utils/utils';

function MiniCart(props) {
  const { showMiniCart, styles, dispatch, isNewCart } = props;
  const [currentNum, setCurrentNum] = useState(0);
  const miniCart = useRef(null);
  window.miniCartRef = miniCart;
  const { companyId } = getUserConfig();

  useEffect(() => {
    if (companyId && isNewCart !== undefined) {
      getCartCount();
    }
  }, [companyId, showMiniCart, isNewCart]);

  // 获取购物车数量
  function getCartCount() {
    getCartCountService(isNewCart).then((json) => {
      setCurrentNum(json);
      dispatch({
        type: 'global/update',
        payload: {
          showMiniCart: false,
        },
      });
    });
  }

  return (
    <Link to="/cart">
      <div
        id="miniCart"
        className={classNames({
          [style['h-mini-hotcart']]: true,
        })}
        ref={miniCart}
        style={styles}
      >
        <Icon type="shopping_cart-o" style={{ marginRight: '8px', fontSize: 14, marginTop: -3 }} />
        <span>{intl.get(`mallf.common.view.common.cart`).d('购物车')}</span>
        <span className="notice-word">{currentNum > 999 ? '999+' : currentNum}</span>
      </div>
    </Link>
  );
}

export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
  language: global.language,
}))(MiniCart);
