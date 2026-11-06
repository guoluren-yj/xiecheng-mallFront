import {
  getFields,
  getValidateType,
  getNewBudget,
  getBudgetColumns,
  getButtons,
  getProductButtons,
  getBatchButtons,
} from './functions';
import CartBudget from './components/Budget';
import BeforeCompanyOrderBudget from './components/BeforeCompanyOrderBudget';

export default {
  'SRM-EPPEN': {
    tenantName: '伊品',
    functions: {
      'NewBudgetInfo-fn-getFields': getFields,
      'NewBudgetInfo-fn-getNewBudget': getNewBudget,
      'NewBudgetInfo-fn-getBudgetColumns': getBudgetColumns,
      'NewBudgetInfo-fn-getButtons': getButtons,
      'Cart/CartDataSet/getValidateType': {
        function: getValidateType,
        description: '不同成本中心，不同部门，不能一起勾选下单', // 需求描述
        version: '2022v0225', // 迭代版本
        number: 'mall-1631',
      },
      'BatchAllocation-fn-getButtons': {
        function: getBatchButtons,
        description: '隐藏分配新建行（商详/购物车)（批量）', // 需求描述
        version: '2022v0225', // 迭代版本
        number: 'mall-1631',
      },
      'ProductAllocation-fn-getButtons': {
        function: getProductButtons,
        description: '隐藏分配新建行（商详/购物车)（单条）', // 需求描述
        version: '2022v0225', // 迭代版本
        number: 'mall-1631',
      },
    },
    components: {
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/Budget': BeforeCompanyOrderBudget,
    },
    routers: [],
  },
};
