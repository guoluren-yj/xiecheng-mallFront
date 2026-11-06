import CustomizeHeaderInfoDefaultForm from './components/BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm';
import OtherInfo from './components/OMSOrderDetail/OtherInfo';
import { fetchCurrency, cuxAddLine, getUnit, renderItemLov } from './functions';

export default {
  'SRM-DONLIM': {
    tenantName: '新宝',
    functions: {
      'AddPurchaseApply-OMS-fn-fetchCurrency': fetchCurrency,
      'OMSAddPurchaseApply-fn-addLine': cuxAddLine,
      'AddPurchaseApply-OMS-fn-getUnit': getUnit,
      'OMSAddPurchaseApply-fn-renderItemLov': renderItemLov,
    },
    components: {
      'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm': CustomizeHeaderInfoDefaultForm,
      'OMSOrderDetail/OtherInfo': OtherInfo,
    },
    routers: [],
  },
};
