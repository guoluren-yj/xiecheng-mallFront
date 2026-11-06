import CustomizeHeaderInfoDefaultForm from './components/BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';
// import { changeOrderData } from './functions/BeforeCompanyOrder';
import { changeBaseInfoField } from './functions/PurchaseRequest';
import OMSOrderDetailNeededDateHeader from './components/OMSOrderDetail/NeededDate/Header';
import OMSOrderDetailNeededDateContent from './components/OMSOrderDetail/NeededDate/Content';
// import QuickLink from './components/Home/QuickLink';

export default {
  'SRM-BSL': {
    tenantName: '博实乐',
    functions: {
      // 'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'PurchaseRequest-fn-changeBaseInfoField': changeBaseInfoField,
    },
    components: {
      'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm': CustomizeHeaderInfoDefaultForm,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
      'OMSOrderDetail/NeededDate/Header': OMSOrderDetailNeededDateHeader,
      'OMSOrderDetail/NeededDate/Content': OMSOrderDetailNeededDateContent,
    },
    routers: [
      {
        path: '/add-purchase',
        component: () => import('./routes/OMSApplication'),
      },
    ],
  },
};
