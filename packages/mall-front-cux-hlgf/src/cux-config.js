import dynamicImport from 'utils/dynamicImport';
import { afterQueryPrepare } from './functions/index';

export default {
  'SRM-HLGF': {
    tenantName: '海亮股份',
    functions: {
      'prepare-fn-afterQueryPermission': {
        function: afterQueryPrepare,
        description: '无源商品隐藏立即购买',
        number: 'mall-5230',
        version: '2023v0506', // 迭代版本
      },
    },
    components: {
      'ProductDetail/productInfo/BuyNow': {
        component: dynamicImport(() => import('./components/BuyNow')),
        description: '无源商品隐藏立即购买',
        number: 'mall-5230',
        version: '2023v0506', // 迭代版本
      },
    },
    routers: [],
  },
};
