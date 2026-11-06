import dynamicImport from 'utils/dynamicImport';
import NeedDate from './components/NeedDate';
import { cuxHiddenBtnList, dsUpdateFn } from './functions';

export default {
  'SRM-RGEGO': {
    functions: {
      'OMSOrder-fn-hiddenBtnList': cuxHiddenBtnList,
      'CartProCopy-ProdctAllocation-cuxUpdate': dsUpdateFn,
      'BatchAllocation-fn-update': dsUpdateFn,
    },
    components: {
      'NewBeforeOrder/ProductList/Remark': {
        component: dynamicImport(() => import('./components/Remark')),
        description: '【亚太森博】商城预采申请最低价标识且非最低价备注必填', // 需求描述
        number: 'mall-11990', // 需求号
        version: '2025v0222', // 迭代版本
      },
      'NewBeforeOrder/ProductList/NeedDate': {
        component: NeedDate,
        description: '【亚太森博】商城预采申请最低价标识且非最低价备注必填', // 需求描述
        number: 'mall-11990', // 需求号
        version: '2025v0222', // 迭代版本
      },
    },
    routers: [],
  },
};
