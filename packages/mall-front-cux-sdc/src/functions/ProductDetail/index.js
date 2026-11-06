import { buyNowService } from 'services/productDetailService';
import { buggetRemain } from 'services/cartService';

export function gotoBuyNow({ newParams, setAddCartLoading, setCartLoading, history, quantity }) {
  buyNowService(newParams)
    .then((resp) => {
      if (resp) {
        const productParams = resp[0]?.shoppingCartDTOList[0] || {};
        // 查询预算余额
        buggetRemain([
          {
            ...productParams,
            budgetInfoList: resp[0]?.shoppingCartDTOList[0].budgetInfoList,
            quantity,
          },
        ]).then((r) => {
          if (r) {
            // eslint-disable-next-line no-unused-expressions
            resp[0]?.shoppingCartDTOList.forEach((p, i) => {
              // eslint-disable-next-line no-param-reassign
              p.budgetInfoList = r[i].budgetInfoList;
            });
            history.push({
              pathname: '/before-company-order',
              data: { orderData: resp },
            });
          }
        });
      }
    })
    .finally(() => {
      setAddCartLoading(false);
      setCartLoading(false);
    });
}
