import React from 'react';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import OMS from './OMS';

function OMSOrder() {
  const omslabelList = [
    {
      countName: 'total',
      label: intl.get('mallf.myMall.view.order.allOrders').d('全部订单'),
      status: '',
    },
    {
      countName: 'unApproved',
      label: intl.get('mallf.myMall.view.order.shenpi').d('待审批'),
      status: 'WAITING_APPROVE',
    },
    {
      countName: 'unPaid',
      label: intl.get('mallf.myMall.view.order.payment').d('待支付'),
      status: 'WAITING_PAY',
    },
    {
      countName: 'unDelivered',
      label: intl.get('mallf.myMall.view.order.willdeliver').d('待发货'),
      status: 'WAITING_SENT',
    },
    {
      countName: 'unReceived',
      label: intl.get('mallf.myMall.view.order.pendingReceipt').d('待收货'),
      status: 'WAITING_RECEIVE',
    },
    {
      countName: 'finished',
      label: intl.get('mallf.myMall.view.order.FINISH').d('已完成'),
      status: 'FINISH',
    },
  ].filter((p) => p.visible !== false);
  return <OMS labelList={omslabelList} isOnline />;
}

export default formatterCollections({
  code: [
    'mallf.myOrder',
    'mallf.commentDetail',
    'mallf.addOrderComment',
    'component.docFlow',
    'mallf.myInvoice',
    'hwfp.common',
    'component.operationRecord',
    'mallf.myMall',
    'hwfp.task',
  ],
})(OMSOrder);
