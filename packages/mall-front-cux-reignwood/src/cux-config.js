import dynamicImport from 'utils/dynamicImport';

import { CustomizeHeaderInfoInit } from './functions';

export default {
  'SRM-REIGNWOOD': {
    tenantName: '华彬',
    functions: {
      'NewBeforeOrder--fn-CustomizeHeaderInfo-init': {
        function: CustomizeHeaderInfoInit,
        description: '【华彬商城】仅查看商品场景-根据下单状态标识隐藏项目归属', // 需求描述
        number: 'srm-125588', // 需求号
        version: '2022v0514', // 迭代版本
      },
    },
    components: {
      'ProductList/Product': {
        component: dynamicImport(() => import('./components/ProductList/Product')),
        description: '【华彬商城】仅查看商品场景-隐藏列表页加购与对比按钮', // 需求描述
        remark: '列表页整个卡片被二开',
        number: 'srm-125588', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'ProductDetail/productInfo/AddCart': {
        component: dynamicImport(() => import('./components/ProductDetail/AddCart')),
        description: '【华彬商城】仅查看商品场景-隐藏详情页夹购按钮', // 需求描述
        number: 'srm-125588', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'ProductDetail/productImg/CollectAndCompare': {
        component: dynamicImport(() => import('./components/ProductDetail/CollectAndCompare')),
        description: '【华彬商城】仅查看商品场景-隐藏详情页收藏与对比', // 需求描述
        number: 'srm-125588', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'ProductDetail/productInfo/Allocation': {
        component: dynamicImport(() => import('./components/ProductDetail/Allocation')),
        description: '【华彬商城】仅查看商品场景-隐藏商品分配', // 需求描述
        number: 'srm-125588', // 需求号
        version: '2022v0514', // 迭代版本
      },
    },
    routers: [],
  },
};
