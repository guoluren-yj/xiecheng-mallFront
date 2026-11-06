import BudgetInfo from './components/ProductDetail/BudgetInfo';
import BuyNow from './components/ProductDetail/BuyNow';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';
import OrderDetailNeededDateHeader from './components/OrderDetail/NeededDate/Header';
import OrderDetailNeededDateContent from './components/OrderDetail/NeededDate/Content';
import CartBudget from './components/Cart/Budget';
import { gotoBuyNow } from './functions/ProductDetail';
import { validateWechat, changeOrderData } from './functions/BeforeCompanyOrder';
import { productInfoStatus } from './functions/Order';
import { getBudgetColumns, getButtons } from './functions/Cart';

export default {
  'SRM-SDC': {
    tenantName: '水滴筹',
    functions: {
      'ProductDetail-fn-gotoBuyNow': gotoBuyNow,
      'BeforeCompanyOrder-fn-validateWechat': validateWechat,
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
      'SubOrderLine-fn-productInfoStatus': productInfoStatus,
      'NewBudgetInfo-fn-getBudgetColumns': getBudgetColumns,
      'NewBudgetInfo-fn-getButtons': getButtons,
    },
    components: {
      'ProductDetail/productInfo/BudgetInfo': BudgetInfo,
      'ProductDetail/productInfo/BuyNow': BuyNow,
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
      'OrderDetail/NeededDate/Header': OrderDetailNeededDateHeader,
      'OrderDetail/NeededDate/Content': OrderDetailNeededDateContent,
    },
  },
};
