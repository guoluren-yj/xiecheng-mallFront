import React from 'react';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import CuxGoToLowestSkuModal from '../components/GoToLowestSkuModal';

export function docInfoFieldsInit({ fields = [] }) {
  return [
    ...fields,
    {
      name: 'externalOrderCode',
      label: intl.get('mallf.myMall.view.invoice.externalOrderCode').d('D365采购订单号'),
      copyField: true,
      show: (val) => val,
    },
    {
      name: 'attributeVarchar1',
      label: intl.get('mallf.myMall.view.invoice.attributeVarchar1').d('商城申请号'),
      copyField: true,
      show: (val) => val,
    },
  ];
}

export function sentAfterSaleOnOk(params) {
  const { attributeVarchar1, afterSaleType } = params;
  return afterSaleType === 'RETURN' ? !!attributeVarchar1 : true;
}

export function openCuxGoToLowestSkuModal(props) {
  const modalRef = {
    okCallback: null,
  };
  openComfirmModal({
    title: intl.get('mallf.common.confirm.tips').d('提示'),
    style: { zIndex: 9999999 },
    children: <CuxGoToLowestSkuModal {...props} modalRef={modalRef} />,
    onOk: async () => {
      if (modalRef.okCallback) {
        const result = await modalRef.okCallback();
        if (result === false) {
          return false;
        }
        return true;
      }
      return false;
    },
  });
}
