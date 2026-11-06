import { organizationNameRender } from './functions/Cart/CartPurchase';
import { cuxHeaderList } from './functions';

export default {
  'SRM-DDMC': {
    tenantName: '叮咚买菜',
    functions: {
      'Cart-fn-getShowDetail': () => true,
      'Cart-fn-organizationNameRender': organizationNameRender,
      'productDetail-fn-cuxHeaderList': {
        function: cuxHeaderList,
        description: '【叮咚买菜】叮咚新购物车清空库存组织',
        number: 'mall-9865',
        version: '20240511',
      },
    },
    components: {},
    routers: [],
  },
};
