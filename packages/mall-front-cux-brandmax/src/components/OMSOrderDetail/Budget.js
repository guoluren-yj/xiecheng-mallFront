import React from 'react';
import BudgetInfo from '../BudgetInfo';

export default function Budget(props) {
  const { budgetData } = props;
  const budgetProps = {
    budgetData,
    disabled: true,
  };

  return <BudgetInfo {...budgetProps} />;
}
