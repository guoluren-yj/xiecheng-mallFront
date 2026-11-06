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
        name: 'entryCode',
        type: 'string',
        label: intl.get('mallf.common.view.lineNum').d('行号'),
      },
      {
        name: 'companyName',
        type: 'string',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'goodsName',
        required: true,
        label: intl.get('mallf.purchaseDetail.view.goodsOfName').d('物资名称'),
      },
      {
        name: 'requestQuantity',
        required: true,
        min: 0,
        label: intl.get('mallf.purchaseDetail.view.appliNum').d('申请数量'),
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.get('uomId');
          },
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
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomLov',
        required: true,
        type: 'object',
        label: intl.get('mallf.common.view.uom').d('单位'),
        lovCode: 'SMDM.DUAL_UOM',
        ignore: 'always',
        valueField: 'uomId',
        textField: 'uomName',
        transformResponse: (_, { uomId, uomName }) => {
          return uomId ? { uomId, uomName } : null;
        },
      },
      {
        name: 'needByDate',
        type: 'date',
        min: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        // defaultValue: moment(new Date()),
        label: intl.get(`mallf.common.view.need.date`).d('需求日期'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('mallf.purchaseDetail.view.attachment.info').d('附件信息'),
      },
      {
        name: 'predictUnitPrice',
        required: true,
        label: intl.get('mallf.common.view.estimated.unit.price').d('预估单价（含税）'),
      },
      {
        name: 'predictEntryAmount',
        disabled: true,
        label: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
      },
      {
        name: 'receiverAddressId',
      },
      {
        name: 'addressLov',
        type: 'object',
        valueField: 'addressId',
        textField: 'address',
        label: intl.get(`mallf.common.model.receive.info`).d('收货信息'),
        transformResponse: (_, { addressId, address }) => {
          return addressId ? { addressId, address } : null;
        },
        required: true,
        lovCode: '',
        ignore: 'always',
      },
      {
        name: 'addressId',
        bind: 'addressLov.addressId',
      },
      {
        name: 'address',
        bind: 'addressLov.address',
      },
      {
        name: 'regionId',
        bind: 'addressLov.regionId',
      },
      {
        name: 'mobilePhone',
        bind: 'addressLov.mobilePhone',
      },
      {
        name: 'email',
        bind: 'addressLov.email',
      },
      {
        name: 'telphone',
        bind: 'addressLov.telphone',
      },
      {
        name: 'contactName',
        bind: 'addressLov.contactName',
      },
      {
        name: 'belongType',
        bind: 'addressLov.belongType',
      },
      {
        name: 'invOrganizationLov',
        type: 'object',
        required: true,
        label: intl.get('mallf.common.model.inventoryOrg').d('库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
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
        bind: 'invOrganizationLov.organizationCode',
        name: 'invOrganizationCode',
      },
      {
        name: 'remark',
        type: 'object',
        maxLength: 100,
        label: intl.get(`mallf.common.model.remark`).d('备注'),
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.action').d('操作'),
      },
      {
        name: 'companyId',
      },
      {
        name: 'itemCodeLov',
        type: 'object',
        label: intl.get(`mallf.common.view.item.code`).d('物料编码'),
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
        name: 'itemName',
        disabled: true,
        label: intl.get('mallf.common.view.item.name').d('物料名称'),
        bind: 'itemCodeLov.itemName',
      },
      {
        name: 'itemCode',
        bind: 'itemCodeLov.itemCode',
      },
      {
        name: 'itemId',
        bind: 'itemCodeLov.itemId',
      },

      {
        name: 'categoryLov',
        type: 'object',
        label: intl.get('mallf.common.view.item.categoryName').d('物料分类'),
        lovCode: 'SPRM.ITEM_CATEGOR',
        ignore: 'always',
        valueField: 'categoryId',
        textField: 'categoryName',
        lovPara: { tenantId, enabledFlag: 1 },
        transformResponse: (_, record) => {
          return record.categoryId
            ? {
                categoryId: record.categoryId,
                categoryName: record.categoryName,
              }
            : null;
        },
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'categoryName',
        bind: 'categoryLov.categoryName',
      },
    ],
  };
};

export default DS;
