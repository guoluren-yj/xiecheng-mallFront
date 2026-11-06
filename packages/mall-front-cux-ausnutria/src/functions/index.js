import React from 'react';
import loadCartData from 'mall-front/lib/routes/CartProCopy/loadCartData';
import { cloneDeep } from 'lodash';
import { groupField } from 'mall-front/lib/routes/CartProCopy/enum';
import { getUserConfigInfo } from 'mall-front/lib/utils/utils';
import AddressLov from 'mall-front/lib/components/AddressLov';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

function submitCentralizedMessage() {
  return '操作成功，审批通过后自动提交给下单人';
}

function interceptCartData(list, setting = {}) {
  const { needCheck, checkAll, fetchSingle } = setting || {};
  const dataSet = this;
  const isCheckChoose = dataSet.getState('checkCartChoosed') === 1;
  const selectSku = dataSet.selected.map((p) => p.toData());
  let newList = (cloneDeep(list) || []).map((n) => ({
    ...n,
    oldCentralizedStatus: n.centralizedStatus,
    centralizedStatus:
      dataSet.basketType === 'demander' && n.centralizedStatus === 'APPROVEING'
        ? 'SUBMITTED'
        : dataSet.basketType === 'demander' && n.centralizedStatus === 'REJECTED'
        ? 'RETURNED'
        : n.centralizedStatus,
  }));
  if (isCheckChoose && fetchSingle) {
    // 勾上查看已选
    newList = newList.filter((cart) => selectSku.some((line) => line.cartId === cart.cartId));
    if (dataSet.getState('cartViewType') === 2) {
      newList.forEach((cart, i) => {
        newList[i].cartColumnValueList = cart.cartColumnValueList.filter((p) => {
          const currentLines = selectSku.filter((line) => line.cartId === cart.cartId);
          return currentLines.some(
            (line) => line.headerNum === p.headerNum && line.lineNum === p.lineNum
          );
        });
      });
    }
  }
  const lastResp = this.cartResp || {};
  loadCartData(this, { ...lastResp, content: newList });
  // 购物车数据变更，重新计算底部维度
  const lastScroll = dataSet.getState('startScroll') || 0;
  // 用于底部监听计算滚动deps
  dataSet.setState('startScroll', lastScroll + 1);
  if (checkAll) {
    dataSet.batchSelect(dataSet.records);
  } else if (needCheck) {
    dataSet.batchSelect(
      dataSet.records.filter((r) => {
        return (
          !r.get(groupField.groupFlag) &&
          selectSku.some((p) => {
            // 订单链路按分配头勾选
            const isOrder = p.linkType === 'ORDER';
            // 同一个分配头
            const isSameAssign =
              p.cartId === r.get('cartId') && (p.headerNum || 1) === (r.get('headerNum') || 1);
            return dataSet.getState('cartViewType') === 1
              ? p.cartId === r.get('cartId')
              : p[groupField.__cartId] === r.get(groupField.__cartId) || (isOrder && isSameAssign);
          })
        );
      })
    );
  }
}

function detailLineAddressRender({ record }) {
  const { userId } = getUserConfigInfo();
  return (
    <AddressLov
      disabled
      noCache={false}
      style={{ height: 27, minHeight: 27 }}
      defaultValue={{
        addressId: record.get('HEADER_addressId_value'),
        fullAddress: record.get('HEADER_addressId'),
      }}
      lovPara={{
        userId,
        companyId: record.get('HEADER_companyId_value'),
      }}
      onChange={(item) => {
        record.set('HEADER_addressId_value', item?.addressId);
        record.set('HEADER_addressId', item?.fullAddress);
      }}
      needCreateReceiverAddress={false}
    />
  );
}

function batchEditAddrBtn() {
  return null;
}

function beforeOrder({ res, successCallback, dataSet }) {
  const isInApproveList = [
    ...new Set(res.cartList.filter((c) => c.approvingFlag).map((p) => p.productName)),
  ];
  if (dataSet.basketType === 'order' && isInApproveList.length) {
    Modal.confirm({
      title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
      children: `【${isInApproveList.join('】【')}】还有在审批阶段的，请确认是否此时下单`,
      onOk: () => successCallback(res),
    });
  } else {
    successCallback(res);
  }
}

function setAddress({ product, addressRef, companyId, userId }) {
  const { ouId, unitId } = getUserConfigInfo();
  addressRef.current.dataSet.current.set('lovPara', {
    companyId,
    userId,
    productId: product.productId,
    ouId,
    unitId,
  });
}

export {
  submitCentralizedMessage,
  interceptCartData,
  detailLineAddressRender,
  batchEditAddrBtn,
  beforeOrder,
  setAddress,
};
