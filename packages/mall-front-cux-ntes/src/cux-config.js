// import EmptyComponent from 'components/EmptyComponent';
import dynamicImport from 'utils/dynamicImport';
import { getValidateType, initPreDs, queryData } from './functions';
import addressModalInitForm from './functions/addressModalInitForm';
import getCuxColumns from './functions/getCuxColums';
import { openAccept, openDetailAccept, handleGoToSaleReq } from './functions/OMSOrder/index';
import hideUom from './functions/hideUom';
import useCartSelected from './components/useCartSelected';
// import getCancelBtnFlag from './functions/getCancelBtnFlag';

export default {
  'SRM-NTES': {
    tenantName: '网易（杭州）网络有限公司',
    functions: {
      'address-modal-init-form': {
        function: addressModalInitForm,
        description: '【网易】新增地址 不带出值', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-988',
      },
      'Cart/CartDataSet/getValidateType': {
        function: getValidateType,
        description: '【网易】购物车提交商品时，勾选校验-2', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-171',
      },
      'ReqOpenCart-fn-initDs': {
        function: initPreDs,
        description: '【网易】商城申请类型取值逻辑-主', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-1117',
      },
      'OMSOrder-fn-handleBtnOnAccept': {
        function: openAccept,
        description: '【网易】订单列表接收时按类型给出提示', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-661',
      },
      'OMSOrderDetail-fn-handleBtnOnAccept': {
        function: openDetailAccept,
        description: '【网易】订单详情接收时按类型给出提示', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-661',
      },
      'OMSOrder-fn-handleBtnOnSaleReq': {
        function: handleGoToSaleReq,
        description: '【网易】订单列表售后时按类型给出提示', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-661',
      },
      'OpenCartMyRequest-fn-getCuxColumns': {
        function: getCuxColumns,
        description: '【网易】手工提需时兼容机的配置逻辑', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-174',
      },
      'Utils-fn-hideUomRender': {
        function: hideUom,
        description: '【网易】商品单位显示优化', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-2618',
      },
      // 'OpenCartMyRequest-ListHeader-fn-getCancelBtnFlag': {
      //   function: getCancelBtnFlag,
      //   description:
      //     '【网易】需求支持主动撤回、取消并且触发oa接口-主站拆分(已提交状态展示取消申请头)', // 需求描述
      //   version: '2022v0114', // 迭代版本
      //   number: 'mall-3200',
      // },
      'OpenCartMyRequest/dataSet/queryData': {
        function: queryData,
        description: '我的申请二开评价', // 需求描述
        version: '2022v0224', // 迭代版本
        number: 'mall-3254',
      },
    },
    components: {
      // 'NewCart/BatchProductAllocation': {
      //   component: EmptyComponent,
      //   description: '隐藏购物车批量分配', // 需求描述
      //   version: '2022v1112', // 迭代版本
      // },
      'CartProCopy/renderer/optionsRender': {
        component: dynamicImport(() => import('./components/optionsRender')),
        description: '【网易】手工提需时兼容机的配置逻辑', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-174',
      },
      'CartProCopy/renderer/RenderErrorMsg': {
        component: dynamicImport(() => import('./components/RenderErrorMsg')),
        description: '【网易】提示未填信息', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-171',
      },
      // 'OpenCartMyRequest/RequestList/ListHeader': {
      //   component: dynamicImport(() => import('./components/ListHeader')),
      //   description: '【网易】二开展示审批进度-页面', // 需求描述
      //   version: '2022v1001', // 迭代版本
      //   number: 'mall-1304',
      // },
      'OMSOrderDetail/HeaderInfo': {
        component: dynamicImport(() => import('./components/HeaderInfo')),
        description: '【网易】领用订单详情展示二开-页面', // 需求描述
        version: '2022v1001', // 迭代版本
        number: 'mall-1295',
      },
      'ProductAllocation/AllocationModal': {
        component: dynamicImport(() => import('./components/ProductAllocation/AllocationModal')),
        description: '【网易】费用分配二开 && 【网易】立即购买增加海外提需的提示语 ', // 需求描述
        version: '2022v1001 && 2023v0401', // 迭代版本
      },
      // 'NewCart/ProductAllocation': {
      //   component: dynamicImport(() => import('./components/ProductAllocation')),
      //   description: '海外商城限制没有开放购物车的手工提需功能', // 需求描述
      //   version: '2022v1001', // 迭代版本
      // },
      'routes/CartProCopy/ImportBtn': {
        component: dynamicImport(() => import('./components/ImportBtn')),
        description: '【网易】购物车批量导入-手工商品', // 需求描述
        version: '2022v1217', // 迭代版本
      },
      'CartProCopy/CartFooter/useCartSelected': {
        component: useCartSelected,
        description:
          '【网易】商城购物车和预采申请页面隐藏真实价格，显示划线价格，汇总金额显示划线价格', // 需求描述
        version: '2022v1217', // 迭代版本
        number: 'mall-181',
      },
      'OpenCartMyRequest/RequestHeader': {
        component: dynamicImport(() => import('./components/RequestHeader')),
        description: '网易我的申请导出二开',
        version: '2023v0114', // 迭代版本
        number: 'mall-3281',
      },
      'OMS/OrderComponent/Product': {
        component: dynamicImport(() => import('./components/Product')),
        description: '【网易】我的订单中展示行个性化字段【OA单号】',
        number: 'mall-4213',
        version: '2022v0225', // 迭代版本
      },
      'OpenCartMyRequest/RequestList/OperateRender': {
        component: dynamicImport(() => import('./components/OperateRender')),
        description: '网易我的申请二开评价',
        version: '2023v0224', // 迭代版本
        number: 'mall-3254',
      },
    },
    routers: [],
  },
};
