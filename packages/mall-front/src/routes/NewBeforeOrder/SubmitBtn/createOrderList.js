import React from 'react';
import { Modal, Table, DataSet } from 'choerodon-ui/pro';
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
    setPreData,
    setSubmitLoading,
    isOMS,
    history,
    hasSiglProduct,
    preData,
    orderType,
  } = params;

  const submitOrderList = () => {
    submitOrder({
      hasSiglProduct,
      setOrderData,
      setPreData,
      orderData,
      setSubmitLoading,
      isOMS,
      history,
      preData,
      orderType,
    });
  };
  const isReceiveFlag = (orderData || []).some((n) => n.agreementBusinessType === 'RECEIVE');

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
    !isReceiveFlag &&
    (!validateEcData.every((item) => item.invoiceMethodCode) ||
      !validateEcData.every((item) => item.invoiceTypeCode) ||
      !validateEcData.every((item) => item.invoiceTitleTypeCode) ||
      !validateEcData.every((item) => item.invoiceDetailTypeCode) ||
      validateEcData.some((item) => !invoiceValide(item)) ||
      (hideInnerMenuList.includes('INVOICE_INFO') &&
        (!validateInnerData.every((item) => item.innerInvoiceMethodCode) ||
          !validateInnerData.every((item) => item.innerInvoiceTypeCode) ||
          !validateInnerData.every((item) => item.innerInvoiceTitleTypeCode) ||
          !validateInnerData.every((item) => item.innerInvoiceDetailTypeCode))))
  ) {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.invoiceInformationNotNull`)
        .d('请完善发票信息')
    );
    return false;
  }
  if (!validateEcData.every((item) => item.invoiceAddressId)) {
    Swal(intl.get('mallf.common.view.choose.acAdress').d('请选择收单地址'));
    return false;
  }
  if (orderData.some((n) => n.budgetWarningFlag === 1)) {
    const newData = orderData.map((n, index) => ({ ...n, orderSeq: index }));
    const ds = new DataSet({
      data: newData.filter((n) => n.budgetWarningFlag === 1),
      selection: false,
      fields: [
        {
          name: 'orderSeq',
          label: intl.get('mallf.common.view.berforeOrderIndex').d('采购申请号'),
        },
        {
          name: 'budgetWarningMsg',
          label: intl.get('mallf.common.view.warningMsg').d('提示'),
        },
      ],
    });
    const columns = [
      {
        name: 'orderSeq',
        width: 130,
        renderer: ({ record }) =>
          record.get('orderSeq') + 1 < 10
            ? `0${record.get('orderSeq') + 1}`
            : record.get('orderSeq') + 1,
      },
      {
        name: 'budgetWarningMsg',
      },
    ];
    window.budgetWarnModal = Modal.open({
      title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
      destroyOnClose: true,
      mask: true,
      closable: true,
      style: { width: 560 },
      children: (
        <>
          <div style={{ marginBottom: 10, marginTop: -5 }}>
            {intl
              .get('mallf.companyOrder.view.title.budgetConfirm')
              .d('以下商品预算超量或超预警线，请确认是否继续提交')}
          </div>
          <Table dataSet={ds} columns={columns} />
        </>
      ),
      onOk: () => {
        submitOrderList();
      },
    });
    return;
  }

  // 判断是否存在赠品或附件
  const orderGiftFlag = orderData.some((order) =>
    order?.shoppingCartDTOList?.some((product) =>
      product?.productGiftDTOList?.some((n) => n.giftVOList?.some((gift) => gift.giftType))
    )
  );

  const confirmCreatePurchaseMsg = ({ message }) => {
    // 老购物车预采提示信息
    return {
      msg: (
        <>
          <div>{message}</div>
          {orderGiftFlag ? ( // 赠品提示在下一行，不与上面冲突
            <div style={{ marginTop: 10 }}>
              {intl
                .get(`mallf.companyOrder.model.GiftOrAttchment.numberMsg`)
                .d('所有赠品/附件按实际收到的数量为准。')}
            </div>
          ) : (
            ''
          )}
        </>
      ),
    };
  };

  if (orderData.some((n) => n.minPurchaseFlag === 0)) {
    Swal(
      confirmCreatePurchaseMsg({
        message: intl
          .get(`mallf.companyOrder.model.companyOrder.existMiniOrderAmountMsg`)
          .d('确定生成采购申请！存在不满足成单金额要求的单据，商品将释放回购物车。'),
      }),
      true
    ).then((res) => {
      if (res.value) submitOrderList();
    });
  } else {
    CuxFn({
      name: 'BeforeCompanyOrder-fn-confirmSwal',
      value: { orderData, submitOrderList, preData, confirmCreatePurchaseMsg, setSubmitLoading },
    })(() => {
      Swal(
        confirmCreatePurchaseMsg({
          message: intl
            .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
            .d('确定生成采购申请！'),
        }),
        true
      ).then((result) => {
        if (result.value) submitOrderList();
      });
    })();
  }
};

export default createOrderList;
