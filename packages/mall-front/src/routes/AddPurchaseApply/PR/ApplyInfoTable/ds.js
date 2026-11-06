import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getOrganizationId } from 'utils/utils';

// 详情formDs
const DS = () => {
  const tenantId = getOrganizationId();
  return {
    paging: false,
    fields: [
      {
        name: 'companyName',
        type: 'string',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'productName',
        required: true,
        label: intl.get('mallf.purchaseDetail.view.goodsOfName').d('物资名称'),
      },
      {
        name: 'quantity',
        required: true,
        min: 1,
        label: intl.get('mallf.purchaseDetail.view.appliNum').d('申请数量'),
      },
      {
        name: 'itemLov',
        type: 'object',
        label: intl.get('mallf.purchaseDetail.view.item.code').d('物料编码'),
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        ignore: 'always',
        valueField: 'itemCode',
        textField: 'itemCode',
        transformResponse: (_, record) => {
          return record.itemCode
            ? {
                itemCode: record.itemCode,
                itemName: record.itemName,
              }
            : null;
        },
      },
      {
        name: 'itemId',
        bind: 'itemLov.itemId',
      },
      {
        name: 'itemCode',
        bind: 'itemLov.itemCode',
        label: intl.get('mallf.purchaseDetail.view.item.code').d('物料编码'),
      },
      {
        name: 'itemName',
        disabled: true,
        bind: 'itemLov.itemName',
        label: intl.get('mallf.purchaseDetail.view.item.name').d('物料名称'),
      },
      {
        name: 'uomLov',
        required: true,
        type: 'object',
        label: intl.get('mallf.purchaseDetail.view.uom').d('单位'),
        lovCode: 'SMDM.DUAL_UOM',
        ignore: 'always',
        valueField: 'uomId',
        textField: 'uomName',
        transformResponse: (_, { uomId, uomName }) => {
          return uomId ? { uomId, uomName } : null;
        },
      },
      {
        name: 'uomName',
        type: 'string',
        bind: 'uomLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomLov.uomId',
      },
      {
        name: 'neededDate',
        type: 'date',
        required: true,
        min: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        defaultValue: moment(new Date()),
        label: intl.get(`mallf.purchaseDetail.view.need.date`).d('需求日期'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('mallf.common.view.attachment.info').d('附件信息'),
      },
      {
        name: 'invOrganizationLov',
        type: 'object',
        required: true,
        label: intl.get('mallf.purchaseDetail.model.inventoryOrg').d('库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        computedProps: {
          lovPara: ({ record }) => {
            return { enabledFlag: 1, itemId: record.get('itemId'), ouId: record.get('ouId') };
          },
          // required: ({ record }) => {
          //   return !record.get('isEComAndReject');
          // },
          // disabled: ({ record }) => {
          //   return record.get('isEComAndReject');
          // },
        },
        textField: 'organizationName',
      },
      {
        bind: 'invOrganizationLov.organizationName',
        name: 'invOrganizationName',
      },
      {
        bind: 'invOrganizationLov.organizationId',
        name: 'invOrganizationId',
      },

      {
        name: 'categoryLov',
        type: 'object',
        lovCode: 'SPRM.ITEM_CATEGOR',
        label: intl.get(`mallf.purchaseDetail.view.categoryName`).d('物料分类'),
        textField: 'categoryName',
        computedProps: {
          // disabled: ({ record }) => {
          //   return record.get('isEComAndReject');
          // },
          lovPara: ({ record }) => ({
            enabledFlag: 1,
            tenantId,
            itemId: record.get('itemId'),
          }),
        },
      },
      {
        bind: 'categoryLov.categoryId',
        name: 'categoryId',
      },
      {
        bind: 'categoryLov.categoryName',
        name: 'categoryName',
      },

      {
        label: intl.get(`mallf.purchaseDetail.model.costCenter`).d('成本中心'),
        name: 'costLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.COST_CENTER',
        computedProps: {
          lovPara: ({ record }) => ({
            tenantId,
            ouId: record.get('ouId'),
            companyId: record.get('companyId'),
          }),
        },
        textField: `costName`,
      },
      {
        name: 'costCode',
        bind: 'costLov.costCode',
      },
      {
        name: 'costId',
        bind: 'costLov.costId',
      },
      {
        name: 'costName',
        bind: 'costLov.costName',
      },

      {
        label: intl.get(`mallf.purchaseDetail.model.wbs`).d('WBS元素'),
        name: 'wbsCodeLov',
        type: 'object',
        lovCode: 'SMDM.WBS',
        ignore: 'always',
        computedProps: {
          disabled: ({ record }) => !record.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId,
            companyId: record.get('companyId'),
            ouId: record.get('ouId'),
          }),
        },
        textField: `wbsName`,
      },
      {
        name: 'wbsCode',
        bind: 'wbsCodeLov.wbsCode',
      },
      {
        name: 'wbs',
        bind: 'wbsCodeLov.wbsName',
      },
    ],
  };
};

export default DS;
