import Swal from 'components/swal';
import intl from 'utils/intl';

export async function updateBudgetFn({ params, cartItem, tmpQuantity, updateBudget, res }) {
  // 当只有一条预算更新购物车时更新预算，更新采买组织时不需要更新预算
  const { budgetInfoList = [], attributeVarchar1 } = cartItem;
  if (budgetInfoList.length === 1 && !params.updateOrganizationFlag) {
    const [newBudget] = await updateBudget([
      {
        ...cartItem,
        quantity: tmpQuantity,
        budgetInfoList: budgetInfoList.map((n) => ({
          ...n,
          quantity: attributeVarchar1 === '1' ? 1 : tmpQuantity,
        })),
      },
    ]);
    return newBudget?.budgetInfoList;
  }
  return res?.budgetInfoList;
}

export function cuxPreCheckCate({ getCheckedProduct }) {
  if (getCheckedProduct.some((n) => n.checkBudgetFlag === 1)) {
    Swal(
      intl
        .get(`mcux.common.view.shanying.checkBudgetConfirm`)
        .d('当前业务实体未维护【是否预算校验】，请联系管理员')
    );
    return false;
  }
}

export function showImportBtn() {
  return true;
}

export const handleCartBudgetData = async ({
  preProducts,
  initData,
  cartProductSortTop,
  loadStatus,
  setInitData,
  handlePunchOut,
  setLoadStatus,
  checkBudget,
  buggetRemain,
}) => {
  // 剔除success字段,会影响后端检验返回
  const checkBudgetData = preProducts
    .map((n) => {
      const { success, ...others } = n;
      return others;
    })
    .filter((p) => p.budgetSwitch === '1' && p.checkBudgetFlag !== 0);
  if (checkBudgetData.length === 0) {
    return preProducts;
  }
  const budgetValidList = await checkBudget(checkBudgetData);
  if (!budgetValidList.every((n) => n.success === 1)) {
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
    const errLength = budgetValidList.filter((n) => n.success !== 1)?.length;
    Swal(
      intl
        .get('mallf.cart.view.budget.errLength', {
          value: errLength,
        })
        .d(`当前共有${errLength}件商品未通过预算，请维护预算信息。`)
    );
    const errBudgetOffsetTop =
      document.getElementsByClassName('cart-budget-warn')[0]?.offsetTop || 0;
    document.body.scrollTop = errBudgetOffsetTop;
    return false;
  } else {
    // 查出预算余额
    // eslint-disable-next-line no-param-reassign
    preProducts = await buggetRemain(budgetValidList);
  }
  return preProducts;
};
