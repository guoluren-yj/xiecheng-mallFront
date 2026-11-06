import EmptyComponent from 'mall-front/lib/components/EmptyComponent';
import dynamicImport from 'utils/dynamicImport';

import {
  cuxAddLine,
  changePrType,
  cancelRequest,
  headerChangeAttr10,
  lineChangeAttr11,
  preOrderHeaderChangeAttr10,
  preOrderlineChangeAttr11,
  cuxButton,
  cuxAddPurchaseApplyInitDs,
  cuxAddPurchaseApplyColumns,
  cuxDeleteField,
} from './functions';

export default {
  'SRM-IZXWH': {
    tenantName: '爱智学',
    functions: {
      'OMSAddPurchaseApply-fn-addLine': cuxAddLine,
      'PurchaseRequest-fn-cancelRequest': cancelRequest,
      'OMSAddPurchaseApply-fn-changePrType': changePrType,
      'OMSAddPurchaseApply-fn-cuxButton': cuxButton,
      'OMSAddPurchaseApply-fn-initDs': cuxAddPurchaseApplyInitDs,
      'OMSAddPurchaseApply-fn-cuxColumns': cuxAddPurchaseApplyColumns,
      'PurchaseRequest-fn-deleteField': cuxDeleteField,
    },
    components: {
      'NewBeforeOrder/PurchaseHeaderDetail/PrTypeLov': {
        component: dynamicImport(() => import('./components/PrTypeLov')),
        description: 'OMS预采申请界面头上申请类型和商品品类联动带出', // 需求描述
        number: 'srm-102355', // 需求号
        version: '2021v1225', // 迭代版本
      },
      'NewBeforeOrder/ProductList/Remark': {
        component: EmptyComponent,
        description: '预采申请/订单详情页的补充信息增加标准字段备注-隐藏标准的备注信息', // 需求描述
        number: 'srm-108693', // 需求号
        version: '2022v0226', // 迭代版本
      },
      'NewBeforeOrder/ProductListOperate': {
        component: dynamicImport(() => import('./components/ProductListOperate')),
        description: '预采申请-行补充信息按钮增加icon', // 需求描述
        number: 'srm-108693', // 需求号
        version: '2022v0226', // 迭代版本
      },
    },
    routers: [],
    customizes: {
      'MALL.APPLY.OMS.EDIT.BASEINFO': {
        attributeVarchar10: headerChangeAttr10, // srm-107831
      },
      'MALL.APPLY.OMS.EDIT.APPLYINFO': {
        attributeVarchar11: lineChangeAttr11,
      },
      'MALL.BEFORE.ORDER.OMS.HEADER.SUPPLY': {
        attributeVarchar10: preOrderHeaderChangeAttr10,
      },
      'MALL.BEFORE.ORDER.OMS.CATA.LINE.SUPPLIER': {
        attributeVarchar11: preOrderlineChangeAttr11,
      },
    },
  },
};
