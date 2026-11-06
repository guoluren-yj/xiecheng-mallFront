import dynamicImport from 'utils/dynamicImport';
import EmptyComponent from 'components/EmptyComponent';
import { openUrlModal } from './functions';

export default {
  // 汇联易商城
  'SRM-ZHENHUI': {
    functions: {
      'BeforeCompanyOrder-fn-submitValid': {
        function: openUrlModal,
        description: '【汇联易商城】打包ECPO单号传递给甄汇，甄汇处理完后返回URL链接', // 需求描述
        number: 'mall-804', // 需求号
        version: '2022v1001', // 迭代版本
      },
    },
    components: {
      'OMSOrder/OMS/SubOrderHeader': {
        component: dynamicImport(() => import('./components/SubOrderHeader')),
        description: '汇联易单据展示二开-页面', // 需求描述
        number: 'mall-1323',
        version: '2022v1001', // 迭代版本
      },
      'OMSOrderDetail/AssociatedDoc': {
        component: dynamicImport(() => import('./components/AssociatedDoc')),
        description: '汇联易单据展示二开-页面', // 需求描述
        number: 'mall-1323',
        version: '2022v1001', // 迭代版本
      },
      'OMSOrderDetail/PurchaseOrderNum': {
        component: EmptyComponent,
        description: '汇联易单据展示二开-页面', // 需求描述
        number: 'mall-1323',
        version: '2022v1001', // 迭代版本
      },
    },
    routers: [],
  },
};
