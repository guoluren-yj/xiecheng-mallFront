import dynamicImport from 'utils/dynamicImport';
import { submitValid } from './functions';

export default {
  'SRM-XTALPI': {
    tenantName: '深圳晶泰科技有限公司',
    functions: {
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValid,
        description: '校验预采申请中的所属公司与员工所属公司是否一致',
        number: 'ced-13832',
        version: '2026v0606', // 迭代版本
      },
    },
    components: {
      'ProductDetail/productInfo/SaleQuality': {
        component: dynamicImport(() => import('./components/SaleQuality')),
        description: '历史销量二开展示列表', // 需求描述
        number: 'mall-5198', // 需求号
        version: '2023v0610', // 迭代版本
      },
    },
    routers: [],
  },
};
