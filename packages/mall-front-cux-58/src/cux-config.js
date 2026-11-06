import dynamicImport from 'utils/dynamicImport';
import { promisGetInvoice, getInvoice } from './functions/NewBeforeOrder';

export default {
  'SRM-58': {
    tenantName: '58同城',
    functions: {
      'NewBeforeOrder-fn-promisGetInvoice': {
        function: promisGetInvoice,
        description: '商城订单下单后，开票信息取电商账号关联公司的开票信息',
        number: 'mall-1776',
        version: '2022v1112',
      },
      'NewBeforeOrder-fn-getInvoice': {
        function: getInvoice,
        description: '商城订单下单后，开票信息取电商账号关联公司的开票信息',
        number: 'mall-1776',
        version: '2022v1112',
      },
    },
    components: {
      'MyMall/AddressList/BtnsWrapper': {
        component: dynamicImport(() => import('./components/AddressBtnsWrapper')),
        description: '【58同城】商城主站收货地址支持批量导入 批量导出',
        number: 'mall-2678 mall-4437',
        version: '2022v1217 2023v0401',
      },
      'routes/ApplyResult': {
        component: dynamicImport(() => import('./components/ApplyResult')),
        description: '【58同城】预采申请提交成功后的中间页面修改',
        number: 'mall-3641',
        version: '2022v0114',
      },
    },
    routers: [],
  },
};
