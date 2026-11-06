import { attachmentRequireCux } from './functions';

export default {
  'SRM-CAOCAO': {
    tenantName: '曹操出行',
    functions: {
      'BeforeCompanyOrder-fn-remarkRequireCux': attachmentRequireCux,
    },
    components: {},
    routers: [],
  },
};
