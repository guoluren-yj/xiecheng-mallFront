import CustomizeHeaderInfoDefaultForm from './components/BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';
import { changeOrderData } from './functions/beforeCompanyOrder.js';
import alertEmptyInfoTips from './functions/alertEmptyInfoTips';

export default {
  'SRM-LUXSHAREICT': {
    tenantName: '立讯精密',
    functions: {
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'useUserConfig-fn-alertEmptyInfoTips': alertEmptyInfoTips,
    },
    components: {
      'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm': CustomizeHeaderInfoDefaultForm,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
    },
    routers: [],
  },
};
