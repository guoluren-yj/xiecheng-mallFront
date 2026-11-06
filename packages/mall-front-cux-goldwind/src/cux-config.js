import dynamicImport from 'utils/dynamicImport';
import EmptyComponent from 'components/EmptyComponent';
import {
  // allocationCreate,
  hasReceiveProduct,
  afterSaleInitDs,
  renderAddressInfo,
  getMobileAveragePrice,
  openCompanyAddressTipsModal,
  fetchPurchaseAgent,
  submitValid,
  getColumns,
  getInvoiceAddress,
  getECInvoiceParams,
} from './functions';

export default {
  'SRM-GOLDWIND': {
    tenantName: '新疆金风科技股份有限公司',
    functions: {
      'OMSSaleAfterApplication-fn-initDs': {
        function: afterSaleInitDs,
        description: '资产类售后管理联系人地址默认只能选择公司级地址', // 需求描述
        number: 'mall-763', // 需求号
        version: '2022v1001', // 迭代版本
      },
      'OMSSaleAfterApplication-fn-renderAddressInfo': {
        function: renderAddressInfo,
        description: '资产类售后管理联系人地址默认只能选择公司级地址', // 需求描述
        number: 'mall-763', // 需求号
        version: '2022v1001', // 迭代版本
      },
      // 'newCart-fn-allocationCreate': {
      //   function: allocationCreate,
      //   description: '批量分配带出头组织信息',
      //   number: 'srm-139445',
      // },
      'OmsAcceptModal-fn-hasReceiveProduct': {
        function: hasReceiveProduct,
        description: '【转领用库存】去掉',
        number: 'mall-523',
      },
      'get-mobile-average-price': {
        function: getMobileAveragePrice,
        description: '仅领用商品 增加移动平均价字段',
        number: 'mall-1425',
      },
      'open-company-address-tips-modal': {
        function: openCompanyAddressTipsModal,
        description: '办公用品及耗材类采购下单时公司地址给予提示',
        number: 'mall-1426',
      },
      'AddPurchaseApply-OMS-fn-fetchPurchaseAgent': {
        function: fetchPurchaseAgent,
        description: '去掉手工申请的采购员默认带出逻辑',
        number: 'mall-3119',
        version: '2022v0114', // 迭代版本
      },
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValid,
        description: '金风预采提交二开校验收单地址',
        number: 'mall-6378',
        version: '2023v0715', // 迭代版本
      },
      'NewBeforeOrder-fn-getColumns': {
        function: getColumns,
        description: '金风预采二开收单地址',
        number: 'mall-6378',
        version: '2023v0715', // 迭代版本
      },
      'NewBeforeOrder-fn-getInvoiceAddress': {
        function: getInvoiceAddress,
        description: '金风预采二开收单地址优先缓存再默认',
        number: 'mall-7148',
        version: '2023v0819', // 迭代版本
      },
      'NewBeforeOrder-fn-getECInvoiceParams': {
        function: getECInvoiceParams,
        description: '金风预采二开收单地址值集过滤',
        number: 'mall-9188',
        version: '2024v0224', // 迭代版本
      },
    },
    components: {
      // 'layout/Header/TopBar/ChooseUnit': {
      //   component: dynamicImport(() => import('./components/ChooseUnit/index')),
      //   description: '采买组织信息查询二开-页面', // 需求描述
      //   number: 'srm-132246', // 需求号
      //   version: '2022v0618', // 迭代版本
      // },
      // 'Home/Theme/UserInfo/ChooseUnit': {
      //   component: dynamicImport(() => import('./components/HomeChooseUnit')),
      //   description: '采买组织信息查询二开-页面', // 需求描述
      //   number: 'srm-132246', // 需求号
      //   version: '2022v0618', // 迭代版本
      // },
      'ProductDetail/productInfo/Allocation': {
        component: EmptyComponent,
        description: '隐藏商详商品分配', // 需求描述
        version: '2022v0710', // 迭代版本
      },
      // 'NewCart/BatchProductAllocation': {
      //   component: EmptyComponent,
      //   description: '隐藏购物车批量分配', // 需求描述
      //   version: '2022v0710', // 迭代版本
      // },
      // 'NewProductDetail/ProductParam/OtherInfo': {
      //   component: dynamicImport(() => import('./components/EcServiceLink/ProductOtherInfo')),
      //   description: '【金风科技】电商人工客服对接——商城主站侧支持(商品详情页)', // 需求描述
      //   number: 'mall-3332',
      //   version: '2023v0114', // 迭代版本
      // },
      // 'OMSOrderDetail/HeaderInfo/OtherInfo': {
      //   component: dynamicImport(() => import('./components/EcServiceLink/OrderOtherInfo')),
      //   description: '【金风科技】电商人工客服对接——商城主站侧支持(订单详情页)', // 需求描述
      //   number: 'mall-3332',
      //   version: '2023v0114', // 迭代版本
      // },
      'AddPurchaseApply/OMS/BaseInfoForm': {
        component: dynamicImport(() => import('./components/BaseInfoForm')),
        description: '去掉手工申请的采购员默认带出逻辑',
        number: 'mall-3119',
        version: '2022v0114', // 迭代版本
      },
    },
    routers: [],
  },
};
