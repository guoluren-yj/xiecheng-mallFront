import dynamicImport from 'utils/dynamicImport';
import {
  loadCartDatas,
  getValidateType,
  handleProductData,
  getERPValidate,
  getBuyNowERPValidate,
} from './functions';

export default {
  'SRM-ISIMCERE': {
    tenantName: '先声药业',
    functions: {
      'Cart/CartDataSet/loadCartData': {
        function: loadCartDatas,
        description: '一般商品与团购商品不可同时提交', // 需求描述
        version: '2022v1112', // 迭代版本
        number: 'mall-1631',
      },
      'Cart/CartDataSet/getValidateType': {
        function: getValidateType,
        description: '一般商品与团购商品不可同时提交', // 需求描述
        version: '2022v1112', // 迭代版本
        number: 'mall-1631',
      },
      'productDetail-fn-handleProductData': {
        function: handleProductData,
        description: '商详获取团购信息', // 需求描述
        version: '2023v0114', // 迭代版本
        number: 'mall-3112',
      },
      'CartFooter-fn-beforeOrder': {
        function: getERPValidate,
        description: '下一步增加ERP库存校验', // 需求描述
        version: '2023v0114', // 迭代版本
        number: 'mall-3111',
      },
      'ProductDetail-fn-gotoNewBuyNow': {
        function: getBuyNowERPValidate,
        description: '立即购买增加ERP库存校验', // 需求描述
        version: '2023v0114', // 迭代版本
        number: 'mall-3111',
      },
    },
    components: {
      'ProductDetail/productInfo/AddCart': {
        component: dynamicImport(() => import('./components/AddCart')),
        description: '商详获取ERP库存-页面', // 需求描述
        version: '2022v1227', // 迭代版本
        number: 'mall-1630',
      },
    },
    routers: [],
  },
};
