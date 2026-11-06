import { getFields, handleCartBudgetData } from './functions';
import CartBudget from './components/Budget';
import NeedDate from './components/NeedDate';

export default {
  // 优品道
  'SRM-YOPDO': {
    tenantName: '优品道',
    functions: {
      'NewBudgetInfo-fn-getFields': getFields,
      'Cart-fn-handleCartBudgetData': handleCartBudgetData,
    },
    components: {
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
    },
    routers: [],
  },
};
