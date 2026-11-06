import { CustomizeHeaderInfoInit } from './functions';

export default {
  'SRM-LHKJ': {
    tenantName: '联化科技股份有限公司',
    functions: {
      'NewBeforeOrder--fn-CustomizeHeaderInfo-init': {
        function: CustomizeHeaderInfoInit,
        description: '商城单点登录拼接流程id', // 需求描述
        number: 'mall-7425', // 需求号
        version: '2023v0923', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
