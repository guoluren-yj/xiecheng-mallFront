import React from 'react';
import classNames from 'classnames';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';

function openModal({ res, ...other }) {
  const { cartList = [] } = res || {};
  const list = cartList.reduce((pre, curr) => {
    const flag = pre.find((n) => n.itemCode === curr.itemCode);
    if (curr.checkWarehouseFlag && !flag) {
      pre.push(curr);
    }
    return pre;
  }, []);
  const ds = new DataSet({
    selection: false,
    paging: false,
    primaryKey: 'itemCode',
    data: list,
  });
  const columns = [
    {
      name: 'itemCode',
      header: '物料编码',
    },
    {
      name: 'itemName',
      header: '物料名称',
    },
    {
      name: 'checkWarehouseName',
      header: '所在库房',
    },
    {
      name: 'checkWarehouseQuantity',
      header: '滞留库存',
    },
  ];
  openComfirmModal({
    title: intl.get('mallf.common.view.prompt').d('提示'),
    border: false,
    children: (
      <>
        <p style={{ marginBottom: 15 }}>以下物料有领用商品，请走OA领用申请!点击确认则继续提交</p>
        <Table columns={columns} dataSet={ds} />
      </>
    ),
    ...other,
  });
}

function getStockFlag(res) {
  const { cartList = [] } = res || {};
  return cartList.some((n) => n.checkWarehouseFlag === 1);
}

export function getStockValidate(props) {
  const { res, successCallback, sortCart, dataSet } = props;
  const { cartList = [] } = res;
  const flag = getStockFlag(res);
  if (flag) {
    openModal({
      res,
      onOk: () => successCallback(res),
    });
  } else if (cartList.some((order) => order?.errorMessage === '商品到期截止天数小于45天')) {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      closable: false,
      children: <>商品到期截止天数小于45天，请问是否继续</>,
      onOk: () => {
        successCallback(res);
      },
      onCancel: () => {
        sortCart(dataSet, cartList);
      },
    });
  } else {
    successCallback(res);
  }
}

export function getBuyNowValidate(props) {
  const { resp, orderData, history } = props;
  const flag = getStockFlag(resp);
  if (flag) {
    openModal({
      res: resp,
      onOk: () => {
        history.push({
          pathname: '/before-order',
          data: { orderData, preData: resp.orderList },
        });
      },
    });
  } else {
    history.push({
      pathname: '/before-order',
      data: { orderData, preData: resp.orderList },
    });
  }
}

export function setListNewProduct({ newProduct, saleList }) {
  const { productId } = newProduct || {};
  const { attributeVarchar6 } = saleList?.find((s) => productId === s.skuId) || {};
  return {
    ...newProduct,
    attributeVarchar6,
  };
}

export function showInfo({ product }) {
  const { attributeVarchar6 } = product || {};
  if (!attributeVarchar6) return null;
  return (
    <div className={classNames({ '.text-overflow': true, 'width-max': true })}>
      <span className="buy-quality text-overflow" title="贸易方式：:">
        贸易方式：<strong>{attributeVarchar6}</strong>
      </span>
    </div>
  );
}
