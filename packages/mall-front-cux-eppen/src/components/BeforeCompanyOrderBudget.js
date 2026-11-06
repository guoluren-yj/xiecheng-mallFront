import React from 'react';
import BudgetInfo from 'components/NewBudgetInfo';

export default function Budget(props) {
  const { disabled, budgetData, budgetSelectList, saveCallBack } = props;

  const budgetList = [
    {
      budgetItemCode: 'unit',
      budgetItemId: 113,
      budgetItemName: '部门',
      componentType: 'LOV',
      displayField: 'unitName',
      documentType: 'PRE_PR',
      enabledFlag: 1,
      fieldName: 'unit',
      gridSeq: 20,
      gridWidth: 300,
      id: 113,
      lovCode: 'SCUX.EPPEN.BUDGET_DEPT',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
      tenantId: 8772,
      title: '部门',
      valueField: 'unitCode',
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
      lovCode: 'SCUX.EPPEN.UNIT_COST_CENTER',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
      tenantId: 8772,
      title: '成本中心',
      valueField: 'costCode',
    },
    {
      budgetItemCode: 'category',
      budgetItemId: 116,
      budgetItemName: '品类',
      componentType: 'LOV',
      displayField: 'mappingDataName',
      documentType: 'PRE_PR',
      enabledFlag: 1,
      fieldName: 'category',
      gridSeq: 40,
      gridWidth: 300,
      id: 116,
      lovCode: 'SCUX.EPPEN.CATALOG_MAPPING_CATEGORY',
      multipleFlag: 0,
      parentId: 0,
      queryFlag: 0,
      requiredFlag: 1,
      tenantId: 8772,
      title: '品类',
      valueField: 'mappingDataCode',
    },
  ];

  const budgetProps = {
    disabled,
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
    alwayShow: true,
  };
  return <BudgetInfo {...budgetProps} />;
}
