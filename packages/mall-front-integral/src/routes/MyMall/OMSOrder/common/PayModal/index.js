import React from 'react';
import { sum } from 'lodash';
import { Modal, Button } from 'choerodon-ui';

import { numberRender, gotoPayUrl } from 'utils/utils';
import Image from 'components/Image';

import intl from 'utils/intl';
import { toPayServise } from 'services/orderCenterService';
import useSetState from 'hooks/useState';
import style from './index.less';

export default function PayModal(props) {
  const { visible, toggleModal, checkedPayList } = props;

  const [state, setState] = useSetState({
    loading: false,
  });

  // 批量支付
  const handleBatchPay = () => {
    setState({ loading: true });
    toPayServise({
      returnUrl: `${window.location.origin}/payment-result`,
      paymentOrderDTOList: checkedPayList.map((p) => ({
        orderId: p.orderId,
        objectVersionNumber: p.objectVersionNumber,
      })),
    })
      .then((res) => {
        gotoPayUrl(res);
      })
      .finally(() => {
        setState({ loading: false });
      });
  };

  return (
    <>
      <Modal
        title={intl.get('mallf.common.confirm.payment').d('确认支付')}
        className={style.content}
        visible={visible}
        width={560}
        onCancel={() => toggleModal()}
        footer={[
          <Button
            style={{ width: 72, height: 32 }}
            key="submit"
            type="primary"
            onClick={handleBatchPay}
            loading={state.loading}
          >
            去支付
          </Button>,
          <Button style={{ width: 72, height: 32 }} key="back" onClick={() => toggleModal()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
        ]}
      >
        <p className="content-info">
          确认批量支付以下{checkedPayList.length}个订单，应付总金额:{' '}
          <span className="price-color" style={{ fontSize: 14 }}>
            {numberRender(sum(checkedPayList.map((p) => p.totalAmount)))}
          </span>
        </p>

        {checkedPayList.map((l) => {
          return (
            <div className="line-item">
              <span>
                {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：{l.orderCode}
              </span>

              <div className="line-product-imgs">
                {l.orderEntryVOS.slice(0, 5).map((p) => {
                  return (
                    <Image value={p.primaryUrl} width={28} height={28} style={{ marginLeft: 5 }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </Modal>
    </>
  );
}
