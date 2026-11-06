import { basketBeforeSubmit } from './functions/cartFooter';
import { getBasketColumns, setDemanderDataSetSelectable } from './functions/index';

export default {
  'SRM-LONGSYS': {
    functions: {
      'cart-pro-submit-fn-cuxFlag': {
        function: basketBeforeSubmit,
        description: '【江波龙】加入拼单时候增加审批流——功能开发', // 需求描述
        number: 'cdp-126929', // 需求号
        version: '2025v0920', // 迭代版本
      },
      'cart-pro-fn-getBasketColumns': {
        function: getBasketColumns,
        description: '【江波龙】加入拼单时候增加审批流——功能开发', // 需求描述
        number: 'cdp-126929', // 需求号
        version: '2025v1101', // 迭代版本
      },
      'cart-pro-fn-demanderDataSetSelectable': {
        function: setDemanderDataSetSelectable,
        description: '【江波龙】加入拼单时候增加审批流——功能开发', // 需求描述
        number: 'cdp-126929', // 需求号
        version: '2025v1101', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
