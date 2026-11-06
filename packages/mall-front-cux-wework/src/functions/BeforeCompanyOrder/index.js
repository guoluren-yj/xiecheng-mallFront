/* eslint-disable no-param-reassign */
import { fetchCategory } from 'services/cartService';

export function initOrderData({ data = [], setOrderData }) {
  const newOrderData = [...data];
  const catalogIdList = [];
  data.forEach((i) => {
    const { shoppingCartDTOList = [] } = i;
    shoppingCartDTOList.forEach((pro) => {
      catalogIdList.push(pro.catalogId);
    });
  });
  fetchCategory(catalogIdList).then((res) => {
    if (res) {
      newOrderData.forEach((order) => {
        order.spendList = res;
        order.shoppingCartDTOList.forEach((pro) => {
          const { weworkSpendCategoryList = [] } =
            res.find((i) => i.catalogId === pro.catalogId) || {};
          const use = weworkSpendCategoryList?.filter((category) => category.defaultFlag === 1);
          pro.cogsFlag = use?.[0]?.cogsFlag || weworkSpendCategoryList?.[0]?.cogsFlag;
          pro.spendCategoryName =
            use?.[0]?.spendCategoryName || weworkSpendCategoryList?.[0]?.spendCategoryName;
          pro.spendCategoryCode =
            use?.[0]?.spendCategoryCode || weworkSpendCategoryList?.[0]?.spendCategoryCode;
          pro.catalogList = weworkSpendCategoryList || [];
        });
      });
      setOrderData(newOrderData);
    }
  });
}
