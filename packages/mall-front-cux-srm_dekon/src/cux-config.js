import dynamicImport from 'utils/dynamicImport';
import getNeededDate from './components/NeedDate';
import { handleCheckCartData, handleAfterUpdateOrganization } from './functions';
import ImportBtn from './components/ImportBtn';

export default {
  SRM_DEKON: {
    functions: {
      'Cart-fn-handleCartBudgetData': {
        function: handleCheckCartData,
        description: '【德康】放开目录禁用的时候企业商城里面无法添加商品到购物车的限制', // 需求描述
        number: 'mall-8766', // 需求号
        version: '2024v0113', // 迭代版本
      },
      'Cart-fn-AfterUpdateOrganization': {
        function: handleAfterUpdateOrganization,
        description: '【德康】商城预采申请实时调取erp库存相关数据展示', // 需求描述
        number: 'cdp-99971', // 需求号
        version: '2025v0329', // 迭代版本
      },
    },
    components: {
      'cart/CartCount': {
        component: dynamicImport(() => import('./components/CartCount')),
        description: '【德康】商品ERP库存量展示', // 需求描述
        number: 'mall-209', // 需求号
        version: '2022v0827', // 迭代版本
      },
      'BeforeCompanyOrder/ProductList/NeedDate': {
        component: getNeededDate,
        description: '【德康】增加运费', // 需求描述
        number: 'mall-8509', // 需求号
        version: '2024v0113', // 迭代版本
      },
      'routes/Cart/ImportBtn': {
        component: ImportBtn,
        description: '【德康】商城预采申请实时调取erp库存相关数据展示', // 需求描述
        number: 'cdp-99971', // 需求号
        version: '2025v0329', // 迭代版本
      },
    },
    routers: [],
  },
};
