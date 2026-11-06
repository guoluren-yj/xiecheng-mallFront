import { isEmpty } from 'lodash';
import { getUserConfigInfo } from 'utils/utils';

export function getFields({ fields, product }) {
  const { itemCategoryId, itemCategoryName } = product;
  const newFields = fields.map((p) => {
    if (p.name === 'categoryIdLov') {
      return {
        ...p,
        defaultValue: { categoryId: itemCategoryId, categoryIdMeaning: itemCategoryName },
        dynamicProps() {
          return {
            disabled: true,
          };
        },
      };
    }
    if (p.name === 'costCenterLov') {
      return {
        ...p,
        dynamicProps: {
          lovPara: () => {
            const { companyId, organizationId } = getUserConfigInfo() || {};
            return { companyId, tenantId: organizationId };
          },
        },
      };
    }
    if (p.name === 'budget') {
      return {
        ...p,
        transformResponse: (_, record) => {
          const budget = JSON.parse(record.budget);
          return !isEmpty(budget)
            ? record.budget
            : JSON.stringify({ categoryId: itemCategoryId, categoryIdMeaning: itemCategoryName });
        },
      };
    }
    return p;
  });
  return newFields;
}

/**
 * 处理购物车预算数据
 */
export async function handleCartBudgetData({
  preProducts,
  initData,
  cartProductSortTop,
  loadStatus,
  setInitData,
  handlePunchOut,
  setLoadStatus,
  checkBudget,
  buggetRemain,
}) {
  // 剔除success字段,会影响后端检验返回
  const checkBudgetData = preProducts.map((n) => {
    const { success, ...others } = n;
    return others;
  });
  const budgetValidList = await checkBudget(checkBudgetData);
  if (!budgetValidList.every((n) => n.success === 1)) {
    const errBudgetOffsetTop =
      document.getElementsByClassName('cart-budget-warn')[0]?.offsetTop || 0;
    document.documentElement.scrollTop = errBudgetOffsetTop;
    // 购物车商品行剔除success，勾选商品行校验后会重新覆盖
    const cartList = initData.initProducts.map((n) => {
      const { success, ...others } = n;
      return others;
    });
    const newCartProducts = cartProductSortTop(handlePunchOut(budgetValidList), cartList);
    setInitData({
      ...initData,
      initProducts: newCartProducts, // 为了排序，否则勾选商品倒序了
    });
    setLoadStatus({
      ...loadStatus,
      loading: false,
    });
    return false;
  } else {
    // 查出预算余额
    // eslint-disable-next-line no-param-reassign
    preProducts = await buggetRemain(budgetValidList);
  }
  return preProducts;
}
