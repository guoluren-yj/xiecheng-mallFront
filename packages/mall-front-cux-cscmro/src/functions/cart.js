import React from 'react';
import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';

export function preReqOrderJump({ res, jump }) {
  if (res?.some((order) => order?.shoppingCartDTOList?.length > 200)) {
    openComfirmModal({
      title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
      closable: false,
      cancelButton: false,
      children: <>当前预采购申请存在超过200行的明细，将无法生成订单PDF，建议拆分后提交！</>,
      onOk: () => {
        jump();
      },
    });
  } else {
    jump();
  }
}
