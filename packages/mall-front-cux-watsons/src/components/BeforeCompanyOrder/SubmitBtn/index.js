import React, { useMemo, useState } from 'react';

import intl from 'utils/intl';
import Swal from 'components/swal';
import createOrderList from 'mall-front/lib/routes/BeforeCompanyOrder/SubmitBtn/createOrderList';
import PriceSureModal from './PriceSureModal';

export default function SubmitBtn(props) {
  const [visible, setVisible] = useState(false);
  const {
    submitLoading,
    disabled,
    orderData,
    miniAmountFlag,
    setOrderData,
    setSubmitLoading,
    headerCode,
    eCLineCode,
    cataLineCode,
    isOMS,
    history,
  } = props;

  const list = useMemo(() => orderData.filter((order) => order.price >= 2500), [orderData]);
  const freightList = useMemo(
    () => orderData.filter((order) => order.price < (order.lowFreePostPrice || 0)),
    [orderData]
  );
  const minOrderAmountList = useMemo(
    () => orderData.filter((order) => [1, 2].includes(order.minOrderAmountControl)),
    [orderData]
  );

  const createOrder = () => {
    const errList = [];
    const runCreateOrder = () => {
      createOrderList({
        orderData,
        miniAmountFlag,
        setOrderData,
        setSubmitLoading,
        headerCode,
        eCLineCode,
        cataLineCode,
        isOMS,
        history,
      });
    };
    orderData.forEach((m) => {
      m.purchaseHeaderForm?.validateFields((err) => {
        errList.push(err);
      });
    });
    if (errList.some((n) => !!n)) {
      Swal(intl.get(`mallf.companyOrder.model.watsons.fieldNotNull`).d('请填写必填字段！'));
      return false;
    }
    if (orderData.length > 100) {
      Swal(
        `根据您的拆单规则，购物车选中的商品拆分的订单超过了${100}个，提交后可能处理超时。建议您退回购物车重新选择，是否退回购物车？`,
        true
      ).then((result) => {
        if (result.value) {
          history.push({
            pathname: '/cart',
          });
        } else {
          runCreateOrder();
        }
      });
      return false;
    }
    runCreateOrder();
  };

  return (
    <>
      <a
        onClick={() => {
          if (list.length > 0 || freightList.length > 0 || minOrderAmountList.length > 0) {
            setVisible(true);
          } else {
            createOrder();
          }
        }}
        disabled={disabled}
      >
        {intl.get(`mallf.common.submit.createReqPurchase`).d('提交采购申请')}
      </a>
      <PriceSureModal
        submitLoading={submitLoading}
        orderData={orderData}
        createOrder={createOrder}
        list={list}
        freightList={freightList}
        minOrderAmountList={minOrderAmountList}
        visible={visible}
        toggleModal={() => setVisible(!visible)}
      />
    </>
  );
}
