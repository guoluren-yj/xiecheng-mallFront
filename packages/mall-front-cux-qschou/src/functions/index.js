import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

export function getFields({ fields, batchFlag }) {
  const newFields = fields.map((field) => {
    if (field.name === 'budgetAccountNumLov') {
      return {
        ...field,
        dynamicProps: {
          disabled: () => !batchFlag,
        },
      };
    } else {
      return field;
    }
  });
  return newFields;
}

export function getBudgetColumns({ columns }) {
  return columns.filter((column) => column.name !== 'remainingBudget');
}

const addButton = (handleCreate, productId) => {
  const SMPC = '/smpc';
  const orgnizationId = getCurrentOrganizationId();
  const handleResult = () => {
    request(`${SMPC}/v1/${orgnizationId}/catalogs/fetch-catalog?skuId=${productId}`).then((res) => {
      handleCreate({
        budgetAccountNumMeaning: res.attributeBigint1Meaning,
        budgetAccountNum: res.attributeBigint1Num,
      });
    });
  };

  return (
    <Button icon="add" onClick={() => handleResult()}>
      {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
    </Button>
  );
};

export function getButtons({ handleCreate, productId }) {
  return [addButton(handleCreate, productId), 'delete'];
}
