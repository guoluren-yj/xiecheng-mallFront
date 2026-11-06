import dynamicImport from 'utils/dynamicImport';

export default {
  // 特步
  'SRM-XTEP': {
    functions: {},
    components: {
      'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm': {
        component: dynamicImport(() => import('./components/HeadDefaultForm')),
        description: '特步 头预算联动行预算', // 需求描述
        version: '2023v0819', // 迭代版本
        number: 'mall-7033',
      },
      'BeforeCompanyOrder/CustomizeModal/DefaultForm': {
        component: dynamicImport(() => import('./components/DefaultForm')),
        description: '特步 行预算个性化批量同步', // 需求描述
        version: '2023v0819', // 迭代版本
        number: 'mall-7033',
      },
    },
    routers: [],
  },
};
