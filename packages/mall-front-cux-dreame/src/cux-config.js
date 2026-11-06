import dynamicImport from 'utils/dynamicImport';

export default {
  'SRM-DREAME': {
    functions: {},
    components: {
      'NewBeforeOrder/CustomizeModal/DefaultForm': {
        component: dynamicImport(() => import('./components/CustomizeModal/DefaultForm')),
        description: 'OMS商城预采购申请界面批量编辑', // 需求描述
        number: 'mall-4530', // 需求号
        version: '2023v0401', // 迭代版本
      },
      'NewBeforeOrder/ProductListOperate': {
        component: dynamicImport(() => import('./components/ProductListOperate')),
        description: 'OMS商城预采购申请界面批量编辑', // 需求描述
        number: 'mall-4530', // 需求号
        version: '2023v0401', // 迭代版本
      },
    },
    routers: [],
  },
};
