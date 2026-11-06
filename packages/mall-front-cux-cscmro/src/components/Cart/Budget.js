import React from 'react';
import { getUserConfigInfo } from 'utils/utils';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { budgetData, budgetList, budgetSelectList, saveCallBack, batchFlag } = props;
  const { companyId } = getUserConfigInfo();
  const newBudgetList = budgetList.map((budget) => {
    const { tenantId } = budget;
    return { ...budget, queryParams: { tenantId, companyId } };
  });
  const budgetProps = {
    budgetData,
    budgetList: newBudgetList,
    budgetSelectList,
    saveCallBack,
    batchFlag,
  };
  return <BudgetInfo {...budgetProps} />;
}
