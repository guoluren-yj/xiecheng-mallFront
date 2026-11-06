import CartBudget from './components/Cart/Budget';
import Budget from './components/BeforeCompanyOrder/Budget';
import OMSOrderBugdet from './components/OMSOrderDetail/Budget';
import { handleBudget, handleCartBudgetData } from './functions/Cart';
import { promisGetInvoice, invoiceCheckData, confirmSwal } from './functions/BeforeCompanyOrder';

export default {
  'SRM-BRANDMAX': {
    tenantName: '电声',
    components: {
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/Budget': Budget,
      'OMSOrderDetail/CheckBudgetInfo': OMSOrderBugdet,
    },
    functions: {
      'Cart-fn-handleBudget': handleBudget,
      'Cart-fn-handleCartBudgetData': handleCartBudgetData,
      'BeforeCompanyOrder-fn-promisGetInvoice': promisGetInvoice,
      'BeforeCompanyOrder-fn-invoiceCheckData': invoiceCheckData,
      'BeforeCompanyOrder-fn-confirmSwal': confirmSwal,
    },
    routers: [],
  },
};
