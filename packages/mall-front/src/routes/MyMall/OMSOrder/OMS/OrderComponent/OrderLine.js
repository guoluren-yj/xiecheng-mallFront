import React from 'react';

import { getUserConfigInfo } from 'utils/utils';
import SubOrderHeader from './SubOrderHeader';
import SubOrderLine from './SubOrderLine';
import { getContextValue } from '../../common/Context';

export default function OrderLine({ item, index }) {
  const {
    checkBoxList,
    setState,
    list,
    checkedList,
    isOnline,
    currentStatus,
    onAgainOrder,
    onComment,
    onCancelOrder,
    selectOrderIds,
  } = getContextValue();
  const {
    cecOrderCode: ecPoNum,
    orderCode: poNum,
    orderId,
    errorFlag: error,
    errorMsg,
    cecCreatedTime,
    supplierCompanyName,
    cecFromCode,
    // orderEntryVOS: poLineList,
  } = item;

  const { hideFieldList = [] } = getUserConfigInfo();

  const handleOnCheck = (checked) => {
    const newList = JSON.parse(JSON.stringify(list));
    newList[index].orderEntryVOS.forEach((p) => {
      if (currentStatus === 'WAITING_RECEIVE') {
        newList[index].checked = checked;
        if (p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1) {
          // eslint-disable-next-line no-param-reassign
          p.checked = checked;
        }
      } else if (
        !checkedList[0] || // 空的时候
        checkedList[0].supplierCompanyName === newList[index].supplierCompanyName
      ) {
        newList[index].checked = checked;
        // eslint-disable-next-line no-param-reassign
        p.checked = checked;
      }
    });
    setState({ list: newList });
  };

  const headerProps = {
    item,
    error,
    errorMsg,
    checkBoxList,
    currentStatus,
    isOnline,
    hideFieldList,
    checkedList,
    handleOnCheck,
    poNum,
    orderId,
    ecPoNum,
    cecFromCode,
    supplierCompanyName,
    cecCreatedTime,
    onCancelOrder,
    onAgainOrder,
    selectOrderIds,
  };
  return (
    <div className="order-detail">
      <SubOrderHeader {...headerProps} />
      <SubOrderLine index={index} item={item} onComment={(product) => onComment(product, item)} />
    </div>
  );
}
