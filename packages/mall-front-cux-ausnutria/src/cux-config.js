import dynamicImport from 'utils/dynamicImport';
import {
  submitCentralizedMessage,
  interceptCartData,
  detailLineAddressRender,
  batchEditAddrBtn,
  beforeOrder,
  setAddress,
} from './functions/index';

export default {
  'SRM-AUSNUTRIA': {
    functions: {
      'cart-pro-submit-fn-submitCentralizedMessage': {
        function: submitCentralizedMessage,
        description: '澳优 二开提需人提交拼单文本提示',
        number: 'mall-10556', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'Cart/CartDataSet/loadCartData': {
        function: interceptCartData,
        description: '澳优 二开提需人商品状态',
        number: 'mall-10556', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'cart-pro-basket-fn-detailLineAddressRender': {
        function: detailLineAddressRender,
        description: '澳优 二开拼单明细地址不可以编辑',
        number: 'mall-10891', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'cart-pro-basket-fn-batchEditAddrBtn': {
        function: batchEditAddrBtn,
        description: '澳优 二开拼单明细地址不可以编辑',
        number: 'mall-10891', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'CartFooter-fn-openCart-beforeOrder': {
        function: beforeOrder,
        description: '澳优 二开拼单下单弱校验弹窗',
        number: 'mall-10556', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'addNewCart-fn-setAddress': {
        function: setAddress,
        description: '澳优 二开地址选择过滤',
        number: 'mall-10891', // 需求号
        version: '2024v0826', // 迭代版本
      },
    },
    components: {
      'CartProCopy/renderer/centralizeStatusRenderer': {
        component: dynamicImport(() => import('./components/CentralizeStatusRenderer')),
        description: '澳优 二开提需人商品状态',
        number: 'mall-10556', // 需求号
        version: '2024v0826', // 迭代版本
      },
      'CartProCopy/basketOrder/appendOptionBtn': {
        component: dynamicImport(() => import('./components/AppendOptionsBtn')),
        description: '澳优 二开审批记录', // 需求描述
        number: 'mall-10570',
        version: '2024v0826', // 迭代版本
      },
      'OpenCartMyRequest/RequestList/ListContentStatusAppendBtn': {
        component: dynamicImport(() => import('./components/ListHeaderAppendBtn')),
        description: '澳优 二开费用申请单支持跳转外部链接', // 需求描述
        number: 'mall-10913',
        version: '2024v0826', // 迭代版本
      },
    },
    routers: [],
  },
};
