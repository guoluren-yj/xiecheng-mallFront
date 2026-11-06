import { setQueryCartParams, setQueryCartUi, setNextStepValidation } from './functions/index';

export default {
  'SRM-SINOFUSE': {
    functions: {
      'CartProCopy-fn-extendHeaderBtns': {
        function: setQueryCartUi,
        description: '【中熔】购物车查询条件ui', // 需求描述
        number: 'cro-2148', // 需求号
        version: '2026v0606', // 迭代版本
      },
      'CartProCopy-fn-queryCartParams': {
        function: setQueryCartParams,
        description: '【中熔】购物车查询条件补充', // 需求描述
        number: 'cro-2148', // 需求号
        version: '2026v0606', // 迭代版本
      },
      'open-cart-next-tips-modal': {
        function: setNextStepValidation,
        description: '【中熔】购物车提交下一步校验', // 需求描述
        number: 'cro-2148', // 需求号
        version: '2026v0606', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
