import React from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import BudgetInfo from 'components/NewBudgetInfo';

function Budget(props) {
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

export default cuxComponent({ path: 'BeforeCompanyOrder/Budget' })(Budget);
