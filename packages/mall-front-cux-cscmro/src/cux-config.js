import EmptyComponent from 'mall-front/lib/components/EmptyComponent';
import CustomizeModal from './components/BeforeCompanyOrder/CustomizeModal';
import CustomizeModalLineDs from './components/BeforeCompanyOrder/CustomizeModal/lineDs';
import FillInfo from './components/OMSOrderDetail/FillInfo';
import CartBudget from './components/Cart/Budget';
import { queryDefaultBudget } from './functions/cartBudget';
import { preReqOrderJump } from './functions/cart';
import Remark from './components/BeforeCompanyOrder/Remark';
import { CustomizeHeaderInfoInit, handleCartSanctionNumberData } from './functions/index.js';

export default {
  'SRM-CSCMRO': {
    tenantName: '松下',
    functions: {
      'cart-bulk-budget-allocation': queryDefaultBudget,
      'Cart-fn-preReqOrderJump': preReqOrderJump, // srm-103646
      'BeforeCompanyOrder-fn-init': {
        function: CustomizeHeaderInfoInit,
        description: '松下 存储决裁号', // 需求描述
        number: 'mall-7458', // 需求号
        version: '2023v0923', // 迭代版本
      },
      'Cart-fn-handleCartBudgetData': {
        function: handleCartSanctionNumberData,
        description: '松下二开 下一步小决裁号校验', // 需求描述
        number: 'mall-9848', // 需求号
        version: '2024v0511', // 迭代版本
      },
    },
    components: {
      'BeforeCompanyOrder/CustomizeModal': CustomizeModal,
      'Cart/Budget': CartBudget,
      'BeforeCompanyOrder/PreviewBtn': EmptyComponent,
      'OMSOrderDetail/FillInfo': FillInfo,
      'BeforeCompanyOrder/CustomizeModal/lineDs': CustomizeModalLineDs,
      'BeforeCompanyOrder/ProductList/Remark': Remark,
    },
    routers: [],
  },
};
