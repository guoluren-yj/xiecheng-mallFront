import React from 'react';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { disabled, budgetData, budgetList = [], budgetSelectList, saveCallBack } = props;
  const budgetProps = {
    disabled,
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
  };
  return <BudgetInfo {...budgetProps} />;
}
