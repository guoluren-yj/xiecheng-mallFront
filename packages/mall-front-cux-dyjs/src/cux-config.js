import dynamicImport from 'utils/dynamicImport';

export default {
  'SRM-DYJS': {
    functions: {},
    components: {
      'OMS/OrderComponent/Product/button': {
        component: dynamicImport(() =>
          import('./components/MyMall/OMSOrder/OMS/OrderComponent/ProductDetailBtn/index')
        ),
        description: '我的订单-全部订单列表-二开查看信息按钮',
        number: 'cro-782', // 需求号
        version: '2026v0116', // 迭代版本
      },
      'NewBeforeOrder/renderOrderDetail': {
        component: dynamicImport(() => import('./components/NewBeforeOrder/BatchEditLine/index')),
        description: '预采购申请-批量编辑采购申请补充信息',
        number: 'cro-783', // 需求号
        version: '2026v0116', // 迭代版本
      },
    },
    routers: [],
  },
};
