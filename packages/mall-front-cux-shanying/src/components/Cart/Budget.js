import React from 'react';
import BudgetInfo from '../BudgetInfo';

export default function Budget(props) {
  const { budgetData, saveCallBack, batchFlag = false, labels = {} } = props;

  const budgetProps = {
    budgetData,
    saveCallBack,
    batchFlag,
    labels,
  };

  return <BudgetInfo {...budgetProps} />;
}
