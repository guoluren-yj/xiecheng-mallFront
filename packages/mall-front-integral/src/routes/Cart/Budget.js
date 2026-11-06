import React from 'react';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { budgetData, budgetList, budgetSelectList, saveCallBack, batchFlag = false } = props;
  const budgetProps = {
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
    batchFlag,
  };
  return <BudgetInfo {...budgetProps} />;
}
