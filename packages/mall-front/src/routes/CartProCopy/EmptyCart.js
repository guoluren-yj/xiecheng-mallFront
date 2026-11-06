// 购物车缺省
import React, { memo } from 'react';
import intl from 'utils/intl';
import Link from 'components/Link';
import emptyCart from '@/assets/images/cart/illu_cart_nodata_default.svg';
import styles from './index.less';

export default memo(function EmptyCart({ isBasket }) {
  return (
    <div className={styles['empty-cart']}>
      <p>
        <img
          alt=""
          src={emptyCart}
          style={{ width: 250, height: 180 }}
          className="empty-cart-img"
        />
      </p>
      <span className="empty-cart-tip">
        {isBasket
          ? intl.get(`mallf.cart.view.basket.empty`).d('您的拼单篮是空的')
          : intl.get(`mallf.cart.view.cart.empty`).d('您的购物车是空的')}
      </span>
      <Link to="/">
        <span>{intl.get(`mallf.cart.model.go.shopping`).d('去逛逛')}</span>
      </Link>
    </div>
  );
});
