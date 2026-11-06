import dynamicImport from 'utils/dynamicImport';
import { changePrType } from './functions';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';

export default {
  'SRM-NEWHOPE': {
    functions: {
      'OMSAddPurchaseApply-fn-changePrType': {
        function: changePrType,
        description: '采购申请类型修改清空行数据物料信息', // 需求描述
        number: 'mall-443', // 需求号
        version: '2022v0827', // 迭代版本
      },
    },
    components: {
      'NewBeforeOrder/ProductList/NeedDate': {
        component: NeedDate,
        description: '目录化商城下单时 增加“现有库存”字段', // 需求描述
        version: '2022v1112', // 迭代版本
        number: 'mall-679',
      },
      'NewBeforeOrder/CustomizeHeaderInfo/HeaderInfo': {
        component: dynamicImport(() => import('./components/BeforeCompanyOrder/HeaderInfo')),
        description: '预采申请页面采购申请头补充信息【OA审批分类】字段旁增加同步按钮', // 需求描述
        version: '2023v0114', // 迭代版本
        number: 'mall-3297',
      },
    },
    routers: [],
  },
};
