import dynamicImport from 'utils/dynamicImport';
import hideDeleteCompare from './functions/hideDeleteCompare';
import { cacheProducts, addProductPrice, getCartParams } from './functions/searchAutoCompare';

export default {
  'SRM-ONEFOSUN': {
    tenantName: '上海一链企业管理有限公司',
    functions: {
      'hide-delete-compare-fn': {
        function: hideDeleteCompare,
        description: '【一链网】购物车页面隐藏比价单删除按钮', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-2970',
      },
      'search-fn-cacheProducts': {
        function: cacheProducts,
        description: '加入购物车&立即购买性能问题-1112新加二开引起(商品数据缓存)', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-2731',
      },
      'search-fn-addPrice': {
        function: addProductPrice,
        description: '加入购物车&立即购买性能问题-1112新加二开引起(价格信息添加)', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-2731',
      },
      'addCart-fn-getParams': {
        function: getCartParams,
        description: '加入购物车&立即购买性能问题-1112新加二开引起(加购参数构造)', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-2731',
      },
    },
    components: {
      'CartProCopy/CompareOrderDetail': {
        component: dynamicImport(() => import('./components/CompareOrderDetail')),
        description: '隐藏比价单单选框、提示以及确定按钮部分', // 需求描述
        version: '2022v1112', // 迭代版本
        number: 'mall-1544',
      },
      'CartProCopy/renderer/CompareIcon': {
        component: dynamicImport(() => import('./components/CompareIcon')),
        description: '【一链网】商品的比价单需要根据商品数量判断后续审批流程规则', // 需求描述
        version: '2022v1112', // 迭代版本
        number: 'mall-1548',
      },
    },
    routers: [],
  },
};
