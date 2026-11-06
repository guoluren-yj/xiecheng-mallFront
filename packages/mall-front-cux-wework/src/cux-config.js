// import ProductList from './components/BeforeCompanyOrder/ProductList';
import { initOrderData } from './functions/BeforeCompanyOrder';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';

export default {
  'SRM-WEWORK': {
    tenantName: 'wework',
    functions: {
      'BeforeCompanyOrder-fn-init': initOrderData,
    },
    components: {
      // 'BeforeCompanyOrder/ProductList': ProductList,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
    },
    routers: [],
  },
};
