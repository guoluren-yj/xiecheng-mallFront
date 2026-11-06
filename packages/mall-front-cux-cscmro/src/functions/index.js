import { getCookie } from 'utils/utils';
import { fetchSanctionNumberVaildApi } from '../services/index';

export function getSanctionNumber() {
  const { sanction_number: sanctionNumber } = getCookie('singleRecordCookie') || {};
  return sanctionNumber;
}

export function CustomizeHeaderInfoInit({ data, setOrderData }) {
  if (data) {
    const newData = data.map((order) => {
      return {
        ...order,
        attributeVarchar11: getSanctionNumber() ? 1 : 0,
        shoppingCartDTOList: order.shoppingCartDTOList.map((s) => ({
          ...s,
          attributeVarchar12: getSanctionNumber(),
          attributeVarchar30: getSanctionNumber() ? 1 : 0, // 是否大小决裁标识 行上增加，使详情页补充信息二开可以拿到标识判断展示
        })),
      };
    });
    setOrderData(newData);
  }
}

export async function handleCartSanctionNumberData({
  preProducts,
  handleCartBudgetData,
  setLoadStatus,
  loadStatus,
  initData,
  cartProductSortTop,
  setInitData,
}) {
  const oldPreProducts = await handleCartBudgetData(preProducts); // 标准预算
  try {
    if (oldPreProducts && getSanctionNumber()) {
      const res = await fetchSanctionNumberVaildApi({
        cuxCscmroSanctionNumber: getSanctionNumber(),
      });
      if (!res) {
        return false;
      }
    }
    return oldPreProducts;
  } catch (error) {
    const cartList = initData.initProducts.map((n) => {
      const { success, ...others } = n;
      return others;
    });
    const newCartProducts = cartProductSortTop(oldPreProducts, cartList);
    setInitData({
      ...initData,
      initProducts: newCartProducts,
    });
    setLoadStatus({
      ...loadStatus,
      loading: false,
    });
  }
}
