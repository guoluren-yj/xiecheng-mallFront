import { setAddress, handleTitleMap } from './functions';

const tenantCode = 'T04255';

export default {
  [tenantCode]: {
    tenantName: '欧普',
    functions: {
      'addNewCart-fn-setAddress': {
        function: setAddress,
        description: '设置目录化/电商商品的默认地址，并且过滤手动修改地址时的地址范围',
        number: 'mall-3216', // 需求号
        version: '2023v0114', // 迭代版本
      },
      'BatchAllocation-fn-handleTitleMap': {
        function: handleTitleMap,
        description: '购物车限制目录化/电商批量分配',
        number: 'mall-3216', // 需求号
        version: '2023v0114', // 迭代版本
      },
    },
    components: {},
    routers: [],
  },
};
