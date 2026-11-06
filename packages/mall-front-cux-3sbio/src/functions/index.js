import React from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
// import { isEmpty } from 'lodash';
import { getPrimaryColor } from 'utils/utils';
// import { Modal } from 'choerodon-ui/pro';
import { openComfirmModal } from 'utils/modals';

export function allocationCreate({ ds, data = {} }) {
  ds.create(data, 0);
}

export function cuxBudgetWarn() {
  return (
    <div style={{ color: getPrimaryColor(), padding: '0 20px 5px' }}>
      <Icon type="error" style={{ marginRight: '6px', fontSize: '14px' }} />
      <span style={{ verticalAlign: 'text-top' }}>
        {intl
          .get('mallf.common.view.allocation.budgetWarn')
          .d('若预算号查无数据，则表示当前组织/部门下未维护预算信息，请联系管理员')}
      </span>
    </div>
  );
}

// 预采头备注值映射
export function changeHeaderRemark({ name, value, orderIndex, setOrderData }) {
  if (name === 'attributeVarchar38') {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].remark = value;
      return newOrderData;
    });
  }
}

export function openCartAddressTipsModal(props) {
  const { res, successCallback, dataSet } = props;
  const data = dataSet.selected.map((item) => item.toData());
  // const addressEditFlag = isEmpty(data) ? 0 : data[0]?.addressEditFlag;
  // const fullAddress = ['1', 1].includes(addressEditFlag) ? data[0]?.fullAddress : null;
  // const _textNum = (data || []).map(item => {
  //   if (['1', 1].includes(item.addressEditFlag)) {
  //     return item.fullAddress;
  //   }
  //   return null;
  // });
  // const address = _textNum.join(',') || '';
  const isAddressEditFlag = data?.some((item) => ['1', 1].includes(item.addressEditFlag));
  if (isAddressEditFlag) {
    return openComfirmModal({
      title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
      border: false,
      children: (
        // <div>{`您正在提交购物车，收货地址是:${fullAddress}。如地址不正确，请点击【关闭】返回购物车修改收货地址，如地址正确，请点击【继续】提交购物车。`}</div>
        <div>
          您正在提交Punchout购物车，请确认收货地址是否正确。如尚未确认，请点击【关闭】返回购物车，如已经确认，请点击【继续】提交购物车。
        </div>
      ),
      okText: '继续',
      cancelText: '关闭',
      onOk: () => {
        successCallback(res);
      },
    });
  }
  successCallback(res);
  // openComfirmModal({
  //   title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
  //   border: false,
  //   children: <div>您正在提交购物车，收货地址尚未设置，请点击【关闭】返回购物车修改收货地址。</div>,
  //   okText: '继续',
  //   cancelText: '关闭',
  //   onOk: () => {
  //     successCallback(res);
  //   },
  // });
}

export function setDisabledLinkFlag({ product }) {
  return (
    !!product.qtLineNo ||
    product.cecFromCode === 'MANUAL' ||
    (['ATTACHMENT', 'GIFT'].includes(product.skuType) && +product?.attributeVarchar24 === 1)
  );
}

export function getBtns({ btns, item }) {
  return btns.map((btn) => {
    if (btn.icon === 'add_shopping_cart-o') {
      return {
        ...btn,
        show:
          btn.show &&
          !(
            item.orderEntryVOS &&
            item.orderEntryVOS?.some((p) => p.attributeVarchar24 === 'PUNCHOUT')
          ),
      };
    }
    return btn;
  });
}
