import React, { useRef } from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

import intl from 'utils/intl';
import useParabola from '@/hooks/useParabola';
import defaultImg from '@/assets/images/no-product-img.svg';

export default function Operate({ product, addCart }) {
  const { dispatch } = getDvaApp()._store;
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
    imagePath: product?.imagePath || defaultImg,
    afterRun: () => {
      dispatch({
        type: 'global/update',
        payload: { showMiniCart: true },
      });
    },
  });
  return (
    <>
      {product.productFlag === 1 && (
        <Tooltip
          title={intl.get(`mallf.shoppingBasket.view.basket.addCart`).d('加入购物车')}
          placement="top"
        >
          <div className="add-cart" ref={btnRef}>
            <Icon
              type="add_shopping_cart-o"
              style={{ fontSize: 14 }}
              onClick={() => {
                addCart(
                  [
                    {
                      shoppingCartList: [product],
                      marketBasketQuantity: 1,
                    },
                  ],
                  ball
                );
              }}
            />
          </div>
        </Tooltip>
      )}
    </>
  );
}
