/* eslint-disable no-param-reassign */
// 下一步，预采
import React from 'react';
import { Icon, Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { openComfirmModal, openNotLowestTipsModal, openCartLowPriceModal } from 'utils/modals';
import { getPrimaryColor } from 'utils/utils';
import { preReqOrderService } from 'services/newCartService';
import ReceiveOverDetail from '../ReceiveOverDetail';
import { respCallback, splitArray, getSortCartList, cartToJSONData } from '../func';
import CuxFn from '@/cuxTools/cuxFn';

// 商品提示
function Message(props) {
  const { data = [] } = props;
  return data.slice(0, 3).map((n) => {
    return (
      <>
        【
        <span
          style={{
            display: 'inline-block',
            maxWidth: '100px',
            verticalAlign: 'bottom',
          }}
          className="text-overflow"
          title={n.productName}
        >
          {n.productName}
        </span>
        】
      </>
    );
  });
}

// 领用children
function ReceiveTip(props) {
  const { cartList } = props;
  const [currentSku, continueSku] = splitArray(cartList, (f) => f.noErrorFlag === 0);
  return (
    <>
      <span>
        {intl.get('mallf.cart.view.currentToatl').d('当前共有')}
        <b>{currentSku.length}</b>
        <Popover
          content={<ReceiveOverDetail data={currentSku} />}
          placement="bottomLeft"
          overlayClassName="price-detail-popver"
          overlayStyle={{ width: 400 }}
        >
          <Icon
            style={{
              fontSize: 12,
              marginTop: -2,
              cursor: 'pointer',
              color: getPrimaryColor(),
            }}
            type="find_in_page"
          />
        </Popover>
      </span>
      <span>
        {intl
          .getHTML('mallf.cart.view.receiveOver.confirm', {
            value: continueSku.length,
          })
          .d(
            <span>
              件商品已选数量超过领用数量限制，请确认其余
              <b>{continueSku.length}</b>件商品是否继续生成采购申请
            </span>
          )}
      </span>
    </>
  );
}

// 库存children
function StockTip(props) {
  const { cartList } = props;
  const stockOverProduct = cartList.filter((m) => m.errorCode === 'STOCK_OUT');
  return (
    <span>
      {intl.get('mallf.common.view.product').d('商品')}
      <Message data={stockOverProduct} />
      {stockOverProduct.length > 3 ? intl.get('mallf.cart.view.stockMore').d('等') : ''}
      {intl
        .get('mallf.cart.view.stockOver.confirm')
        .d('选择数量已超出当前库存量，请确认其余商品是否继续预生成采购申请？')}
    </span>
  );
}

// 赠品提示
function GiftTip(props) {
  const { cartList } = props;
  const giftOverProduct = cartList.filter((m) => +m.productGiftStockFlag === 1);
  return (
    <span>
      {intl.get('mallf.common.view.product').d('商品')}
      <Message data={giftOverProduct} />
      {giftOverProduct.length > 3 ? intl.get('mallf.cart.view.stockMore').d('等') : ''}
      {intl.get('mallf.cart.view.giftOver.confirm').d('赠品已送完，请确认是否继续生成采购申请？')}
    </span>
  );
}

// 购物车商品重置
// 2、预采申请失败的商品,需要放到最顶上
// 标准商品通过cartId,pounchOut通过qtHeaderNo
function sortCart(dataSet, respList) {
  dataSet.cartData.forEach((product) => {
    const errorProduct = respList.find((p) => p.cartId === product.cartId);
    if (errorProduct) {
      product.errorCode = errorProduct?.errorCode;
      product.errorMessage = errorProduct?.errorMessage;
    }
  });
  if (dataSet.getState('checkCartChoosed') === 1) {
    const checkData = dataSet.cartData.filter((n) =>
      (dataSet.toData() || []).some((m) => m.cartId === n.cartId)
    );
    dataSet.loadCartData(checkData, {
      needCheck: true,
    });
  } else {
    // 回填购物车顶部商品
    const errList = dataSet.cartData.filter((p) =>
      respList.some((r) => r.cartId === p.cartId && r.errorMessage)
    );
    const newCartList = getSortCartList(dataSet.cartData, errList);
    dataSet.loadCartData(newCartList, { needCheck: true });
  }
}

export default function settleAccounts(ds, selectSku, successCallback) {
  const dataSet = ds;
  let preReqSku = ds.getCheckedCartData(cartToJSONData(selectSku));
  async function preReqOrder(params) {
    // 三生
    const cuxNextFlag = await CuxFn({
      name: 'open-cart-next-tips-modal',
      value: { successCallback, dataSet, params },
    })();
    if (!cuxNextFlag) return;
    if (params) {
      dataSet.status = 'loading';
      try {
        const res = await preReqOrderService(params);
        if (res) {
          const { cartList = [], success } = res;
          // 领用、库存校验
          respCallback(res, [
            {
              field: 'receiveOutFlag',
              value: 1,
              callback: () => {
                openComfirmModal({
                  title: intl.get('mallf.cart.view.receiveOver.title').d('领用上限提示'),
                  border: false,
                  children: <ReceiveTip cartList={cartList} />,
                  onOk: () => {
                    preReqSku = cartList.filter((n) => n.noErrorFlag !== 0);
                    preReqOrder(preReqSku);
                  },
                  onCancel: () => {
                    sortCart(dataSet, cartList);
                  },
                });
              },
            },
            {
              field: 'stockOutFlag',
              value: 1,
              callback: () => {
                openComfirmModal({
                  title: intl.get('mallf.cart.view.stockOver.title').d('超出库存提示'),
                  border: false,
                  children: <StockTip cartList={cartList} />,
                  onOk: () => {
                    preReqSku = cartList.filter((m) => !m.errorCode);
                    preReqOrder(preReqSku);
                  },
                  onCancel: () => {
                    sortCart(dataSet, cartList);
                  },
                });
              },
            },
            {
              field: 'productGiftStockFlag',
              value: 1,
              callback: () => {
                openComfirmModal({
                  title: intl.get('mallf.common.view.prompt').d('提示'),
                  border: false,
                  children: <GiftTip cartList={cartList} />,
                  onOk: () => {
                    preReqOrder(params);
                  },
                  onCancel: () => {
                    sortCart(dataSet, cartList);
                  },
                });
              },
            },
            {
              field: 'lowestPriceFlag',
              value: 1,
              callback: () => {
                // 最低价弱校验则弹窗
                openCartLowPriceModal({
                  res,
                  onOk: () => {
                    const newPreReqSku = preReqSku.map((item) => ({ ...item, confirmFlag: 1 }));
                    preReqOrder(newPreReqSku);
                  },
                });
              },
            },
            {
              field: 'success',
              value: 0,
              callback: () => {
                CuxFn({
                  name: 'open-company-address-tips-modal',
                  value: { res, preReqSku, preReqOrder },
                })();
                // 弱校验则弹窗
                openNotLowestTipsModal({
                  res,
                  onOk: () => {
                    const newPreReqSku = preReqSku.map((item) => ({ ...item, confirmFlag: 1 }));
                    preReqOrder(newPreReqSku);
                  },
                });
              },
            },
          ]);
          // 无弹窗提示
          if (success === 1) {
            // 二开下一步校验
            CuxFn({
              name: 'CartFooter-fn-beforeOrder',
              value: { res, successCallback, sortCart, dataSet },
            })(successCallback)(res);
          } else {
            sortCart(dataSet, cartList);
          }
        }
      } finally {
        dataSet.status = 'ready';
      }
    }
  }
  preReqOrder(preReqSku);
}
