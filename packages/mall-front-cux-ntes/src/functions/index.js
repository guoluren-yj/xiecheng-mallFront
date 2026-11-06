import { useEffect } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import request from 'utils/request';
import { fetchMyRequestListService } from 'services/openCartMyRequestService';

export function getValidateType() {
  const dataSet = this;
  if (dataSet.getState('cartViewType') === 1) {
    return {
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
  } else {
    return {
      LINE_costCenter: intl
        .get('mallf.cart.view.chooseSame.costCodeProduct')
        .d('只能选择相同成本中心的商品！'),
      LINE_purchaseType_value: intl
        .get('mallf.cart.view.chooseSame.prTypeProduct')
        .d('只能选择相同申请类型的商品！'),
      LINE_costBearing_value: intl
        .get('mallf.cart.view.chooseSame.costBearing')
        .d('只能选择相同费用承担公司的商品！'),
      LINE_costProduct_value: intl
        .get('mallf.cart.view.chooseSame.costProduct')
        .d('只能选择相同产品段的商品！'),
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
  }
}

export function initPreDs({ formDs, orderData = {} }) {
  function removeAttributeVarchar13({ name }) {
    if (name === 'attributeVarchar7') {
      formDs.current.set('attributeVarchar13', null);
    }
  }
  function handleFieldValueList(type, fieldCode) {
    const list = orderData.openOrderInfo.orderLineList.reduce((pre, curr) => {
      const filedList = type === 'head' ? curr.headerValueList : curr.lineValueList;
      const { value } = (filedList || []).find((n) => n.dimensionCode === fieldCode) || {};
      if (value) pre.push(value);
      return pre;
    }, []);
    return JSON.stringify(list);
  }
  function setFormData() {
    const costBearingIdList = handleFieldValueList('line', 'costBearingId'); // 费用承担公司
    const purposeList = handleFieldValueList('head', 'purpose'); // 用途
    const lineUnit = handleFieldValueList('line', 'unitCode'); // 部门
    formDs.current.set({
      itemCatagroyList: JSON.stringify(
        orderData.openOrderInfo.orderLineList.map((line) => line.itemCategoryId).filter(Boolean)
      ),
      lineUnit,
      costBearingIdList,
      purposeList,
    });
  }
  useEffect(() => {
    if (orderData.openOrderInfo) {
      formDs.addEventListener('load', setFormData);
      formDs.addEventListener('update', removeAttributeVarchar13);
    }
    return () => {
      formDs.removeEventListener('load', setFormData);
      formDs.removeEventListener('update', removeAttributeVarchar13);
    };
  }, []);
}

export async function queryData(params = {}) {
  const { userId, tenantId } = getUserConfigInfo();
  this.status = 'loading';
  this.requestCode = params.requestCode || '';
  const { size, number } = this.pagination;
  const newPara = {
    userId,
    lineFlag: true,
    size,
    page: number,
    mallStatusGroupCode: this.currentStatus,
    ...params,
  };
  try {
    const res = await fetchMyRequestListService(newPara);
    const { content, ...pagination } = res;
    let res1 = [];
    if (!isEmpty(content)) {
      res1 = await request(
        `/marmot/v1/${tenantId}/marmot-api/m78rbcib9JsrA9cyW4CGKNObPvHwhhzr4FlShug8D5gkEFxl5aklcAcgqDg5lczWR`,
        {
          method: 'POST',
          body: JSON.stringify(content.map((n) => n.requestId)),
        }
      );
    }
    const newData = (content || []).map((n) => {
      // 1-不显示；2-未评价；3-已评价
      const { flag, templateType } = res1.find((m) => m.requestId === n.requestId) || {};
      return {
        ...n,
        templateType,
        flag: Number(flag),
        editFlag: +flag === 2,
      };
    });
    this.loadData(newData);
    this.pagination = pagination;
  } finally {
    this.status = 'ready';
  }
}
