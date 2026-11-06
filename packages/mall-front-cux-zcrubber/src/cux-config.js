import dynamicImport from 'utils/dynamicImport';
import { confirmSwal } from './functions/index.js';
import NeedDate from './components/NeedDate.js';

export default {
  'SRM-ZCRUBBER': {
    tenantName: '中策橡胶',
    functions: {
      'BeforeCompanyOrder-fn-confirmSwal': {
        function: confirmSwal,
        description: '【中策】二开商城预采申请提交时增加库存校验', // 需求描述
        number: 'mall-10866', // 需求号
        version: '2024v0824', // 迭代版本
      },
    },
    components: {
      'Layout/Header/TopBar/UserList': {
        component: dynamicImport(() => import('./components/UserList')),
        description: '【中策橡胶】商城页面隐藏退出按钮', // 需求描述
        number: 'srm-92679', // 需求号
        version: '2021v1030', // 迭代版本
      },
      'BeforeCompanyOrder/ProductList/NeedDate': {
        component: NeedDate,
        description: '【中策】二开商城预采申展示库存', // 需求描述
        number: 'mall-10866', // 需求号
        version: '2024v0824', // 迭代版本
      },
    },
    routers: [],
  },
};
