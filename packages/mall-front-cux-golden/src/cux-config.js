import { layoutInit, CustomizeHeaderInfoInit, submitValidate } from './functions';

export default {
  'SRM-GOLDEN': {
    tenantName: '高顿教育',
    functions: {
      'Layout-fn-init': {
        function: layoutInit,
        description: '【高顿教育】商城预采购申请存储OA Request ID', // 需求描述
        number: 'mall-5728', // 需求号
        version: '2023v0610', // 迭代版本
      },
      'NewBeforeOrder--fn-CustomizeHeaderInfo-init': {
        function: CustomizeHeaderInfoInit,
        description: '【高顿教育】商城预采购申请存储OA Request ID', // 需求描述
        number: 'mall-5728', // 需求号
        version: '2023v0610', // 迭代版本
      },
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValidate,
        description: '【高顿教育】预采提交校验OA requestId', // 需求描述
        number: 'mall-5728', // 需求号
        version: '2023v0610', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
