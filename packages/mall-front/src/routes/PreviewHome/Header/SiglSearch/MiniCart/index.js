import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCartCountService } from 'services/headerService';
import { getUserConfigInfo } from 'utils/utils';
import style from './index.less';

function MiniCart(props) {
  const { showMiniCart, styles, dispatch } = props;
  const [currentNum, setCurrentNum] = useState(0);
  const miniCart = useRef(null);
  window.miniCartRef = miniCart;
  const { userId } = getUserConfigInfo();

  useEffect(() => {
    getCartCount();
  }, [userId, showMiniCart]);

  // 获取购物车数量
  function getCartCount() {
    getCartCountService({ ownerId: userId }).then((json) => {
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
  );
}

export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
  language: global.language,
}))(MiniCart);
