import dynamicImport from 'utils/dynamicImport';
import { docInfoFieldsInit, sentAfterSaleOnOk, openCuxGoToLowestSkuModal } from './functions';

export default {
  'SRM-CARLSBERG': {
    functions: {
      'OMS-myOrder-fn-docInfoFields': {
        function: docInfoFieldsInit,
        description: '【嘉士伯】关联单据弹窗-单据信息-增加字段（带复制按钮）', // 需求描述
        version: '2025v0816', // 迭代版本
        number: 'cdp-117183', // 需求号
      },
      'MySaleRecord-fn-sentAfterSaleOnOk': {
        function: sentAfterSaleOnOk,
        description: '【嘉士伯商城】售后申请-退货类型下，用户发出商品节点支持填写退货订单号', // 需求描述
        number: 'cdp-117697',
        version: '2025v0920', // 迭代版本
      },
      'openGoToLowestSkuModal-fn-openGoToLowestSkuModal': {
        function: openCuxGoToLowestSkuModal,
        description: '【嘉士伯商城】商品详情页-低价商品弹窗-增加采购非低价商品原因填写',
        number: 'cdp-166463',
        version: '2025v0615',
      },
    },
    components: {
      'OMSOrder/OMS/SubOrderLine/orderStatus/cuxRender': {
        component: dynamicImport(() => import('./components/OrderStatus/CuxBtn')),
        description: '【嘉士伯】订单行状态下按钮', // 需求描述
        number: 'mall-117291',
        version: '2025v0816', // 迭代版本
      },
      'MySaleRecord/OMSSale/sentAfterSale/children': {
        component: dynamicImport(() => import('./components/SentAfterSale')),
        description: '【嘉士伯商城】售后申请-退货类型下，用户发出商品节点支持填写退货订单号', // 需求描述
        number: 'cdp-117697',
        version: '2025v0920', // 迭代版本
      },
      // 'modals/GoToLowestSkuModal': {
      //   component: dynamicImport(() => import('./components/GoToLowestSkuModal')),
      //   description: '【嘉士伯商城】商品详情页-低价商品弹窗-增加采购非低价商品原因填写',
      //   number: 'cdp-166463',
      //   version: '2025v0615',
      // },
    },
    routers: [],
  },
};
