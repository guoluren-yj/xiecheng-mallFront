import React, { useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getOpenCartFlag } from 'utils/configUtils';

/* eslint-disable no-param-reassign */
export function getFields({ fields, product }) {
  const newFields = fields.map((p) => {
    if (p.name === 'unitLov') {
      return {
        ...p,
        transformResponse: (_, record) => {
          return record.unitLov;
        },
      };
    }
    if (p.name === 'costCenterLov') {
      return {
        ...p,
        dynamicProps: {
          lovPara: ({ record }) => {
            const { unitId } = record.get('unitLov') || {};
            return { unitId };
          },
        },
      };
    } else if (p.name === 'categoryLov') {
      return {
        ...p,
        dynamicProps: {
          lovPara: () => {
            return { catalogId: product.catalogId };
          },
        },
      };
    } else {
      return p;
    }
  });
  newFields.push({
    name: 'unitId',
    bind: 'unitLov.unitId',
  });
  newFields.push({
    name: 'costId',
    bind: 'costCenterLov.costId',
  });
  return newFields;
}

export function getNewBudget({ budgetList, newBudget, record }) {
  // 找出预算维度字段
  budgetList.forEach((n) => {
    const { fieldName } = n;
    newBudget[fieldName] = record.get(fieldName);
    newBudget[`${fieldName}Meaning`] = record.get(`${fieldName}Meaning`);
    if (fieldName === 'unit') {
      newBudget.unitId = record.get('unitId');
    }
    if (fieldName === 'costCenter') {
      newBudget.costId = record.get('costId');
    }
  });
}

export function getBudgetColumns({ columns }) {
  return columns.filter((column) => column.name !== 'action');
}

export const getButtons = ({ tableDs, handleCreate }) => {
  const [update, setUpdate] = useState(true);
  const addButton = (
    <Button
      icon="add"
      onClick={() => {
        handleCreate();
        setUpdate(!update);
      }}
    >
      {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
    </Button>
  );
  return tableDs.length === 0 ? [addButton, 'delete'] : [];
};

export function getValidateType(_record) {
  if (getOpenCartFlag()) {
    const dataSet = this;
    const validaTypes = {
      linkType: (record) => {
        const validateSkuType = this.getSkuSourceMeaning(record.toData());
        const selectedSkuType = this.getSkuSourceMeaning(dataSet.selected[0]?.toData() || {});
        return intl
          .get(`mallf.common.view.porduct.chooseSameLink`, {
            newType: validateSkuType,
            oldType: selectedSkuType,
          })
          .d(`${validateSkuType}商品和${selectedSkuType}商品不可同时勾选！`);
      },
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
    const record = _record || dataSet.selected[0] || dataSet.get(0);
    if (record && record.get('linkType') === 'ORDER') {
      validaTypes.receiveFlag = intl
        .get(`mallf.cart.view.porduct.chooseSameReceive`)
        .d('领用商品和采购商品不可同时勾选！');
    }
    return validaTypes;
  }
  return {
    centralizedFlag: intl
      .get('mallf.cart.view.chooseSameRuleProduct')
      .d('只能选择相同业务类型的商品'),
    receiveFlag: intl
      .get(`mallf.cart.view.porduct.chooseSameReceive`)
      .d('领用商品和采购商品不可同时勾选！'),
    currencyCode: intl
      .get(`mallf.common.view.porduct.chooseSameCurrency`)
      .d('只能选择相同币种的商品！'),
    LINE_CC: intl
      .get('mcux.common.view.chooseSame.costCodeProduct')
      .d('只能选择相同成本中心的商品！'),
    LINE_DEP: intl.get('mcux.common.view.chooseSame.depProduct').d('只能选择相同部门的商品！'),
  };
}

export function getBatchButtons() {
  return [];
}

export function getProductButtons() {}
