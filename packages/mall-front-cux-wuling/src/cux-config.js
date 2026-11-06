import dynamicImport from 'utils/dynamicImport';

import {
  afterQueryPermission,
  getCurrentWarehouse,
  getValidateType,
  setNewProductData,
  addNewCart,
  confirmSwal,
  stockNumMeaning,
  getExtendCartCopyHeaderBtn,
} from './functions';

export default {
  'SRM-WULING': {
    functions: {
      'prepare-fn-afterQueryPermission': {
        function: afterQueryPermission,
        description: '查询权限', // 需求描述
        number: 'mall-7018', // 需求号
        version: '2023v0819', // 迭代版本
      },
      'addNewCart-fn-getCurrentWarehouse': {
        function: getCurrentWarehouse,
        description: '根据权限赋值库房信息', // 需求描述
        number: 'mall-7018', // 需求号
        version: '2023v0819', // 迭代版本
      },
      'Cart/CartDataSet/getValidateType': {
        function: getValidateType,
        description: '手动分配与自动分配商品不可同时勾选', // 需求描述
        number: 'mall-7018', // 需求号
        version: '2023v0819', // 迭代版本
      },
      'productDetail-fn-setNewProductData': {
        function: setNewProductData,
        description: '根据权限赋值库房信息', // 需求描述
        number: 'mall-7018', // 需求号
        version: '2023v0819', // 迭代版本
      },
      'productDetail-fn-addNewCart': {
        function: addNewCart,
        description: '【通用五菱】领用单的批次号优化', // 需求描述
        number: 'mall-7932', // 需求号
        version: '2023v1104', // 迭代版本
      },
      'BeforeCompanyOrder-fn-confirmSwal': {
        function: confirmSwal,
        description: '【通用五菱】领用订单审批提交校验', // 需求描述
        number: 'mall-8281', // 需求号
        version: '2023v1209', // 迭代版本
      },
      'ProductList-fn-stockNumMeaning': {
        function: stockNumMeaning,
        description: '【通用五菱】商城列表页支持展示库存量', // 需求描述
        number: 'mall-8340', // 需求号
        version: '2023v1209', // 迭代版本
      },
      'CartProCopy-fn-extendHeaderBtns': {
        function: getExtendCartCopyHeaderBtn,
        description: '【通用五菱】购物车清单一键导出生成采购申请', // 需求描述
        number: 'cdp-109509', // 需求号
        version: '20250526版本', // 迭代版本
      },
    },
    components: {
      'NewBeforeOrder/CustomizeHeaderInfo/DefaultForm': {
        component: dynamicImport(() => import('./components/CustomizeHeaderInfo/DefaultForm')),
        description: '【通用五菱】领用申请单批量编辑', // 需求描述
        number: 'mall-7966', // 需求号
        version: 'v1104', // 迭代版本
      },
    },
    routers: [],
  },
};
