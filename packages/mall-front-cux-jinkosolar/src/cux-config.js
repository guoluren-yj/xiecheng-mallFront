import dynamicImport from 'utils/dynamicImport';
import { getStockValidate, getBuyNowValidate, setListNewProduct, showInfo } from './function';

export default {
  'SRM-JINKOSOLAR': {
    tenantName: '晶科能源',
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getStockValidate,
        description: '晶科二开校验库存', // 需求描述
        number: 'mall-9173',
        version: '2024v0224', // 迭代版本
      },
      'AllocationModal-fn-gotoNewBuyNow': {
        function: getBuyNowValidate,
        description: '立即购买时校验库存数量', // 需求描述
        number: 'mall-9173',
        version: '2024v0224', // 迭代版本
      },
      'ProductList-fn-setNewProduct': {
        function: setListNewProduct,
        description: '晶科 商品卡片添加【贸易方式】维度', // 需求描述
        number: 'feature-cdp-98946', // 需求号
        version: '2025v0329', // 迭代版本
      },
      'ProductCard-fn-showMoreInfo': {
        function: showInfo,
        description: '晶科 商品卡片添加【贸易方式】维度', // 需求描述
        number: 'feature-cdp-98946', // 需求号
        version: '2025v0329', // 迭代版本
      },
    },
    components: {
      'NewProductDetail/ProductParam/ValidDay': {
        component: dynamicImport(() => import('./components/ValidDay')),
        description: '二开价格有效期颜色', // 需求描述
        number: 'mall-7436',
        version: '2023v0923', // 迭代版本
      },
    },
    routers: [],
  },
};
