import dynamicImport from 'utils/dynamicImport';
import {
  getNextValidate,
  getBuyNowValidate,
  // getAttachmentValidate,
  // getAttachmentRequired,
  addressModalInitForm,
  addressLovPara,
  addressInit,
  changeApproveUrl,
  setVariable,
  beforeSaveParamsFunc,
  getDisableFlag,
  renderAssignedTable,
  getProductInformationLabel,
  getBatchProductList,
  handleDsList,
  handleSaveAllocationAndNext,
  beforeBatchAllocation,
  initChildrenDs,
} from './functions';
// import ApproveHistory from './components/ApproveHistory';

export default {
  'SRM-SANGFOR': {
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getNextValidate,
        description: '【深信服】根据招待场景控制相关字段显示和是否必输-购物车下一步', // 需求描述
        version: '2023v0506', // 迭代版本
        number: 'mall-5156',
      },
      'AllocationModal-fn-gotoNewBuyNow': {
        function: getBuyNowValidate,
        description: '【深信服】根据招待场景控制相关字段显示和是否必输-立即购买-分配', // 需求描述
        version: '2023v0506', // 迭代版本
        number: 'mall-5156',
      },
      // 'BeforeCompanyOrder-fn-attachmentRequired': {
      //   function: getAttachmentValidate,
      //   description: '【深信服】校验附件是否必输', // 需求描述
      //   version: '2023v0506', // 迭代版本
      //   number: 'mall-5156',
      // },
      // 'BeforeCompanyOrder-fn-remarkRequireCux': {
      //   function: getAttachmentRequired,
      //   description: '【深信服】展示附件必输', // 需求描述
      //   version: '2023v0506', // 迭代版本
      //   number: 'mall-5156',
      // },
      'address-modal-init-form': {
        function: addressModalInitForm,
        description: '【深信服】不带出默认联系人 ', // 需求描述
        version: '2023v0923', // 迭代版本
        number: 'mall-7393',
      },
      'AddressLov-fn-init': {
        function: addressInit,
        description: '【深信服】前台隐藏公司级收获地址 ', // 需求描述
        version: '2023v0923', // 迭代版本
        number: 'mall-7393',
      },
      'OrderAgain-fn-formDs-addressLovPara': {
        function: addressLovPara,
        description: '【深信服】前台隐藏公司级收获地址 - 修改订单 ', // 需求描述
        version: '2023v0923', // 迭代版本
        number: 'mall-7393',
      },
      'AddressList-fn-fetch-commonPara': {
        function: addressInit,
        description: '【深信服】 固定查询个人级别',
        number: 'mall-7393',
        version: '2023v0923',
      },
      'AomsOrder-myOrder-setApproveUrl': {
        function: changeApproveUrl, // 需要获取的值
        description: '深信服  二开审批记录', // 描述
        number: 'ced-362', // 需求号
        version: '2025V0111', // 迭代版本
      },
      'AomsOrder-myOrder-setVariable': {
        function: setVariable, // 需要获取的值
        description: '深信服  二开审批记录', // 描述
        number: 'ced-362', // 需求号
        version: '2025V0111', // 迭代版本
      },
      // 'AllocationModal-fn-beforeSaveParamsFunc': {
      //   function: beforeSaveParamsFunc,
      //   description: '深信服 单行审批保存时传标识', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-getDisableFlag': {
      //   function: getDisableFlag,
      //   description: '深信服 批量分配弹窗表格删除逻辑', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-renderAssignedTable': {
      //   function: renderAssignedTable,
      //   description: '深信服 批量分配弹窗新增已分配表格', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-getProductInformationLabel': {
      //   function: getProductInformationLabel,
      //   description: '深信服 批量分配弹窗表格字段名', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-getBatchProductList': {
      //   function: getBatchProductList,
      //   description: '深信服 批量分配弹窗表格数据处理', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-handleDsList': {
      //   function: handleDsList,
      //   description: '深信服 保存批量分配表格数据处理', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-handleSaveAllocationAndNext': {
      //   function: handleSaveAllocationAndNext,
      //   description: '深信服 保存批量分配表格数据，整合下一步的逻辑', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-beforeBatchAllocation': {
      //   function: beforeBatchAllocation,
      //   description: '深信服 点批量分配弹窗前的判断', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
      // 'BatchAllocation-fn-initChildrenDs': {
      //   function: initChildrenDs,
      //   description: '深信服 批量分配表格ds初始化', // 需求描述
      //   number: 'ced-4574', // 需求号
      //   version: '2025v0712', // 迭代版本
      // },
    },
    components: {
      'CartProCopy/CartFooter': {
        component: dynamicImport(() => import('./components/CartFooter')),
        description: '【深信服】 操作按钮迁至下一步旁',
        number: 'mall-9113',
        version: '2024v0224',
      },
      // 'MyMall/OMSOrder/OMS/OrderComponent/ApproveHistory': {
      //   component: ApproveHistory,
      //   description: '【深信服】 审批记录跳转外部',
      //   number: 'mall-9066',
      //   version: '2024v0225',
      // },
    },
    routers: [],
  },
};
