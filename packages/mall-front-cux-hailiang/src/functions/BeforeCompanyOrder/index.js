import Swal from 'components/swal';

import intl from 'utils/intl';

export function confirmSwal({ orderData, submitOrderList }) {
  const hasEcProduct = orderData.some(
    (order) =>
      order.shoppingCartDTOList.some(
        (product) => product.productSource !== 'CATA' && !product.qtHeaderNo
      ) && order.totalTaxIncludedAmount > 30000
  );
  const confirmMessage = hasEcProduct
    ? intl
        .get(`mallf.companyOrder.model.hailiang.ECOrderError`)
        .d('电商订单金额超过30000元，请重新下单')
    : intl
        .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
        .d('确定生成采购申请！');
  Swal(confirmMessage, !hasEcProduct).then((result) => {
    if (result.value && !hasEcProduct) submitOrderList();
  });
}
