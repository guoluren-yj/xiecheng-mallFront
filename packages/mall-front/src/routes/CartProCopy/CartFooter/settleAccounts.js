/* eslint-disable no-param-reassign */
// 下一步，预采
import React from 'react';
import { isEmpty } from 'lodash';
import { Icon, Popover } from 'choerodon-ui';

import CuxFn from '@/cuxTools/cuxFn';
import intl from 'utils/intl';
import { openComfirmModal, openNotLowestTipsModal, openCartLowPriceModal } from 'utils/modals';
import { getPrimaryColor } from 'utils/utils';
import { openCartPreReqOrderService } from 'services/newCartService';
import ReceiveOverDetail from '../ReceiveOverDetail';
import { respCallback, splitArray, getSortCartList, cartToJSONData } from '../func';

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
  if (dataSet.basketType === 'order') {
    // 下单人聚合，没有cartId,额外处理
    sortOrderCart(dataSet, respList);
    return false;
  }
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
  dataSet.status = 'loading';
  let preReqSku = ds.getCheckedCartData(cartToJSONData(selectSku));
  if (dataSet.basketType === 'order') {
    // 下单人下单 将明细的商品拆出来去提交
    preReqSku = preReqSku?.reduce((pre, cur) => [...pre, ...cur?.cartDTOList], []) || [];
  }
  async function preReqOrder() {
    if (!isEmpty(preReqSku)) {
      try {
        const res = await openCartPreReqOrderService(preReqSku);
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
                    dataSet.status = 'loading';
                    preReqOrder();
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
                  onOk: async () => {
                    preReqSku = cartList.filter((m) => !m.errorCode);
                    dataSet.status = 'loading';
                    preReqOrder();
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
                    dataSet.status = 'loading';
                    preReqOrder();
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
                    preReqSku = cartList.map((item) => ({ ...item, confirmFlag: 1 }));
                    preReqOrder();
                  },
                });
              },
            },
            {
              field: 'success',
              value: 0,
              callback: () => {
                CuxFn({
                  name: 'CartFooter-fn-cuxConfirmModal',
                  value: { res },
                })();
                // 弱校验则弹窗
                openNotLowestTipsModal({
                  res,
                  onOk: () => {
                    preReqSku = cartList.map((item) => ({ ...item, confirmFlag: 1 }));
                    preReqOrder();
                  },
                });
              },
            },
          ]);
          // 无弹窗提示
          if (success === 1) {
            // 二开新购物车下一步校验
            CuxFn({
              name: 'CartFooter-fn-openCart-beforeOrder',
              value: { res, successCallback, dataSet },
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
  preReqOrder();
}

function isBasketOrderEqual(p1, p2) {
  return p1.productId === p2.productId && p1.centralizedTemplateId === p2.centralizedTemplateId;
}

// 购物车商品重置
function sortOrderCart(dataSet, respList) {
  dataSet.cartData.forEach((product) => {
    // 下单人聚合，cartId随机生成，故取报错的相同商品相同活动的报错信息
    const cartDTOList = respList.filter((p) => isBasketOrderEqual(p, product)) || [];
    // 处理更新报错 且回写报错针对多行
    const errorProduct =
      cartDTOList?.length <= 1 || cartDTOList.some((p) => !!p.headErrorFlag)
        ? cartDTOList?.[0]
        : {
            errorCode: 'MULTI_ERROR',
            errorMessage: intl
              .get('mallf.cart.view.basketOrder.multiError')
              .d('数据校验不通过，请点击拼单明细查看拼单行'),
          };
    if (errorProduct) {
      product.errorCode = errorProduct?.errorCode;
      product.errorMessage = errorProduct?.headErrorFlag
        ? errorProduct?.headErrorMessage
        : errorProduct?.errorMessage; // 聚合的头报错
    }
    if (!isEmpty(cartDTOList)) {
      // 更新cartDTOList用于保存明细商品行errorMessage
      product.cartDTOList = cartDTOList;
    }
  });
  if (dataSet.getState('checkCartChoosed') === 1) {
    const checkData = dataSet.cartData.filter((n) =>
      (dataSet.toData() || []).some((m) => isBasketOrderEqual(m, n))
    );
    dataSet.loadCartData(checkData, {
      needCheck: true,
    });
  } else {
    // 回填购物车顶部商品
    const errList = dataSet.cartData.filter((p) =>
      respList.some((r) => isBasketOrderEqual(r, p) && r.errorMessage)
    );
    const newCartList = getSortCartList(dataSet.cartData, errList, isBasketOrderEqual);
    dataSet.loadCartData(newCartList, { needCheck: true });
  }
}
