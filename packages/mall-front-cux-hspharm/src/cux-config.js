import dynamicImport from 'utils/dynamicImport';
import { setListNewProduct, confirmSwal, setDefaultListType, getDefaultTabKey } from './functions/index';

export default {
  'SRM-HSPHARM': {
    functions: {
      'ProductList-fn-setNewProduct': {
        function: setListNewProduct,
        description: '【翰森制药】列表字段排布调整', // 需求描述
        number: 'cdp-135660', // 需求号
        version: '2025v1205', // 迭代版本
      },
      'BeforeCompanyOrder-fn-confirmSwal': {
        function: confirmSwal,
        description: '对接ILAB库存查询', // 需求描述
        number: 'cdp-135080', // 需求号
        version: '2025v1205', // 迭代版本
      },
      'ProductList-fn-defaultListType': {
        function: setDefaultListType,
        description: '【翰森制药】商品搜索展示默认为列表展示', // 需求描述
        number: 'cdp-142774', // 需求号
        version: '2025v0106', // 迭代版本
      },
      'CartProCopy-fn-defaultTabKey': {
        function: getDefaultTabKey,
        description: '购物车默认进入【明细视图】',
        number: 'cdp-142774', // 需求号
        version: '2025v0106', // 迭代版本
      },
    },
    components: {
      'ProductList/Product': {
        component: dynamicImport(() => import('./components/ProductList/Product')),
        description: '【翰森制药】列表字段排布调整', // 需求描述
        remark: '列表页整个卡片被二开',
        number: 'cdp-135660', // 需求号
        version: '2025v1205', // 迭代版本
      },
      'layout/header/hotWord': {
        component: dynamicImport(() => import('./components/Layout/Header/hotWord')),
        description: '热门搜索不显示',
        number: 'cdp-142774', // 需求号
        version: '2025v0106', // 迭代版本
      },
      'productList/contentList/header': {
        component: dynamicImport(() => import('./components/ProductList/contentList/header')),
        description: '列表页整个卡片被二开',
        number: 'cdp-142774', // 需求号
        version: '2025v0106', // 迭代版本
      },
    },
    routers: [],
  },
};
