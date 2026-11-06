import Swal from 'components/swal';
import intl from 'utils/intl';

export function cuxUpdateCheckCate({ getCheckedProduct, cartItem }) {
  if (
    getCheckedProduct.length > 0 &&
    (!getCheckedProduct[0].itemCategoryId ||
      !cartItem.itemCategoryId ||
      cartItem.itemCategoryId !== getCheckedProduct[0].itemCategoryId) &&
    cartItem.cartId !== getCheckedProduct[0].cartId
  ) {
    Swal(
      intl
        .get(`mallf.cart.view.porduct.chooseSameItemCategory`)
        .d('勾选的商品品类不一致，不能合并下单！')
    );
    return false;
  }
}

export function cuxPreCheckCate({ getCheckedProduct }) {
  if (getCheckedProduct.some((n) => !n.itemCategoryId)) {
    Swal(intl.get(`mallf.cart.view.porduct.preItemCategory`).d('未维护商品品类，不能下单！'));
    return false;
  }
}

export function cuxSelectAll({
  initData,
  firstCurrencyCode,
  getStockConfig,
  val,
  // eslint-disable-next-line no-unused-vars
  count,
  getCheckedProduct,
}) {
  let firstItemCategoryId = getCheckedProduct.length > 0 ? getCheckedProduct[0].itemCategoryId : '';
  return initData.initProducts.map((item) => {
    let { checked } = item;
    if (getCheckedProduct.length > 0 && !getCheckedProduct[0].itemCategoryId) {
      return item;
    }
    if (
      (item.invalidFlag === 1 || item.qtHeaderNo) &&
      item.currencyCode === firstCurrencyCode &&
      !getStockConfig(item) &&
      (firstItemCategoryId ? item.itemCategoryId === firstItemCategoryId : item.itemCategoryId)
    ) {
      if (item.qtHeaderNo) {
        // eslint-disable-next-line no-param-reassign
        count += item.qtLine.length;
      } else {
        // eslint-disable-next-line no-param-reassign
        count++;
      }
      checked = val;
      firstItemCategoryId = item.itemCategoryId;
    }
    return {
      ...item,
      checked,
    };
  });
}
