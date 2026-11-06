import { remarkRequireCux, fieldsCux, columnsCux } from './functions';

export default {
  'SRM-LZLJ': {
    tenantName: '泸州老窖',
    functions: {
      'BeforeCompanyOrder-fn-remarkRequireCux': remarkRequireCux,
      'ProductsCompare-fn-fieldsCux': fieldsCux,
      'ProductsCompare-fn-columnsCux': columnsCux,
    },
    components: {},
    routers: [],
  },
};
