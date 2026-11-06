import { cuxAppendBtn, beforeSaveFunc } from './functions/index';

export default {
  'SRM-TIGERMED': {
    functions: {
      'newCart-fn-cuxAppendBtn': {
        function: cuxAppendBtn,
        description: '泰格 手工数据更新按钮', // 需求描述
        number: 'mall-11845', // 需求号
        version: '2025v0111', // 迭代版本
      },
      'AllocationModal-fn-beforeSaveFunc': {
        function: beforeSaveFunc,
        description: '泰格 手工保存计算金额', // 需求描述
        number: 'mall-11845', // 需求号
        version: '2025v0111', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
