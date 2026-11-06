import dynamicImport from 'utils/dynamicImport';

import { getFields, getNewBudget, getBudgetColumns } from './functions';
import { changeOrderData, attachmentRender } from './functions/BeforeCompanyOrder';
import CustomizeModalDefaultForm from './components/CustomizeModal/DefaultForm';
import CustomizeModalLineDs from './components/CustomizeModal/lineDs';
import CustomizeHeaderInfoDefaultForm from './components/CustomizeHeaderInfo/DefaultForm';

export default {
  'SRM-AEONLIFE': {
    tenantName: '百年人寿',
    functions: {
      'NewBudgetInfo-fn-getFields': getFields,
      'NewBudgetInfo-fn-getNewBudget': getNewBudget,
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'NewBudgetInfo-fn-getBudgetColumns': getBudgetColumns,
      'BeforeCompanyOrder-fn-attachmentRender': attachmentRender,
    },
    components: {
      'BeforeCompanyOrder/CustomizeModal/DefaultForm': CustomizeModalDefaultForm,
      'BeforeCompanyOrder/CustomizeModal/lineDs': CustomizeModalLineDs,
      'OMSOrderDetail/MovingBillNum': {
        component: dynamicImport(() => import('./components/MovingBillNum')),
        description: '关联单据-新增动支单号', // 需求描述
        number: 'srm-67935', // 需求号
        version: '2021v0703', // 迭代版本
      },
      'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm': CustomizeHeaderInfoDefaultForm,
    },
    routers: [],
  },
};
