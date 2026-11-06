import React from 'react';
import BudgetInfo from '../BudgetInfo';

export default function Budget(props) {
  const { budgetData } = props;
  // 山鹰 预算查询默认值需目录和价格字段 订单详情处理字段对应
  budgetData.latestPrice = budgetData.unitPrice;
  const budgetProps = {
    budgetData,
    disabled: true,
    remainingVisible: false,
  };

  return <BudgetInfo {...budgetProps} />;
}
