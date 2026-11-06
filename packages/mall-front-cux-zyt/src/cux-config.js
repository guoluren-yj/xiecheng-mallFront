// import dynamicImport from 'utils/dynamicImport';
import {
  beforeHandleSubmit,
  resubmitValidate,
  renderManualButton,
  renderDocFlow,
  handleApprovalRecord,
  handleApproveTag,
  beforeBackCart,
} from './functions/index';

export default {
  // 卓见
  'SRM-ZYT': {
    functions: {
      'ReqOpenCart-fn-beforeHandleSubmit': {
        function: beforeHandleSubmit,
        description: '【卓见】商城手工申请支持在提交预采申请时校验预算', // 需求描述
        number: 'mall-9848', // 需求号
        version: '2024v0511', // 迭代版本
      },
      'OpenCartMyRequest-fn-resubmitFunc': {
        function: resubmitValidate,
        description: '【卓见】二开商城申请预算超量提示', // 需求描述
        number: 'mall-10526', // 需求号
        version: '2024v0720', // 迭代版本
      },
      'HeaderSearch-fn-renderManualButton': {
        function: renderManualButton,
        description: '【卓见】新建手工商品入口优化', // 需求描述
        number: 'ced-4746', // 需求号
        version: '2025v0712', // 迭代版本
      },
      'OpenCartMyRequest-listContent-fn-docFlowRender': {
        function: renderDocFlow,
        description: '【卓见】加单据流展示，隐藏原本列上的单据流', // 需求描述
        number: 'ced-12850', // 需求号
        version: '2026v0425', // 迭代版本
      },
      'OpenCartMyRequest-requestList-fn-approvalRecord': {
        function: handleApprovalRecord,
        description: '【卓见】审批记录展示流程预测', // 需求描述
        number: 'ced-12796', // 需求号
        version: '2026v0425', // 迭代版本
      },
      'OpenCartMyRequest-listHeader-fn-approvHistoryRender': {
        function: handleApproveTag,
        description: '【卓见】审批记录展示', // 需求描述
        number: 'ced-12796', // 需求号
        version: '2026v0425', // 迭代版本
      },
      'ReqOpenCart-fn-beforeBackCart': {
        function: beforeBackCart,
        description: '【卓见】返回购物车前校验', // 需求描述
        number: 'ced-13596', // 需求号
        version: '2026v0606', // 迭代版本
      },
    },
    components: {
      // 'OpenCartMyRequest/RequestList/ListHeaderDocFlow': {
      //   component: dynamicImport(() => import('./components/ListHeaderDocFlow')),
      //   description: '【卓见】加单据流展示', // 需求描述
      //   number: 'ced-12850', // 需求号
      //   version: '2026v0425', // 迭代版本
      // },
    },
    routers: [],
  },
};
