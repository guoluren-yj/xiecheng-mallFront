import { isEmpty } from 'lodash';

export function handleBudget({ setInitData, initData }) {
  const newInitProducts = initData.initProducts.map((product) => {
    return { ...product, success: isEmpty(product.brandmaxBudgetInfoList) ? 0 : 1 };
  });
  setInitData({
    ...initData,
    initProducts: newInitProducts,
  });
}

export function handleCartBudgetData({
  preProducts,
  initData,
  cartProductSortTop,
  loadStatus,
  setInitData,
  handlePunchOut,
  setLoadStatus,
}) {
  const newInitProducts = preProducts.map((product) => {
    return { ...product, success: isEmpty(product.brandmaxBudgetInfoList) ? 0 : 1 };
  });
  if (!newInitProducts.every((n) => n.success === 1)) {
    const errBudgetOffsetTop =
      document.getElementsByClassName('cart-budget-warn')[0]?.offsetTop || 0;
    document.documentElement.scrollTop = errBudgetOffsetTop;
    // 购物车商品行剔除success，勾选商品行校验后会重新覆盖
    const cartList = initData.initProducts.map((n) => {
      const { success, ...others } = n;
      return others;
    });
    const newCartProducts = cartProductSortTop(handlePunchOut(newInitProducts), cartList);
    setInitData({
      ...initData,
      initProducts: newCartProducts, // 为了排序，否则勾选商品倒序了
    });
    setLoadStatus({
      ...loadStatus,
      loading: false,
    });
    return false;
  }
  return newInitProducts;
}
