import dynamicImport from 'utils/dynamicImport';
import { cuxUpdateCheckCate, cuxPreCheckCate, cuxSelectAll } from './functions';

export default {
  // 中航锂电
  'SRM-CALB': {
    tenantName: '中航锂电',
    functions: {
      'Cart-fn-cuxUpdateCheckCate': cuxUpdateCheckCate,
      'Cart-fn-cuxPreCheckCate': cuxPreCheckCate,
      'Cart-fn-cuxSelectAll': cuxSelectAll,
    },
    components: {
      'layout/Header/MenuBar/QuickLink': {
        component: dynamicImport(() => import('./components/QuickLink')),
        description: '中航锂电全部商品导出',
        number: 'srm-129620',
        version: '2022v0514',
      },
    },
    routers: [],
  },
};
