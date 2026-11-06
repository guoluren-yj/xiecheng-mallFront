import React, { useEffect } from 'react';
import { isEmpty } from 'lodash';
import BudgetInfo from '../BudgetInfo';

export default function Budget(props) {
  const { budgetData, saveCallBack, batchFlag = false } = props;

  useEffect(() => {
    if (!isEmpty(budgetData.brandmaxBudgetInfoList) && !batchFlag) {
      const param = [
        {
          ...budgetData,
          budgetInfoList: budgetData.brandmaxBudgetInfoList.map((p) => ({
            budget: JSON.stringify(p),
            budgetId: p.projectId,
            cartId: p.cartId,
          })),
        },
      ];
      saveCallBack(param);
    }
  }, []);

  const budgetProps = {
    budgetData,
    saveCallBack,
    batchFlag,
  };

  return <BudgetInfo {...budgetProps} />;
}
