import {
  getStockValidate,
  getBuyNowValidate,
  getAllocationItemColumns,
  getBatchAllocationItemColumns,
} from './functions';

export default {
  'SRM-JXNM': {
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getStockValidate,
        description: '【巨星农牧】商城下单时校验库存数量', // 需求描述
        version: '2023v0401', // 迭代版本
        number: 'mall-4506',
      },
      'AllocationModal-fn-gotoNewBuyNow': {
        function: getBuyNowValidate,
        description: '【巨星农牧】立即购买时校验库存数量', // 需求描述
        version: '2023v0401', // 迭代版本
        number: 'mall-4506',
      },
      'CartProCopy-fn-cuxColumns': {
        function: getAllocationItemColumns,
        description: '【巨星农牧】商城下单查询外部系统库存数据', // 需求描述
        version: '2025v1206', // 迭代版本
        number: 'cdp-124475',
      },
      'BatchAllocation-fn-childColumns': {
        function: getBatchAllocationItemColumns,
        description:
          '【巨星农牧】商品购物车批量分配页面增加其他仓库库存组织明细字段，能够调用接口查询', // 需求描述
        version: '2026v0206', // 迭代版本
        number: 'cdp-150051',
      },
    },
    components: {},
    routers: [],
  },
};
