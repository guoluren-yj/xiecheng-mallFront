import dynamicImport from 'utils/dynamicImport';

import MyMallRouter from './components/Order/MyMallRouter';

import {
  showSales,
  hiddenBtns,
  openDetailAccept,
  openDetailAcceptShowFlag,
  openDetailCheldAcceptShowFlag,
} from './function/index';

export default {
  'SRM-RUYIFILM': {
    tenantName: '万达电影股份有限公司',
    functions: {
      'OmsAcceptModal-fn-quantity': {
        function: showSales,
        description: '数量只读', // 需求描述
        number: 'feature-cdp-96790', // 需求号
        version: '2025v0329', // 迭代版本
      },
      'OMSOrderDetail-fn-showAcceptBtn': {
        function: hiddenBtns,
        description: '按钮隐藏', // 需求描述
        number: 'cdp-171059',
        version: '2026v0617', // 迭代版本
      },
      'OMSOrderDetail-fn-handleBtnOnAccept': {
        function: openDetailAccept,
        description: '接收按钮参数调整', // 需求描述
        version: '2026v0617', // 迭代版本
        number: 'cdp-171059',
      },
      'OMSOrder-fn-cuxAcceptShowFlag': {
        function: openDetailAcceptShowFlag,
        description: '接收按钮根据状态显示控制', // 需求描述
        version: '2026v0617', // 迭代版本
        number: 'cdp-172191',
      },
      'OMSOrderDetail-fn-cuxAcceptShowFlag': {
        function: openDetailCheldAcceptShowFlag,
        description: '接收按钮根据状态显示控制', // 需求描述
        version: '2026v0617', // 迭代版本
        number: 'cdp-172191',
      },
    },
    components: {
      'layout/Header/TopBar/AddressArea': {
        component: dynamicImport(() => import('./components/Layout/Header/TopBar')),
        description: '地址定位不显示',
        number: 'cdp-165999', // 需求号
        version: '2026v0512', // 迭代版本
      },
      'MyMall/router': {
        component: MyMallRouter,
        description: '地址管理不显示', // 需求描述
        version: '2026v0512', // 迭代版本
        number: 'cdp-165999', // 需求号
      },
      'OMSOrder/OMS/SubOrderLine/cataHandleBtns': {
        component: dynamicImport(() => import('./components/OrderStatus/index')),
        description: '【万达电影股份有限公司】我的订单-订单详情-子订单-接收', // 需求描述
        number: 'cdp-171059',
        version: '2026v0617', // 迭代版本
      },
      'layout/Header/MenuBar/getSubCategories': {
        component: dynamicImport(() => import('./components/Layout/Header/MenuBar')),
        description: '【万达电影股份有限公司】商城列表-子分类-隐藏三级目录', // 需求描述
        number: 'cdp-171059',
        version: '2026v0624', // 迭代版本
      },
    },
    routers: [],
  },
};
