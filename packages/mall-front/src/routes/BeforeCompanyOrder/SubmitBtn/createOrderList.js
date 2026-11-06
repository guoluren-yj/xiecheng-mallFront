import React from 'react';

import Swal from 'components/swal';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';
import { getUserConfigInfo } from 'utils/utils';
import submitOrder from './submitOrderList';

/**
 * 订单列表创建
 */
const createOrderList = async (params) => {
  const {
    orderData,
    // miniAmountFlag,
    setOrderData,
    setSubmitLoading,
    headerCode,
    eCLineCode,
    cataLineCode,
    isOMS,
    history,
    hasSiglProduct,
    siglCount,
    allSigluse,
  } = params;
  if (hasSiglProduct && siglCount < allSigluse) {
    Swal(intl.get(`mallf.companyOrder.view.lackofIntegral`).d('积分余额不足'));
    return;
  }

  const submitOrderList = () => {
    submitOrder({
      hasSiglProduct,
      setOrderData,
      orderData,
      setSubmitLoading,
      headerCode,
      eCLineCode,
      cataLineCode,
      isOMS,
      history,
    });
  };

  const { hideInnerMenuList = [] } = getUserConfigInfo();
  // 电商订单
  const validateEcData = orderData.filter(
    (item) =>
      item.shoppingCartDTOList[0].productSource !== 'CATA' &&
      !item.shoppingCartDTOList[0].qtHeaderNo
  );
  // 内采需要校验的订单(需要开票)
  const validateInnerData = orderData.filter(
    (item) =>
      item.shoppingCartDTOList[0].agreementType === 'SALE' && item.innerInvoiceMethodCode !== '2'
  );
  if (!validateEcData.every((item) => item.paymentMethodCode)) {
    Swal(intl.get(`mallf.companyOrder.model.companyOrder.paymentNotNull`).d('请选择支付方式'));
    return false;
  }
  const INVOICE_VALIDE_LIST = [
    'taxRegistrationAddress',
    'taxRegistrationPhone',
    'depositBank',
    'bankAccountNum',
    'invoiceHeader',
    'taxRegistrationNumber',
  ];
  function invoiceValide(order) {
    const { invoiceTypeCode, companyInvoiceVO = {} } = order || {};
    const { invoiceHeader, taxRegistrationNumber } = companyInvoiceVO || {};
    // 普票只需要校验发票抬头跟税务登记号
    if (['1', '3'].includes(invoiceTypeCode) && invoiceHeader && taxRegistrationNumber) return true;
    const validFlag = INVOICE_VALIDE_LIST.every((n) => companyInvoiceVO[n]);
    return validFlag;
  }

  if (
    !validateEcData.every((item) => item.invoiceMethodCode) ||
    !validateEcData.every((item) => item.invoiceTypeCode) ||
    !validateEcData.every((item) => item.invoiceTitleTypeCode) ||
    !validateEcData.every((item) => item.invoiceDetailTypeCode) ||
    validateEcData.some((item) => !invoiceValide(item)) ||
    (hideInnerMenuList.includes('INVOICE_INFO') &&
      (!validateInnerData.every((item) => item.innerInvoiceMethodCode) ||
        !validateInnerData.every((item) => item.innerInvoiceTypeCode) ||
        !validateInnerData.every((item) => item.innerInvoiceTitleTypeCode) ||
        !validateInnerData.every((item) => item.innerInvoiceDetailTypeCode)))
  ) {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.invoiceInformationNotNull`)
        .d('请完善发票信息')
    );
    return false;
  }
  if (!validateEcData.every((item) => item.invoiceAddressId)) {
    Swal(intl.get('mallf.companyOrder.view.choose.acAdress').d('请选择收单地址'));
    return false;
  }
  // 校验名片提示
  if (
    !CuxFn({
      name: 'BeforeCompanyOrder-fn-validateWechat',
      value: { orderData, submitOrderList },
    })()
  ) {
    return false;
  }

  // 判断是否存在赠品或附件
  const orderGiftFlag = orderData.some((order) =>
    order?.shoppingCartDTOList?.some((product) =>
      product?.productGiftDTO?.giftVOList?.some((gift) => gift.giftType === 2)
    )
  );
  const orderMinPurchaseFlag = orderData.some((n) => n.minPurchaseFlag === 0);

  const confirmCreatePurchaseMsg = ({ minPurchaseFlag = false, giftFlag = false }) => {
    // 老购物车预采提示信息
    return {
      msg: (
        <>
          <div>
            {minPurchaseFlag
              ? intl
                  .get(`mallf.companyOrder.model.companyOrder.existMiniOrderAmountMsg`)
                  .d('确定生成采购申请！存在不满足成单金额要求的单据，商品将释放回购物车。')
              : intl
                  .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
                  .d('确定生成采购申请！')}
          </div>
          {giftFlag ? ( // 赠品提示在下一行，不与上面冲突
            <div style={{ marginTop: 10 }}>
              {intl
                .get(`mallf.companyOrder.model.companyOrder.haveGiftOrderMsg`)
                .d('所有赠品按实际收到的数量为准。')}
            </div>
          ) : (
            ''
          )}
        </>
      ),
    };
  };
  const confirmMessage = confirmCreatePurchaseMsg({
    minPurchaseFlag: orderMinPurchaseFlag,
    giftFlag: orderGiftFlag,
  });

  CuxFn({
    name: 'BeforeCompanyOrder-fn-confirmSwal',
    value: { orderData, submitOrderList, confirmMessage },
  })(() => {
    Swal(confirmMessage, true).then((result) => {
      if (result.value) submitOrderList();
    });
  })();
};

export default createOrderList;
