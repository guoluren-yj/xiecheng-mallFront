import { getFields, getBudgetColumns, getButtons } from './functions';

export default {
  'SRM-QSCHOU': {
    tenantName: '轻松筹',
    functions: {
      'NewBudgetInfo-fn-getFields': getFields,
      'NewBudgetInfo-fn-getBudgetColumns': getBudgetColumns,
      'NewBudgetInfo-fn-getButtons': getButtons,
    },
    components: {},
    routers: [],
  },
};
