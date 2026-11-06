import React from 'react';
import { getUserConfigInfo } from 'utils/utils';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { budgetData, budgetList, budgetSelectList, saveCallBack, batchFlag } = props;
  const { itemId } = !batchFlag && budgetData;
  const { userId } = getUserConfigInfo();
  const newBudgetList = budgetList.map((budget) => {
    const { tenantId, lovCode } = budget;
    let queryParams = { tenantId };
    // 水滴筹预算科目二开(批量预算不传)
    if (lovCode === 'SCUX.SD.BUDGET_ACCOUNT' && batchFlag) {
      queryParams = { tenantId, itemId };
    }
    if (lovCode === 'SCUX.SD_SBUD_UNIT') {
      queryParams = { tenantId, userId };
    }
    return { ...budget, queryParams };
  });
  const budgetProps = {
    budgetData,
    budgetList: newBudgetList,
    budgetSelectList,
    saveCallBack,
    batchFlag: false,
  };
  return <BudgetInfo {...budgetProps} />;
}
