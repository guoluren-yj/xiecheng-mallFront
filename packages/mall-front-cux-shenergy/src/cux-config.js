import dynamicImport from 'utils/dynamicImport';

import { initOrderData, filterInvoice } from './functions';
import marketPrice from './components/productDetail/marketPrice';

export default {
  // 申能
  'SRM-SHENERGY': {
    description: ['需求日期二开'],
    tenantName: '申能',
    functions: {
      'BeforeCompanyOrder-fn-init': initOrderData,
      'sigl/BeforeOrder/mockData': {
        function: filterInvoice,
        description: '针对申能会员购，二开去掉专票的选项', // 需求描述
        number: 'srm-130441', // 需求号
        version: 'v0618', // 迭代版本
      },
    },
    components: {
      'sigl/productDetail/productInfo/marketPrice': {
        component: marketPrice,
        description: '申能会员购 纯积分也展示市场价',
        number: 'mall-6324',
        version: '2023v0715',
      },
      'OMSOrderDetail/PurchaseOrderNum': {
        component: dynamicImport(() => import('./components/PurchaseOrderNum')),
        description: '申能订单详情页电商不展示供应商留言',
        number: 'mall-6888',
        version: '2023v0819',
      },
      'OMSOrder/OMS/OrderComponent/SubOrderHeader/MessageRender': {
        component: dynamicImport(() => import('./components/MessageRender')),
        description: '申能我的订单电商不展示供应商留言',
        number: 'mall-6888',
        version: '2023v0819',
      },
    },
    routers: [],
  },
};
