import CartAddressLov from './components/Cart/AddressLov';
import AddressInfo from './components/ProductDeatil/AddressInfo';
import { changeOrderData, getPayUrl } from './functions/BeforeCompanyOrder';
import { layoutInit } from './functions/Layout';

export default {
  'SRM-DEDOU': {
    tenantName: '得豆',
    functions: {
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'BeforeCompanyOrder-fn-getPayUrl': getPayUrl,
      'Layout-fn-init': layoutInit,
    },
    components: {
      'Cart/AddressLov': CartAddressLov,
      'ProductDetail/productInfo/AddressInfo': AddressInfo,
    },
    routers: [],
  },
};
