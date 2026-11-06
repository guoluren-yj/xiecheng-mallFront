import React from 'react';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { budgetData, budgetSelectList, saveCallBack, batchFlag = false } = props;

  const budgetList = [
    {
      budgetItemCode: 'categoryId',
      budgetItemId: 113,
      budgetItemName: '品类',
      componentType: 'LOV',
      displayField: 'categoryIdMeaning',
      documentType: 'PRE_PR',
      enabledFlag: 1,
      fieldName: 'categoryId',
      gridSeq: 20,
      gridWidth: 300,
      id: 113,
      lovCode: 'HPFM.COST_CENTER',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
      title: '品类',
      valueField: 'categoryId',
    },
    {
      budgetItemCode: 'expenseType',
      budgetItemId: 111,
      budgetItemName: '费用类型',
      componentType: 'SELECT',
      documentType: 'PRE_PR',
      enabledFlag: 1,
      fieldName: 'expenseType',
      gridSeq: 10,
      gridWidth: 300,
      id: 111,
      lovCode: 'SSTA.CHARGE_TYPE_YPD',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
    },
    {
      budgetItemCode: 'costCenter',
      budgetItemId: 115,
      budgetItemName: '成本中心',
      componentType: 'LOV',
      displayField: 'costName',
      documentType: 'PRE_PR',
      enabledFlag: 1,
      fieldName: 'costCenter',
      gridSeq: 30,
      gridWidth: 200,
      id: 115,
      lovCode: 'HPFM.COST_CENTER',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
      title: '成本中心',
      valueField: 'costId',
    },
  ];

  const budgetProps = {
    budgetData,
    // 预算批量分配 不展示品类字段
    budgetList: batchFlag
      ? budgetList.filter((i) => i.budgetItemCode !== 'categoryId')
      : budgetList,
    budgetSelectList,
    saveCallBack,
    batchFlag,
    alwayShow: true,
  };

  return <BudgetInfo {...budgetProps} />;
}
