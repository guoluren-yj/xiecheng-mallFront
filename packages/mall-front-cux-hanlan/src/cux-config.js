import dynamicImport from 'utils/dynamicImport';

export default {
  'SRM-HANLAN': {
    functions: {},
    components: {
      'ProductDetail/productInfo/AddCart': {
        component: dynamicImport(() => import('./components/ProductDetail/AddCart')),
        description: '商详展示sap库存', // 需求描述
        number: 'srm-132629', // 需求号
        version: 'v0618', // 迭代版本
      },
    },
    routers: [],
  },
};
