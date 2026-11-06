import React from 'react';
import { Modal, Button } from 'choerodon-ui';

import Image from 'components/Image';
import intl from 'utils/intl';
import style from './index.less';

export default function PayModal(props) {
  const {
    visible,
    toggleModal,
    list,
    freightList,
    minOrderAmountList,
    createOrder,
    orderData,
    submitLoading,
  } = props;
  // minOrderAmountControl 0正常 1弱管控 2强管控
  const minOrderAmountMessage = minOrderAmountList.some((n) => n.minOrderAmountControl === 2)
    ? `以下${minOrderAmountList.length}个采购申请单您订购的商品订单金额小于最低采购金额,禁止提交,请凑齐采购额再下单`
    : `以下${minOrderAmountList.length}个采购申请单您订购的商品订单金额小于最低采购金额,请评估是否需要增加订货量`;
  const footer = minOrderAmountList.some((n) => n.minOrderAmountControl === 2)
    ? [
      <Button style={{ width: 72, height: 32 }} key="back" onClick={() => toggleModal()}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      ]
    : [
      <Button
        style={{ width: 72, height: 32 }}
        key="submit"
        type="primary"
        onClick={createOrder}
        loading={submitLoading}
      >
          确认提交
      </Button>,
      <Button style={{ width: 72, height: 32 }} key="back" onClick={() => toggleModal()}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      ];

  return (
    <>
      <Modal
        title={intl.get('mallf.common.confire.submit.apply').d('确认提交采购申请')}
        className={style.content}
        visible={visible}
        width={560}
        onCancel={() => toggleModal()}
        footer={footer}
      >
        {list.length > 0 && (
          <>
            <p className="content-info">
              以下{list.length}个采购申请单含税金额超过2500，请确认是否属于固定资产：
              <br />
              若是写字楼员工发起，属于固定资产请检查是否已经填好CE编号，未填CE请补填后再提交
              <br />
              若是店铺员工发起，请取消采购申请，联系对应写字楼同事发起，否则会计入店铺/部门费用
            </p>
            {list.map((order) => {
              const index = orderData.findIndex(
                (n) => n.preRequestOrderNumber === order.preRequestOrderNumber
              );
              return (
                <div className="line-item">
                  <span>采购申请单{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  <div className="line-product-imgs">
                    {order.shoppingCartDTOList.slice(0, 5).map((p) => {
                      return (
                        <Image
                          value={p.imagePath}
                          width={28}
                          height={28}
                          style={{ marginLeft: 5 }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
        {freightList.length > 0 && (
          <>
            <p className="content-info" style={{ marginTop: 20 }}>
              以下{freightList.length}
              个采购申请单订购的商品订单金额还没到达可包邮金额（
              {Math.min(...freightList.map((n) => n?.lowFreePostPrice))}
              元），需要额外计算运费，请评估是否需要增加订货量
            </p>
            {freightList.map((order) => {
              const index = orderData.findIndex(
                (n) => n.preRequestOrderNumber === order.preRequestOrderNumber
              );
              return (
                <div className="line-item">
                  <span>采购申请单{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  <div className="line-product-imgs">
                    {order.shoppingCartDTOList.slice(0, 5).map((p) => {
                      return (
                        <Image
                          value={p.imagePath}
                          width={28}
                          height={28}
                          style={{ marginLeft: 5 }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
        {minOrderAmountList.length > 0 && (
          <>
            <p className="content-info" style={{ marginTop: 20 }}>
              {minOrderAmountMessage}
            </p>
            {minOrderAmountList.map((order) => {
              const index = orderData.findIndex(
                (n) => n.preRequestOrderNumber === order.preRequestOrderNumber
              );
              return (
                <div className="line-item">
                  <span>采购申请单{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  <span style={{ paddingLeft: 15 }}>（最低采购金额{order?.minOrderAmount}元）</span>
                  <div className="line-product-imgs">
                    {order.shoppingCartDTOList.slice(0, 5).map((p) => {
                      return (
                        <Image
                          value={p.imagePath}
                          width={28}
                          height={28}
                          style={{ marginLeft: 5 }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Modal>
    </>
  );
}
