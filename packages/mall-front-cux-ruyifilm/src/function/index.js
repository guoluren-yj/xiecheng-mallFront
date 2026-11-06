import React from 'react';

export function showSales({ record }) {
  const quantity = record?.get('quantity') || '-';
  return <span>{quantity}</span>;
}

export function hiddenBtns({ item, product }) {
  console.log('item', item);
  console.log('product', product);
  const orderEntryVOS = item?.orderEntryVOS || [];
  const { consignmentEntryId } =
    orderEntryVOS?.find((n) => n?.mallOrderEntryStatus === 'WAITING_RECEIVE') || {};
  // if (index === 0) return true;
  if (product?.consignmentEntryId === consignmentEntryId) return true;
  return false;
}

export const openDetailAccept = ({ product, index, order, subList, item, onAccept }) => {
  const orderEntryVOS = item?.orderEntryVOS || [];
  if (product.receiptFlag === 1) {
    if (order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL' && index === 0) {
      onAccept(subList);
    } else {
      // onAccept([product]);
      onAccept(orderEntryVOS);
    }
  }
};

export const openDetailAcceptShowFlag = ({ product, hideFieldList }) => {
  // const orderEntryVOS = item?.orderEntryVOS || [];
  // const mallOrderEntryStatusFlag =orderEntryVOS?.some((n) => n?.mallOrderEntryStatus === 'WAITING_RECEIVE') || false;
  const criterionFlag =
    product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
    hideFieldList &&
    !hideFieldList.includes('ACCEPTANCE');
  // return criterionFlag || mallOrderEntryStatusFlag;
  return criterionFlag;
};

export const openDetailCheldAcceptShowFlag = ({ hideFieldList, item, showAcceptBtn }) => {
  const orderEntryVOS = item?.orderEntryVOS || [];
  const mallOrderEntryStatusFlag =
    orderEntryVOS?.some((n) => n?.mallOrderEntryStatus === 'WAITING_RECEIVE') || false;
  const criterionFlag =
    showAcceptBtn &&
    mallOrderEntryStatusFlag &&
    hideFieldList &&
    !hideFieldList.includes('ACCEPTANCE');
  return criterionFlag;
};
