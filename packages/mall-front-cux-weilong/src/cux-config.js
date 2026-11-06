import dynamicImport from 'utils/dynamicImport';
// import NeedDate from './components/NeedDate';
// import { confirmSwal, submitValid } from './functions';
import { getCuxValidate, submitCuxValidate } from './functions';

export default {
  'SRM-WEILONG': {
    tenantName: '漯河市卫龙商贸有限公司',
    functions: {
      // 'BeforeCompanyOrder-fn-confirmSwal': confirmSwal,
      // 'BeforeCompanyOrder-fn-submitValid': {
      //   function: submitValid,
      //   description: '【卫龙集团】预采页面校验所属组织',
      // },
      'BeforeCompanyOrder-fn-confirmSwal': {
        function: submitCuxValidate,
        description: '下一步增加二开校验', // 需求描述
        version: '2025v0920', // 迭代版本
        number: 'ced-7212',
      },
      'CartFooter-fn-beforeOrder': {
        function: getCuxValidate,
        description: '下一步增加二开校验', // 需求描述
        version: '2025v0920', // 迭代版本
        number: 'ced-7212',
      },
    },
    components: {
      // 'NewBeforeOrder/ProductList/NeedDate': NeedDate,
      'NewBeforeOrder/CustomizeModal/DefaultForm': {
        component: dynamicImport(() => import('./components/CustomizeModal/DefaultForm')),
        description: '二开支持批量同步', // 需求描述
        number: 'mall-7395', // 需求号
        version: '2023v0923', // 迭代版本
      },
    },
    routers: [],
  },
};
