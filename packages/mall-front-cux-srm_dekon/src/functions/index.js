import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { fetchStock } from '../services/cartService';

export async function handleCheckCartData({
  preProducts,
  initData,
  cartProductSortTop,
  loadStatus,
  setInitData,
  handlePunchOut,
  setLoadStatus,
}) {
  // 剔除success字段,会影响后端检验返回
  const checkData = preProducts.map((n) => {
    const { success, checkStatus, checkErrorMessage, ...others } = n;
    return others;
  });
  let validList;
  try {
    validList = await request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/4lJJ1TCALoauB5XeicwqunHOmeTtWKa2QqKKhBibA9FtM`,
      {
        method: 'POST',
        body: JSON.stringify(checkData),
      }
    );
  } catch {
    setLoadStatus({
      ...loadStatus,
      loading: false,
    });
    return false;
  }
  if (validList.some((n) => n.checkStatus === 0)) {
    const newValidList = validList.map((n) => {
      return {
        ...n,
        success: n.checkStatus,
        occupancyMessage: n.checkErrorMessage,
      };
    });
    // 购物车商品行剔除success，勾选商品行校验后会重新覆盖
    const cartList = initData.initProducts.map((n) => {
      const { success, ...others } = n;
      return others;
    });
    const newCartProducts = cartProductSortTop(handlePunchOut(newValidList), cartList);
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
    return preProducts;
  }
}

export async function handleAfterUpdateOrganization({ initData, setInitData }) {
  const params = initData.initProducts;
  if (!params.length) {
    return false;
  }
  const result = await fetchStock(params);
  if (result) {
    setInitData((prevState) => ({
      ...prevState,
      initProducts: prevState.initProducts.map((p) => {
        const find = result.find((r) => r.cartId === p.cartId);
        if (find) {
          return {
            ...p,
            attributeDecimal13: find.attributeDecimal13,
            attributeDecimal12: find.attributeDecimal12,
            errorMessage: find.errorMessage,
          };
        }
        return p;
      }),
    }));
  }
}
