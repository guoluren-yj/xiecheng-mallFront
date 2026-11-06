import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT, DEFAULT_MAX } from 'utils/constants';
import { getOrganizationId } from 'utils/utils';
import { lovDefineAxiosConfig } from 'utils/c7nUIConfig';

// 详情formDs
const DS = ({ headerDs, doubleUomFlag }) => {
  const tenantId = getOrganizationId();
  return {
    paging: false,
    fields: [
      {
        name: 'entryCode',
        type: 'string',
        label: intl.get('mallf.purchaseDetail.view.lineNum').d('行号'),
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
        name: 'packageQuantity',
        // required: true,
        min: 0,
        max: DEFAULT_MAX,
        label: intl.get('mallf.purchaseDetail.view.quantity').d('数量'),
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.get('customUomId');
          },
          required: () => doubleUomFlag,
        },
      },
      {
        name: 'requestQuantity',
        required: true,
        min: 0,
        max: DEFAULT_MAX,
        disabled: true,
        label: intl.get('mallf.purchaseDetail.view.basicNum').d('基本数量'),
        dynamicProps: {
          label: () => {
            return doubleUomFlag
              ? intl.get('mallf.purchaseDetail.view.basicNum').d('基本数量')
              : intl.get('mallf.purchaseDetail.view.quantity').d('数量');
          },
          disabled: ({ record }) => {
            return !record.get('uomId');
          },
        },
      },
      {
        name: 'customUomLov',
        label: intl.get('mallf.purchaseDetail.view.uom').d('单位'),
        type: 'object',
        // required: true,
        ignore: 'always',
        lovCode: 'SMDM_ITEM_ORG_UOM',
        textField: 'uomCodeAndName',
        dynamicProps: {
          required: () => doubleUomFlag,
          lovPara: ({ record }) => {
            // 开启双单位有物料传itemId
            return record.get('itemId') && doubleUomFlag ? { itemId: record.get('itemId') } : {};
          },
        },
      },
      {
        name: 'customUom',
        bind: 'customUomLov.uomCodeAndName',
      },
      {
        name: 'customUomId',
        bind: 'customUomLov.uomId',
      },
      {
        name: 'customUomCode',
        bind: 'customUomLov.uomCode',
      },
      {
        name: 'customUomName',
        bind: 'customUomLov.uomName',
      },
      {
        name: 'secondaryUomPrecision',
        bind: 'customUomLov.secondaryUomPrecision',
      },
      {
        name: 'uomLov',
        required: true,
        type: 'object',
        label: intl.get('mallf.purchaseDetail.view.basicUom').d('基本单位'),
        lovCode: 'SMDM.DUAL_UOM',
        ignore: 'always',
        valueField: 'uomId',
        textField: 'uomCodeAndName',
        dynamicProps: {
          label: () => {
            return doubleUomFlag
              ? intl.get('mallf.purchaseDetail.view.basicUom').d('基本单位')
              : intl.get('mallf.purchaseDetail.view.uom').d('单位');
          },
          // disabled: () => {
          //   return doubleUomFlag;
          // },
        },
        transformResponse: (_, { uomId, uomCodeAndName }) => {
          return uomId ? { uomId, uomCodeAndName } : null;
        },
      },
      {
        name: 'uom',
        bind: 'uomLov.uomCodeAndName',
      },
      {
        name: 'uomName',
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
        name: 'needByDate',
        type: 'date',
        min: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        // defaultValue: moment(new Date()),
        label: intl.get(`mallf.purchaseDetail.view.need.date`).d('需求日期'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('mallf.common.view.attachment.info').d('附件信息'),
      },
      {
        name: 'packageUnitPrice',
        // required: true,
        min: 0,
        max: DEFAULT_MAX,
        label: intl.get('mallf.purchaseDetail.view.estimated.unit.price').d('预估单价（含税）'),
        dynamicProps: {
          required: () => doubleUomFlag,
          disabled: ({ record }) => doubleUomFlag && !record.get('packageQuantity'),
        },
      },
      {
        name: 'predictUnitPrice',
        required: true,
        min: 0,
        max: DEFAULT_MAX,
        label: intl
          .get('mallf.purchaseDetail.view.estimated.unit.priceBasic')
          .d('预估单价（含税）- 基本单位'),
        dynamicProps: {
          // disabled: () => doubleUomFlag,
          label: () => {
            return doubleUomFlag
              ? intl
                  .get('mallf.purchaseDetail.view.estimated.unit.priceBasic')
                  .d('预估单价（含税）- 基本单位')
              : intl.get('mallf.purchaseDetail.view.estimated.unit.price').d('预估单价（含税）');
          },
        },
      },
      {
        name: 'predictEntryAmount',
        disabled: true,
        label: intl.get('mallf.purchaseDetail.view.line.amount.price').d('行金额（含税）'),
      },
      {
        name: 'receiverAddressId',
      },
      {
        name: 'addressLov',
        type: 'object',
        valueField: 'addressId',
        textField: 'address',
        label: intl.get(`mallf.purchaseDetail.model.receive.info`).d('收货信息'),
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
        label: intl.get('mallf.purchaseDetail.model.inventoryOrg').d('库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              itemId: record.get('itemId'),
              ouId: headerDs.current?.get('ouId'),
            };
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
        maxLength: 480,
        label: intl.get(`mallf.purchaseDetail.model.remark`).d('备注'),
      },
      {
        name: 'operate',
        label: intl.get('mallf.purchaseDetail.action').d('操作'),
      },
      {
        name: 'companyId',
      },
      {
        name: 'itemCodeLov',
        type: 'object',
        label: intl.get(`mallf.purchaseDetail.view.item.code`).d('物料编码'),
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
        label: intl.get('mallf.purchaseDetail.view.item.name').d('物料名称'),
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
        label: intl.get('mallf.purchaseDetail.view.item.categoryName').d('物料分类'),
        name: 'categoryLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        dynamicProps: {
          lovPara({ record }) {
            return {
              // size: 1000,
              tenantId,
              enabledFlag: 1,
              // purchaseOrgId: handleDetailField('purchaseOrgInfoRef', 'purchaseOrgId'),
              queryCategoryId: headerDs.current?.get('purchaseOrganizationId'),
              itemId: record.get('itemId'),
              prTypeId: headerDs.current?.get('prTypeId'),
            };
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                  dataSetProps: { paging: 'server' },
                };
              },
            ],
          };
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
    events: {
      update: ({ record, name, value }) => {
        // 双单位关闭时，基本单位和单位绑定，开启时，无物料和单位绑定
        if (name === 'customUomLov') {
          // 随单位精度控制，单位修改，清空数量
          record.set('packageQuantity', null);
          record.set('requestQuantity', null);
          record.set('packageUnitPrice', null);
          record.set('predictUnitPrice', null);
        }
        // 关闭双单位
        if (!doubleUomFlag) {
          // 双单位关闭时，基本单位和单位绑定
          if (name === 'uomLov') {
            const { uomId, uomCode, uomName, uomPrecision } = value || {};
            record.set(
              'customUomLov',
              uomId
                ? {
                    uomId,
                    uomCode,
                    uomName,
                    uomCodeAndName: `${uomCode}/${uomName}`,
                  }
                : null
            );
            record.set('uomPrecision', uomPrecision);
          }
          // 双单位关闭时，基本数量和数量绑定
          if (name === 'requestQuantity') {
            record.set('packageQuantity', record.get('requestQuantity'));
          }
          // 双单位关闭时，预估单价（含税）-基本单位 跟 预估单价（含税）绑定
          if (name === 'predictUnitPrice') {
            record.set('packageUnitPrice', record.get('predictUnitPrice'));
          }
        }
        // 开启双单位并且无物料
        if (doubleUomFlag && !record.get('itemId')) {
          if (name === 'customUomLov') {
            const { uomId, uomCode, uomName } = value || {};
            record.set(
              'uomLov',
              uomId
                ? {
                    uomId,
                    uomCode,
                    uomCodeAndName: `${uomCode}/${uomName}`,
                  }
                : null
            );
          }
          // 双单位开启时无物料和数量绑定
          if (name === 'packageQuantity') {
            record.set('requestQuantity', record.get('packageQuantity'));
          }
          // 双单位开启时，无物料，预估单价（含税）-基本单位 跟 预估单价（含税）绑定
          if (name === 'packageUnitPrice') {
            record.set('predictUnitPrice', record.get('packageUnitPrice'));
          }
        }
      },
    },
  };
};

export default DS;
