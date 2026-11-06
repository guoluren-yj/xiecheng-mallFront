import React, { useState } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import { fetchAgainOrderService } from 'services/orderCenterService';
import swalAlert from 'components/swal';
import OrderAgainModal from './OrderAgainModal';
import intl from '@/utils/intl';

function OrderAgain(props) {
  const { product, order, fetchOrderData } = props;
  const [submitLoading, setSubmitLoading] = useState(false);

  function fetchAgainOrder() {
    const openModal = (params) => {
      const modalProps = {
        product,
        order,
        fetchOrderData,
        ...params,
      };
      Modal.open({
        mask: true,
        drawer: true,
        footer: null,
        movable: false,
        closable: false,
        maskClosable: false,
        destroyOnClose: true,
        size: 'large',
        style: { width: 1090 },
        bodyStyle: { padding: 0 },
        children: <OrderAgainModal {...modalProps} />,
      });
    };
    setSubmitLoading(true);
    fetchAgainOrderService(order.orderCode)
      .then((res) => {
        if (res) {
          openModal({
            allInfo: {
              ...res,
              checkSaleErrorMessage: null,
            },
          });
          if (res?.checkSaleErrorMessage) {
            swalAlert(res.checkSaleErrorMessage);
          }
        }
      })
      .catch((err) => {
        const allInfo = {
          ...(order?.orderPriceFinalVO || {}),
          ...order,
          orderEntryVOS: order?.orderEntryVOS?.map((p) => ({
            ...(p?.orderPriceFinalVO || {}),
            ...p,
          })),
        };
        openModal({ allInfo, readOnly: true });
        if (err?.message) {
          swalAlert(err.message);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }

  return (
    <Button
      waitType="throttle"
      wait={500}
      funcType="flat"
      color="primary"
      loading={submitLoading}
      onClick={() => {
        fetchAgainOrder();
      }}
      className="primary-link text-overflow"
      style={{ marginTop: '8px' }}
      title={intl.get('mallf.myOrder.view.editOrder').d('修改订单')}
    >
      {intl.get('mallf.myOrder.view.editOrder').d('修改订单')}
    </Button>
  );
}

export default OrderAgain;
