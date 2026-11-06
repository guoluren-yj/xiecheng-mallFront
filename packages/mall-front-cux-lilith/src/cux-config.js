import { getValidateType } from './functions';

export default {
  'SRM-LILITH': {
    tanantName: '莉莉丝',
    functions: {
      'Cart/CartDataSet/getValidateType': {
        function: getValidateType,
        description: '购物车申请类型勾选限制', // 需求描述
        version: '2023v0114', // 迭代版本
        number: 'mall-3183',
      },
    },
    components: {},
    routers: [],
  },
};
