import intl from 'utils/intl';
import Swal from 'components/swal';

// 内采支付信息默认赋值
export function initInnerInvoiceInfo({ item }) {
  return item;
}

export function confirmSwal({ orderData, submitOrderList }) {
  const hasInnerProduct = orderData.some((order) =>
    order.shoppingCartDTOList.some(
      (product) => product.agreementType === 'SALE' && !product.qtHeaderNo
    )
  );
  if (hasInnerProduct) {
    Swal(
      intl
        .get(`mallf.companyOrder.view.confirmInvoiceAndAddress`)
        .d('请维护或确认发票信息 & 收单信息！'),
      true,
      intl.get('mallf.common.button.back').d('返回')
    ).then((res) => {
      if (res.value) {
        Swal(
          intl
            .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
            .d('确定生成采购申请！'),
          true
        ).then((result) => {
          if (result.value) submitOrderList();
        });
      }
    });
  } else {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
        .d('确定生成采购申请！'),
      true
    ).then((result) => {
      if (result.value) submitOrderList();
    });
  }
}
