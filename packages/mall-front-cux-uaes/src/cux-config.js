import dynamicImport from 'utils/dynamicImport';

export default {
  'SRM-UAES': {
    functions: {},
    components: {
      'NewProductDetail/ProductParam/OtherInfo': {
        component: dynamicImport(() => import('./components/ProductOtherInfo')),
        description: '【联合电子】商城展示合同付款阶段', // 需求描述
        number: 'mall-10904',
        version: '2024v0824', // 迭代版本
      },
    },
    routers: [],
  },
};
