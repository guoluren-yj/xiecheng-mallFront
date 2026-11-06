import intl from 'utils/intl';
import { getUserConfigInfo, numberRender } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import { checkSaleBySagm } from 'services/homeService';
import { math } from 'choerodon-ui/dataset';

const fetchSetNewPrice = async ({ record, address = {} }) => {
  const { companyId, organizationId, levelPath } = getUserConfigInfo();
  const skuParamDTOS = [
    {
      quantity: record.get('quantity'),
      skuId: record.get('skuId'),
      sourceFrom: record.get('sourceType'),
    },
  ];
  const ecProductCheckDto = {
    tenantId: organizationId,
    address: address.fullAddress,
    provinceId: address.regionCodeList?.[0],
    cityId: address.regionCodeList?.[1],
    countyId: address.regionCodeList?.[2],
  };
  const params = {
    regionId: address.regionIdList?.[1],
    companyId,
    skuParamDTOS,
    ecProductCheckDto,
    queryEcPriceFlag: true,
    unitLevelPath: levelPath,
  };
  const res = await checkSaleBySagm(params);
  if (res && res.length) {
    // 修改地址后商品数据更新
    // 不管是否下架还是不可售，都赋值，可限制继续提交
    const newPrice = res[0] || {};
    [
      'priceHiddenFlag',
      'minPackageQuantity',
      'minPurchaseQuantity',
      'itemId',
      'itemCode',
      'itemName',
      'uomId',
      'uomCode',
      'uomName',
      'tax',
      'taxCode',
      'taxId',
      'taxRate',
      'currencyName',
      'currencyId',
      'currencyCode',
      'currencySymbol',
    ].forEach((code) => {
      record.set(code, newPrice[code]);
    });
    record.set('unitPrice', newPrice.sellPrice);
    record.set('unitPriceMeaning', newPrice.sellPriceMeaning || newPrice.sellPrice);
    record.set('per', newPrice.priceBatchQuantity);
    const newAmount = math.multipliedBy(newPrice.sellPrice, newPrice.quantity);
    record.set('amountMeaning', numberRender(newAmount, newPrice.financialPrecision, true));
    record.set('amount', newAmount);
  }
};

const formDataSet = (readOnly) => {
  return {
    forceValidate: true,
    fields: [
      {
        name: 'requestCode',
        label: intl.get(`mallf.myRequest.model.requestCode`).d('商城申请编码'),
      },
      {
        name: 'requestStatusMeaning',
        label: intl.get(`mallf.myRequest.model.requestStatus`).d('商城申请状态'),
      },
      {
        name: 'requestType',
        lookupCode: 'S2FUL.MALL_REQUEST_TYPE',
        label: intl.get(`mallf.myRequest.model.requestType`).d('申请类型'),
      },
      {
        name: 'requestTypeMeaning',
        label: intl.get(`mallf.myRequest.model.requestType`).d('申请类型'),
      },
      {
        name: 'requestAmountMeaning',
        label: intl.get(`mallf.myRequest.model.requestAmountMeaning`).d('预估金额(含税)'),
        transformResponse: (val, record) => val || record.requestAmount,
      },
      {
        name: 'requestNakedAmountMeaning',
        label: intl.get(`mallf.myRequest.model.requestNakedAmountMeaning`).d('预估金额(不含税)'),
        transformResponse: (val, record) => val || record.requestNakedAmount,
      },
      {
        name: 'handleByLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HIAM.TENANT.USER',
        label: intl.get(`mallf.myRequest.model.handleByName`).d('受理人'),
      },
      {
        name: 'handleBy',
        bind: 'handleByLov.id',
      },
      {
        name: 'handleByName',
        bind: 'handleByLov.realName',
        label: intl.get(`mallf.myRequest.model.handleByName`).d('受理人'),
      },
      {
        name: 'creationDate',
        label: intl.get(`mallf.myRequest.model.creationDate`).d('创建日期'),
      },
      {
        name: 'outerAttachmentUuid',
        label: intl.get('mallf.common.view.outterAttachment').d('外部附件'),
        type: 'attachment',
      },
      {
        name: 'attachmentUuid',
        label: intl.get('mallf.common.view.innerAttachment').d('内部附件'),
        type: 'attachment',
      },
      {
        name: 'remark',
        label: readOnly
          ? intl.get(`mallf.myRequest.model.remark`).d('备注')
          : intl.get(`mallf.myRequest.model.notes`).d('备注说明'),
      },
      {
        name: 'activityTypeMeaning',
        label: intl.get(`mallf.myRequest.model.activityType`).d('活动类型'),
      },
    ],
  };
};

const tableDataSet = ({ requestId, readOnly, customizeUnitCode }) => {
  const { userId, companyId, organizationId } = getUserConfigInfo();
  return {
    selection: readOnly ? false : 'multiple',
    paging: true,
    autoQuery: true,
    primaryKey: 'requestEntryId',
    forceValidate: true,
    cacheSelection: true,
    record: {
      dynamicProps: {
        selectable: (record) =>
          ['CATA', 'MANUAL'].includes(record.get('sourceType')) &&
          ['RETURNED', 'REJECTED', 'NEW'].includes(record.get('lineStatus')),
      },
    },
    fields: [
      {
        name: 'lineNum',
        label: intl.get(`mallf.common.view.lineSeq`).d('行号'),
      },
      {
        name: 'skuName',
        label: intl.get(`mallf.myRequest.model.skuName`).d('商品名称'),
      },
      {
        name: 'lineStatusMeaning',
        label: intl.get(`mallf.myRequest.model.lineStatusMeaning`).d('行状态'),
      },
      {
        name: 'sourceTypeMeaning',
        label: intl.get(`mallf.myRequest.model.sourceTypeMeaning`).d('来源类型'),
      },
      {
        name: 'skuTypeMeaning',
        label: intl.get(`mallf.myRequest.model.skuTypeMeaning`).d('商品类型'),
      },
      {
        name: 'unitPriceMeaning',
        label: intl.get(`mallf.myRequest.model.unitPriceMeaning`).d('单价(含税)'),
        transformResponse: (value, record) => value || record.unitPrice,
      },
      {
        name: 'unitPrice',
        min: 0,
        label: intl.get(`mallf.myRequest.model.unitPriceMeaning`).d('单价(含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('defaultPrecision'),
          required: ({ record }) =>
            ['RETURNED', 'REJECTED', 'NEW'].includes(record.get('lineStatus')) &&
            record.get('sourceType') === 'MANUAL',
          type: ({ record }) =>
            ['RETURNED', 'REJECTED', 'NEW'].includes(record.get('lineStatus')) &&
            record.get('sourceType') === 'MANUAL'
              ? 'number'
              : 'string',
        },
      },
      {
        name: 'per',
        label: intl.get(`mallf.myRequest.model.per`).d('每'),
      },
      {
        name: 'amountMeaning',
        label: intl.get(`mallf.myRequest.model.amountMeaning`).d('金额(含税)'),
        transformResponse: (val, record) => val || record.amount,
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get(`mallf.myRequest.model.attachmentUuidLine`).d('行附件'),
        fileSize: 1024 * 1024 * 100,
      },
      {
        name: 'addressLov',
        type: 'object',
        lovCode: 'SMCT.ADDRESS',
        valueField: 'addressId',
        textField: 'fullAddress',
        label: intl.get(`mallf.myRequest.model.address`).d('地址'),
        dynamicProps: {
          lovPara: ({ record }) => ({
            userId,
            companyId: record.get('purchaseCompanyId') || companyId,
          }),
          required: ({ record }) =>
            ['RETURNED', 'REJECTED', 'NEW'].includes(record.get('lineStatus')) &&
            ['CATA', 'MANUAL'].includes(record.get('sourceType')) &&
            record.get('agreementBusinessType') !== 'RECEIVE',
        },
      },
      {
        name: 'receiveAddressId',
        bind: 'addressLov.addressId',
      },
      {
        name: 'receiveAddress',
        bind: 'addressLov.address',
      },
      {
        name: 'receiveContactName',
        bind: 'addressLov.contactName',
      },
      {
        name: 'receiveMobilePhone',
        bind: 'addressLov.mobile',
      },
      {
        name: 'receiveFullAddress',
        bind: 'addressLov.fullAddress',
        label: intl.get(`mallf.myRequest.model.address`).d('地址'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`mallf.myRequest.model.invOrganizationName`).d('库存组织名称'),
      },
      {
        name: 'ouName',
        label: intl.get(`mallf.myRequest.model.ouName`).d('业务组织名称'),
      },
      {
        name: 'purOrganizationName',
        label: intl.get(`mallf.myRequest.model.purOrganizationName`).d('采购组织名称'),
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get(`mallf.myRequest.model.purchaseCompanyName`).d('采购公司名称'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`mallf.myRequest.model.supplierCompanyName`).d('供应商公司名称'),
      },
      {
        name: 'unitName',
        label: intl.get(`mallf.myRequest.model.unitName`).d('部门名称'),
      },
      {
        name: 'quantityMeaning',
        label: intl.get(`mallf.myRequest.model.quantity`).d('数量'),
      },
      {
        name: 'quantity',
        type: 'number',
        min: 0,
        required: true,
        label: intl.get(`mallf.myRequest.model.quantity`).d('数量'),
        dynamicProps: {
          precision: ({ record }) => record.get('uomPrecision'),
        },
      },
      {
        name: 'remark',
        label: intl.get(`mallf.myRequest.model.remark`).d('备注'),
      },
      {
        name: 'compareView',
        label: intl.get(`mallf.myRequest.model.compare`).d('比价单'),
      },
      {
        name: 'itemLov',
        type: 'object',
        lovCode: 'SMAL.CUSTOMER_ITEM',
        valueField: 'itemId',
        textField: 'itemCode',
        label: intl.get('mallf.common.view.item.code').d('物料编码'),
      },
      {
        name: 'itemId',
        bind: 'itemLov.itemId',
      },
      {
        name: 'itemCode',
        bind: 'itemLov.itemCode',
      },
      {
        name: 'itemName',
        bind: 'itemLov.itemName',
        label: intl.get('mallf.common.view.item.name').d('物料名称'),
      },
      {
        name: 'uomLov',
        type: 'object',
        required: true,
        lovCode: 'SMDM.UOM',
        valueField: 'uomId',
        textField: 'uomName',
        label: intl.get('mallf.common.view.uom').d('单位'),
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
        name: 'uomName',
        bind: 'uomLov.uomName',
      },
      {
        name: 'uomPrecision',
        bind: 'uomLov.uomPrecision',
      },
    ],
    events: {
      update({ name, value, oldValue, record }) {
        if (['quantity'].includes(name) && value <= 0) {
          record.set(name, oldValue);
        }
        if (name === 'itemLov' && value) {
          record.set('uomLov', {
            uomId: value.uomId,
            uomCode: value.uomCode,
            uomName: value.uomName,
            uomPrecision: value.uomPrecision,
            uomCodeAndName: value.uomCodeAndName,
          });
        }
        if (name === 'addressLov' && value && record.get('sourceType') === 'CATA') {
          fetchSetNewPrice({ record, address: value });
        }
      },
    },
    transport: {
      read: () => {
        const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-request-entrys/mall-list`;
        return {
          url: queryUrl,
          method: 'GET',
          data: {
            requestId,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export { formDataSet, tableDataSet };
