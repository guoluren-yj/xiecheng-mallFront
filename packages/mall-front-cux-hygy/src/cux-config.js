import { handleProductData } from './functions';

export default {
  'SRM-HYGY': {
    tenantName: '华友钴业',
    functions: {
      'productDetail-fn-handleProductData': {
        function: handleProductData,
        description: '商详获取sap库存', // 需求描述
        version: '2023v0610', // 迭代版本
        number: 'mall-5699',
      },
    },
    components: {},
    routers: [],
  },
};
