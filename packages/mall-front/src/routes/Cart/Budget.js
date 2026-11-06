import React from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import BudgetInfo from 'components/NewBudgetInfo';

function Budget(props) {
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

export default cuxComponent({ path: 'Cart/Budget' })(Budget);
