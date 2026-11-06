import useOmsFlag from '@/hooks/useOmsFlag';
import Loading from 'components/loading';
import React from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import OMS from './OMS';
import Order from './Order';

function OMSOrder() {
  const isOMS = useOmsFlag();
  const {
    custWebConfig: { waitPayShowConfig, waitApproveShowConfig },
  } = getUserConfigInfo();

  const omslabelList = [
    {
      countName: 'total',
      label: intl.get('mallf.myOrder.view.order.allOrders').d('全部订单'),
      status: '',
    },
    {
      countName: 'unApproved',
      label: intl.get('mallf.myOrder.view.order.shenpi').d('待审批'),
      status: 'WAITING_APPROVE',
      visible: waitApproveShowConfig !== 'HIDE',
    },
    {
      countName: 'unPaid',
      label: intl.get('mallf.myOrder.view.order.payment').d('待支付'),
      status: 'WAITING_PAY',
      visible: waitPayShowConfig !== 'HIDE',
    },
    {
      countName: 'unDelivered',
      label: intl.get('mallf.myOrder.view.order.willdeliver').d('待发货'),
      status: 'WAITING_SENT',
    },
    {
      countName: 'unReceived',
      label: intl.get('mallf.myOrder.view.order.pendingReceipt').d('待收货'),
      status: 'WAITING_RECEIVE',
    },
    {
      countName: 'finished',
      label: intl.get('mallf.myOrder.view.order.FINISH').d('已完成'),
      status: 'FINISH',
    },
  ].filter((p) => p.visible !== false);

  const labelList = [
    {
      countName: 'allNum',
      label: intl.get('mallf.myOrder.view.order.allOrders').d('全部订单'),
      status: '',
    },
    {
      countName: 'waitApprove',
      label: intl.get('mallf.myOrder.view.order.shenpi').d('待审批'),
      status: 'WAITING_APPROVE',
    },
    {
      countName: 'waitSent',
      label: intl.get('mallf.myOrder.view.order.willdeliver').d('待发货'),
      status: 'WAITING_SENT',
    },
    {
      countName: 'waitReceive',
      label: intl.get('mallf.myOrder.view.order.pendingReceipt').d('待收货'),
      status: 'WAITING_RECEIVE',
    },
    {
      countName: 'finish',
      label: intl.get('mallf.myOrder.view.order.FINISH').d('已完成'),
      status: 'FINISH',
    },
  ];
  return (
    <>
      {isOMS === undefined ? (
        <Loading />
      ) : isOMS ? (
        <OMS labelList={omslabelList} isOnline />
      ) : (
        <Order labelList={labelList} />
      )}
    </>
  );
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
    'mallf.orderDetail',
    'smodr.acceptOrder',
    'smodr.orderLine',
    'smodr.deliveryOrder',
    'smodr.orderDetail',
  ],
})(OMSOrder);
