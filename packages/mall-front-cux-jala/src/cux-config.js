import dynamicImport from 'utils/dynamicImport';

export default {
  'SRM-JALA': {
    tenantName: '伽蓝',
    functions: {},
    components: {
      'ProductDetail/productInfo/SaleQuality': {
        component: dynamicImport(() => import('components/EmptyComponent')),
        description: '【伽蓝三期】商城主站商品界面浏览量显示--隐藏原销量(企业购)', // 需求描述
        number: 'srm-124462', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'ProductDetail/productParam/ReviewQuality': {
        component: dynamicImport(() => import('./components/ProductDetail/ReviewQuality')),
        description: '【伽蓝三期】商城主站商品界面浏览量显示--新增浏览量(企业购)', // 需求描述
        number: 'srm-124462', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'sigl/ProductDetail/productInfo/SaleQuality': {
        component: dynamicImport(() => import('components/EmptyComponent')),
        description: '【伽蓝三期】商城主站商品界面浏览量显示--隐藏原销量(会员购)', // 需求描述
        number: 'srm-124462', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'sigl/ProductDetail/productParam/ReviewQuality': {
        component: dynamicImport(() => import('./components/ProductDetail/ReviewQuality')),
        description: '【伽蓝三期】商城主站商品界面浏览量显示--新增浏览量(会员购)', // 需求描述
        number: 'srm-124462', // 需求号
        version: '2022v0514', // 迭代版本
      },
    },
    routers: [],
  },
};
