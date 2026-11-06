// import EmptyComponent from 'components/EmptyComponent';
import dynamicImport from 'utils/dynamicImport';
import CartBudget from './components/Cart/Budget';
import Budget from './components/BeforeCompanyOrder/Budget';
import OMSOrderBugdet from './components/OMSOrderDetail/Budget';
import { changeOrderData, addOrderApprover } from './functions/BeforeCompanyOrder';

export default {
  'SRM-RUIJIE': {
    tenantName: '锐捷',
    functions: {
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'OMS-orderList-fn-initData': addOrderApprover,
    },
    components: {
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/Budget': Budget,
      'OMSOrderDetail/CheckBudgetInfo': OMSOrderBugdet,
      'MyMall/OMSOrder/OMS/OrderComponent/ApprovePerson': dynamicImport(() =>
        import('./components/OMSOrderDetail/ApprovePerson')
      ),
    },
    routers: [],
  },
};
