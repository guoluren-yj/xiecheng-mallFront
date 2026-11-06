import React from 'react';
import BudgetInfo from '../BudgetInfo';

export default function Budget(props) {
  const { disabled, budgetData } = props;
  const budgetProps = {
    budgetData,
    disabled,
  };

  return <BudgetInfo {...budgetProps} />;
}
