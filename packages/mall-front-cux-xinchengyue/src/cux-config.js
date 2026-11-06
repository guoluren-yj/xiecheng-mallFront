import dynamicImport from 'utils/dynamicImport';
import EmptyComponent from 'components/EmptyComponent';
import { cuxHeaderList, allocationCreate, submitValid } from './functions';
import cuxTabTitle from './functions/cuxTabTitle';

export default {
  'SRM-XINCHENGYUE': {
    tenantName: '新城悦',
    functions: {
      'productDetail-fn-cuxHeaderList': cuxHeaderList,
      'productDetail-similarProduct-fn-cuxTabTitle': cuxTabTitle,
      'newCart-fn-allocationCreate': allocationCreate,
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValid,
        description: '提交订单二开调用校验接口', // 需求描述
        number: 'mall-6975', // 需求号
        version: '2023v0819', // 迭代版本
      },
    },
    components: {
      'ProductDetail/productInfo/AddCart': {
        component: dynamicImport(() => import('./components/ProductDetail/AddCart')),
        description: '商详展示sap库存', // 需求描述
        number: 'srm-132629', // 需求号
        version: 'v0618', // 迭代版本
      },
      // 'ProductDetail/productInfo/Allocation': {
      //   component: dynamicImport(() => import('./components/ProductDetail/Allocation')),
      //   description: '存在最低价商品隐藏商品分配', // 需求描述
      //   number: 'srm-141845', // 需求号
      //   version: '2022v0723', // 迭代版本
      // },
      'NewCart/BatchProductAllocation': {
        component: EmptyComponent,
        description: '隐藏购物车批量分配', // 需求描述
        version: '2022v0827', // 迭代版本
        number: 'mall-125',
      },
    },
    routers: [],
  },
};
