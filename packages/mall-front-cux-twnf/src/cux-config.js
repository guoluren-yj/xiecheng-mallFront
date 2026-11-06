import dynamicImport from 'utils/dynamicImport';
import {
  cartAppendHeader,
  setCuxHeaderList,
  beforeHandleSubmit,
  setAlllocationFieldProps,
  beforeAddNewCart,
  getTransportScoreDisabled,
} from './functions/index';
import MyMallRouter from './components/MyMallRouter';

export default {
  'SRM-TWNF': {
    functions: {
      'CartProCopy-fn-extendHeaderBtns': {
        function: cartAppendHeader,
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'productDetail-fn-cuxHeaderList': {
        function: setCuxHeaderList,
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'allocation-fn-computedProps': {
        function: setAlllocationFieldProps,
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'productDetail-fn-addNewCart': {
        function: beforeAddNewCart,
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'addNewCart-fn-addNewCart': {
        function: beforeAddNewCart,
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'ReqOpenCart-fn-beforeHandleSubmit': {
        function: beforeHandleSubmit,
        description: '【通威农发】商城预采申请提交时，预付款为是时，弹窗提醒！', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-134560',
      },
      'OmsCommentModal-fn-transportScoreDisabled': {
        function: getTransportScoreDisabled,
        description: '【通威农发】商城订单评价', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-136515',
      },
    },
    components: {
      'CartProCopy/renderer/optionsRender': {
        component: dynamicImport(() => import('./components/OptionsRender')),
        description: '【通威农发】购物车手工采购需求提报及控制', // 需求描述
        version: '2025v12206', // 迭代版本
        number: 'cdp-133726',
      },
      'MyMall/router': {
        component: MyMallRouter,
        description: '【通威农发】商城页面提供投诉入口，用于内部人员可发起内部投诉', // 需求描述
        version: '2025v1206', // 迭代版本
        number: 'cdp-135809',
      },
    },
    routers: [],
  },
};
