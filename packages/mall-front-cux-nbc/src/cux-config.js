import { getProductValidate } from './functions/index';

export default {
  'SRM-NBC': {
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getProductValidate,
        description: '诺斯贝尔 二开弱校验提示', // 需求描述
        number: 'mall-8758',
        version: '2024v0113', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
