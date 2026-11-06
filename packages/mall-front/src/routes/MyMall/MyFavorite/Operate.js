import React, { useRef } from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import useParabola from '@/hooks/useParabola';

export default function Operate({ item, deleteFavoriteProduct, addToCart, dispatch }) {
  const btnRef = useRef();
  const ball = useParabola({
    startRef: btnRef,
    endRef: window.miniCartRef,
    flyOuterStyle: {
      transition: 'transform 1.5s',
    },
    flyInnerStyle: {
      transition: 'transform 1.5s',
    },
    runTime: 1500,
    imagePath: item.imagePath,
    afterRun: () => {
      dispatch({
        type: 'global/update',
        payload: { showMiniCart: true },
      });
    },
  });
  return (
    <div className="product-handle">
      <div
        className="handle product-handle-delete text-overflow"
        onClick={() => deleteFavoriteProduct(item)}
      >
        <Icon type="star" />
        {intl.get(`mallf.myFavorite.view.cancel.favorite`).d('取消收藏')}
      </div>
      <div
        className="handle product-handle-buy"
        onClick={() => {
          addToCart(item, ball);
        }}
        ref={btnRef}
      >
        <Icon type="shopping_cart" />
        {intl.get(`mallf.myFavorite.view.basket.addCart`).d('加入购物车')}
      </div>
    </div>
  );
}
