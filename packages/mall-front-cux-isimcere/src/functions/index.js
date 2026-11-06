import { cloneDeep, isEmpty } from 'lodash';
import React from 'react';
import intl from 'utils/intl';
import { getOpenCartFlag } from 'utils/configUtils';
import { getOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { groupField } from 'mall-front/lib/routes/CartProCopy/enum';
import loadCartData from 'mall-front/lib/routes/CartProCopy/loadCartData';
import { Modal, Icon } from 'choerodon-ui/pro';

import style from './index.less';

export function loadCartDatas(list, setting = {}) {
  const { needCheck, checkAll, fetchSingle } = setting || {};
  const dataSet = this;
  const isCheckChoose = dataSet.getState('checkCartChoosed') === 1;
  const selectSku = dataSet.selected.map((p) => p.toData());
  let newList = (cloneDeep(list) || []).map((n) => {
    const { labelList = [] } = n || {};
    return {
      ...(n || {}),
      labelCode: labelList[0]?.labelCode,
    };
  });
  if (isCheckChoose && fetchSingle) {
    // 勾上查看已选
    newList = newList.filter((cart) => selectSku.some((line) => line.cartId === cart.cartId));
    if (dataSet.getState('cartViewType') !== 1) {
      newList.forEach((cart, i) => {
        newList[i].cartColumnValueList = cart.cartColumnValueList.filter((p) => {
          const currentLines = selectSku.filter((line) => line.cartId === cart.cartId);
          return currentLines.some(
            (line) => line.headerNum === p.headerNum && line.lineNum === p.lineNum
          );
        });
      });
    }
  }
  const lastResp = this.cartResp || {};
  loadCartData(this, { ...lastResp, content: newList });
  // 购物车数据变更，重新计算底部维度
  const lastScroll = dataSet.getState('startScroll') || 0;
  // 用于底部监听计算滚动deps
  dataSet.setState('startScroll', lastScroll + 1);
  if (checkAll) {
    dataSet.batchSelect(dataSet.records);
  } else if (needCheck) {
    dataSet.batchSelect(
      dataSet.records.filter((r) => {
        return (
          !r.get(groupField.groupFlag) &&
          selectSku.some((p) => {
            return dataSet.getState('cartViewType') === 1 || !getOpenCartFlag()
              ? p.cartId === r.get('cartId')
              : p[groupField.__cartId] === r.get(groupField.__cartId);
          })
        );
      })
    );
  }
}

export function getValidateType() {
  if (getOpenCartFlag()) {
    return {
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
      labelCode: intl
        .get('mallf.cart.view.chooseSameLabelCode')
        .d('一般商品与团购商品不可同时提交，请重新选择'),
    };
  }
  return {
    labelCode: intl
      .get('mallf.cart.view.chooseSameLabelCode')
      .d('一般商品与团购商品不可同时提交，请重新选择'),
    centralizedFlag: intl
      .get('mallf.cart.view.chooseSameRuleProduct')
      .d('只能选择相同业务类型的商品'),
    receiveFlag: intl
      .get(`mallf.cart.view.porduct.chooseSameReceive`)
      .d('领用商品和采购商品不可同时勾选！'),
    currencyCode: intl
      .get(`mallf.common.view.porduct.chooseSameCurrency`)
      .d('只能选择相同币种的商品！'),
  };
}

export function handleProductData(props) {
  const { setProductData, labelList, productData } = props;
  if (!isEmpty(labelList) && labelList[0].labelCode === '2000') {
    const url = `/marmot/v1/${getOrganizationId()}/marmot-api/dZlzppGVFxH8WEXteIJ4SDGdtY91SP491YeLToYk7P0?skuId=${
      productData?.productId
    }`;
    request(url).then((res) => {
      if (res) {
        setProductData((data) => ({
          ...data,
          attributeBigint10: data?.attributeBigint10 ?? '-',
          sumOriginalQuantity: res?.sumOriginalQuantity ?? '-',
          isTgFlag: 1,
        }));
      }
    });
  }
}

function openModal(props) {
  const { ERPList, ...other } = props;
  const { productName, erpStock, difference } = ERPList[0] || {}; // 显示第一个
  return Modal.open({
    destroyOnClose: true,
    mask: true,
    className: style['modal-tips-name'],
    closable: false,
    style: { width: 560 },
    movable: false,
    autoCenter: true,
    border: false,
    title: (() => {
      return (
        <>
          <Icon type="error" style={{ color: '#FF9500' }} />
          {intl.get('mallf.common.view.change.warning').d('温馨提示')}
        </>
      );
    })(),
    children: (
      <>
        <div>
          {intl
            .get('mcux.common.isimcere.message.erpConfirm', {
              valueA: productName,
              valueB: erpStock,
              valueC: difference,
            })
            .d(
              `${productName}当前库存为${erpStock}，有${difference}部分待备货，备货周期约10-20天，请确认是否继续下单`
            )}
        </div>
      </>
    ),
    ...other,
  });
}

const getERPlist = (data) => {
  const ERPList = [];
  // 双层循环遍历
  data.orderList.forEach((i) => {
    i.orderLineList.forEach((item) => {
      // 不存在productName 则push
      const { lineCustomizedList, productName, productId } = item?.orderLineValue || {};
      const getValue = (code) => {
        return lineCustomizedList?.find((p) => p.dimensionCode === code)?.value;
      };
      const erpStock = getValue('erpStock');
      const difference = getValue('difference');
      if (
        Number(getValue('checkErpStock')) === 1 &&
        !ERPList.some((p) => p.productId === productId)
      ) {
        ERPList.push({
          productId,
          productName,
          erpStock,
          difference,
        });
      }
    });
  });
  return ERPList;
};

export function getERPValidate(props) {
  const { res, successCallback } = props;
  const ERPList = getERPlist(res);
  if (ERPList.length) {
    openModal({
      ERPList,
      onOk: async () => {
        return successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}

export function getBuyNowERPValidate(props) {
  const { resp, orderData } = props;
  const ERPList = getERPlist(resp);
  if (ERPList.length) {
    openModal({
      ERPList,
      onOk: async () => {
        props.history.push({
          pathname: '/before-order',
          data: { orderData, preData: resp.orderList },
        });
      },
    });
  } else {
    props.history.push({
      pathname: '/before-order',
      data: { orderData, preData: resp.orderList },
    });
  }
}
