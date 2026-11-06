import dynamicImport from 'utils/dynamicImport';
import { getAttachmentRequired } from './functions/index';

export default {
  // 上海家化
  'SRM-JH': {
    functions: {
      'BeforeCompanyOrder-fn-remarkRequireCux': {
        function: getAttachmentRequired,
        description: '【上海家化】三级目录控制预采头字段必输', // 需求描述
        version: '2025v0222', // 迭代版本
        number: 'mall-12068',
      },
    },
    components: {
      'NewCart/BatchProductAllocation': {
        component: dynamicImport(() => import('./components/CartPro/BatchProductAllocation')),
        description: '批量分配二开带出组织信息以及展示预算余额-页面', // 需求描述
        number: 'mall-937',
        version: '2022v1001', // 迭代版本
      },
    },
    routers: [],
  },
};
