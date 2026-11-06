import dynamicImport from 'utils/dynamicImport';
import { getERPValidate, setCurrentStockInfo } from './function/index';

export default {
  'SRM-KINGFA': {
    functions: {
      'CartFooter-fn-beforeOrder': {
        function: getERPValidate,
        description: '金发二开校验erp库存', // 需求描述
        number: 'mall-8329',
        version: '2023v1209', // 迭代版本
      },
      'ProductInfo-fn-setCurrentStockInfo': {
        function: setCurrentStockInfo,
        description: '金发二开增加预计商品送达日', // 需求描述
        number: 'ced-5019',
        version: '2025v0816', // 迭代版本
      },
    },
    components: {
      'CartProCopy/renderItemCode': {
        component: dynamicImport(() => import('./components/renderItemCode')),
        description: '金发二开展示外部库存', // 需求描述
        number: 'mall-8329',
        version: '2023v1209', // 迭代版本
      },
      'CartProCopy/renderGuide': {
        component: dynamicImport(() => import('./components/renderGuide')),
        description: '金发二开一次性学习', // 需求描述
        number: 'mall-8329',
        version: '2023v1209', // 迭代版本
      },
      'CartProCopy/CartHeader/WarningInfo': {
        component: dynamicImport(() => import('./components/WarningInfo')),
        description: '【金发科技】购物车增加提示：请点击物料编码查询ERP库存量', // 需求描述
        number: 'mall-9201',
        version: '2024v0224', // 迭代版本
      },
    },
    routers: [],
  },
};
