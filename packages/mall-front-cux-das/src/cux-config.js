import dynamicImport from 'utils/dynamicImport';
import {
  cuxConfirmModal,
  initHome,
  setNewProductData,
  setListNewProduct,
  showSales,
} from './functions';

export default {
  'SRM-DAS': {
    tenantName: '一道',
    functions: {
      'CartFooter-fn-cuxConfirmModal': {
        function: cuxConfirmModal,
        description: '【一道】商城订单收货后强制评价，申购时必须对上次采购进行评价后才能下单',
        number: 'mall-9513',
      },
      'NewProdutDetail-fn-buyNowErrorBack': {
        function: cuxConfirmModal,
        description: '【一道】商城订单收货后强制评价，申购时必须对上次采购进行评价后才能下单',
        number: 'mall-9513',
      },
      'Layout-fn-initHome': {
        function: initHome,
        description: '【一道】 进入商城提示未评价订单', // 需求描述
        number: 'mall-10516', // 需求号
        version: '2024v0720', // 迭代版本
      },
      'productDetail-fn-setNewProductData': {
        function: setNewProductData,
        description: '【一道】商城商品历史销量以物料编码为维度做累计', // 需求描述
        number: 'feature-cdp-96790', // 需求号
        version: '2025v0329', // 迭代版本
      },
      'ProductList-fn-setNewProduct': {
        function: setListNewProduct,
        description: '【一道】商城商品历史销量以物料编码为维度做累计', // 需求描述
        number: 'feature-cdp-96790', // 需求号
        version: '2025v0329', // 迭代版本
      },
      'ProductCard-fn-showSales': {
        function: showSales,
        description: '【一道】商城商品历史销量以物料编码为维度做累计', // 需求描述
        number: 'feature-cdp-96790', // 需求号
        version: '2025v0329', // 迭代版本
      },
    },
    components: {
      'OMSOrder/OMS/SubOrderHeader': {
        component: dynamicImport(() => import('./components/SubOrderHeader')),
        description: '一道二开订单晒单评价', // 需求描述
        number: 'mall-10518',
        version: '2024v0927', // 迭代版本
      },
    },
    routers: [],
  },
};
