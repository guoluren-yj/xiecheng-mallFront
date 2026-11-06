import dynamicImport from 'utils/dynamicImport';
import {
  cuxFetchPriceChange,
  setNewProductData,
  initBeforeOrderData,
  submitValid,
} from './functions';

export default {
  'SRM-XXJT': {
    tenantName: '协鑫集团',
    functions: {
      'NewProductDetail-fn-fetchPriceChange': {
        function: cuxFetchPriceChange,
        description: '历史价格与成交价二开展示-页面', // 需求描述
        number: 'mall-7433', // 需求号
        version: '2023v0923', // 迭代版本
      },
      'NewBeforeOrder-fn-afterInitData': {
        function: initBeforeOrderData,
        description: '查询目录化支付方式配置', // 需求描述
        number: 'mall-11231', // 需求号
        version: '2024v0927', // 迭代版本
      },
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValid,
        description: '协鑫二开预采校验余额', // 需求描述
        number: 'mall-11449', // 需求号
        version: '2024v1102', // 迭代版本
      },
      'productDetail-fn-setNewProductData': {
        function: setNewProductData,
        description: '赋值展示历史价格与成交价', // 需求描述
        number: 'pur-52058', // 需求号
        version: '2025v0430', // 迭代版本
      },
    },
    components: {
      'OMSOrder/OMS/SubOrderHeader': {
        component: dynamicImport(() => import('./components/SubOrderHeader')),
        description: '汇联易单据展示二开-页面', // 需求描述
        number: 'mall-10546',
        version: '2024v0720', // 迭代版本
      },
      'NewBeforeOrder/Order/appendBottomInfo': {
        component: dynamicImport(() => import('./components/SubOrderPayInfo')),
        description: '选择目录化支付方式', // 需求描述
        number: 'mall-11231', // 需求号
        version: '2024v0927', // 迭代版本
      },
    },
    routers: [],
  },
};
