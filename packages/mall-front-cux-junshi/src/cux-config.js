import { getAddressValidate, getBuyNowAddressValidate } from './functions/index';

export default {
  'SRM-JUNSHI': {
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getAddressValidate,
        description: '君实二开下一步校验品类和成本中心', // 需求描述
        number: 'mall-10505',
        version: '2024v0720', // 迭代版本
      },
      'ProductDetail-fn-gotoNewBuyNow': {
        function: getBuyNowAddressValidate,
        description: '君实二开立即购买校验品类和成本中心', // 需求描述
        number: 'mall-10505',
        version: '2024v0720', // 迭代版本
      },
      'AllocationModal-fn-gotoNewBuyNow': {
        function: getBuyNowAddressValidate,
        description: '君实二开立即购买校验品类和成本中心', // 需求描述
        number: 'mall-10505',
        version: '2024v0720', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
