import dynamicImport from 'utils/dynamicImport';
import getNeededDate from './components/NeedDate';
import {
  cuxClassName,
  productSkuAttr,
  cuxDeliveryDate,
  setAddress,
  beforeClearInvoice,
  getECInvoiceParams,
  submitValid,
  itemConfirm,
} from './functions';

export default {
  'SRM-YONGXIANG': {
    tenantName: '四川永祥股份有限公司',
    functions: {
      'productDesc-fn-className': cuxClassName,
      'productDesc-fn-productSkuAttrDTOS': productSkuAttr,
      'omsOrder-fn-cuxDeliveryDate': cuxDeliveryDate,
      'addNewCart-fn-setAddress': setAddress,
      'NewBeforeOrder-fn-clearInvoice': {
        function: beforeClearInvoice,
        description:
          '预采收单地址根据是否映射物料选择公司/个人收单地址，先二开取消设置默认值，手动选择', // 需求描述
        number: 'srm-135612', // 需求号
        version: '2022v0723', // 迭代版本
      },
      'NewBeforeOrder-fn-getECInvoiceParams': {
        function: getECInvoiceParams,
        description: '预采收单地址根据是否映射物料选择公司/个人收单地址，根据物料id新增参数过滤', // 需求描述
        number: 'srm-135612', // 需求号
        version: '2022v0723', // 迭代版本
      },
      'BeforeCompanyOrder-fn-submitValid': {
        function: submitValid,
        description: '提交订单二开调用校验接口', // 需求描述
        number: 'mall-6807', // 需求号
        version: '2023v0715', // 迭代版本
      },
      'CartFooter-fn-beforeOrder': {
        function: itemConfirm,
        description: '提交的商品若存在同一物料，则弹框提示', // 需求描述
        number: 'mall-7460', // 需求号
        version: '2023v0923', // 迭代版本
      },
    },
    components: {
      'NewBeforeOrder/ProductList/NeedDate': getNeededDate,
      'ProductDetail/productInfo/SaleQuality': {
        component: dynamicImport(() => import('./components/SaleQuality')),
        description: '历史销量二开展示列表', // 需求描述
        number: 'mall-5198', // 需求号
        version: '2023v0610', // 迭代版本
      },
    },
    routers: [],
  },
};
