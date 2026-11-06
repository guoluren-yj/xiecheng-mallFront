// import EmptyComponent from 'components/EmptyComponent';
import NeedDate from './components/NeedDate';
import NeededDateHeader from './components/NeededDate/Header';
import NeededDateContent from './components/NeededDate/Content';

export default {
  'SRM-STARBUCKS': {
    tenantName: '星巴克',
    functions: {},
    components: {
      'NewBeforeOrder/ProductList/NeedDate': NeedDate,
      'OMSOrderDetail/NeededDate/Header': NeededDateHeader,
      'OMSOrderDetail/NeededDate/Content': NeededDateContent,
      // 'NewCart/BatchProductAllocation': {
      //   component: EmptyComponent,
      //   description: '隐藏购物车批量分配', // 需求描述
      //   version: '2022v0827', // 迭代版本
      //   number: 'mall-123',
      // },
    },
    routers: [],
  },
};
