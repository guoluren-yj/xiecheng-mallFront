import { handleAttributeVarchar1 } from './functions/index';

export default {
  'SRM-HLCX': {
    functions: {
      'address-modal-update-form': {
        function: handleAttributeVarchar1,
        description: '仓库地址带出', // 需求描述
        number: 'mall-10856', // 需求号
        version: '2024v0826', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
