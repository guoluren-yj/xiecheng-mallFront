import Swal from 'components/swal';
import intl from 'utils/intl';

import submitOrderList from './submitOrderList';

/**
 * 订单列表创建
 */
const createOrderList = async (params) => {
  const { orderData, miniAmountFlag } = params;

  // 电商订单
  // const validateEcData = orderData.filter(
  //   (item) =>
  //     item.shoppingCartDTOList[0].productSource !== 'CATA' &&
  //     !item.shoppingCartDTOList[0].qtHeaderNo
  // );
  // 内采需要校验的订单(需要开票)
  const validateInnerData = orderData.filter(
    (item) =>
      item.shoppingCartDTOList[0].agreementType === 'SALE' && item.innerInvoiceMethodCode !== '2'
  );
  if (
    !validateInnerData.every((item) => item.innerInvoiceMethodCode) ||
    !validateInnerData.every((item) => item.innerInvoiceTypeCode) ||
    !validateInnerData.every((item) => item.innerInvoiceTitleTypeCode) ||
    !validateInnerData.every((item) => item.innerInvoiceDetailTypeCode)
  ) {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.invoiceInformationNotNull`)
        .d('请完善发票信息')
    );
    return false;
  }
  if (miniAmountFlag) {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.existMiniOrderAmountMsg`)
        .d(
          '确定生成采购申请！该采购申请中不满足最小采购金额的单据，商品将释放回购物车，请添加商品后重新提交。'
        ),
      true
    ).then((res) => {
      if (res.value) submitOrderList(params);
    });
  } else {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
        .d('确定生成采购申请！'),
      true
    ).then((result) => {
      if (result.value) submitOrderList(params);
    });
  }
};

export default createOrderList;
