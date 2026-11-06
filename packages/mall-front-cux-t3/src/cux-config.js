import { handleInvChange, addLine } from './functions';

export default {
  'SRM-T3': {
    tenantName: 'T3出行',
    functions: {
      'OMSAddPurchaseApply-fn-handleInvChange': handleInvChange,
      'OMSAddPurchaseApply-fn-addLine': addLine,
    },
    components: {},
    routers: [],
  },
};
