import {
  invoiceOrgIdDisabled,
  addressCuxRender,
  cuxHandleOuChange,
  getDefaultTabKey,
} from './functions';

export default {
  'SRM-MZWY': {
    tenantName: '明喆',
    functions: {
      'Cart-fn-invoiceOrgIdDisabled': invoiceOrgIdDisabled,
      'Cart-fn-addressCuxRender': addressCuxRender,
      'CartProCopy-ProdctAllocation-cuxHandleOuChange': {
        function: cuxHandleOuChange,
        description: '购物车取消标准逻辑-业务实体带出库存组织',
        number: 'cdp-102008',
        version: '2025v0331',
      },
      'CartProCopy-fn-defaultTabKey': {
        function: getDefaultTabKey,
        description: '购物车默认进入【明细视图】',
        number: 'cdp-126811',
        version: '2025v0920',
      },
    },
    components: {},
    routers: [],
  },
};
