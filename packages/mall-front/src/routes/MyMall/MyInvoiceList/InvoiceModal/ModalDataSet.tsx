import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { InvoiceType, InvoiceContent } from '../enum';

const getRequiredFlag = ({record})=> [ "2", "4" ].includes(record.get('invoiceType'));

interface IDsProps {
  readOnly: boolean;
  invoiceRequestId?: string | Number;
  consignmentCode: string;
  cecFromCode?: string;
  skuId?: string | Number;
  invoiceState?: string;
}

// 查看发票-基本信息
export const viewInvoiceFormDs = (): DataSetProps => ({
  fields: [
    {
      name: 'orderCode',
      label: intl.get('mallf.myInvoice.view.order.srmPoNum').d('商城订单号'),
    },
    {
      name: 'cecOrderCode',
      label: intl.get('mallf.myInvoice.view.order.ecOrderNum').d('电商订单号'),
    },
    {
      name: 'invoiceMethod',
      label: intl.get('mallf.myInvoice.model.invoiceMethod').d('开票方式'),
    },
  ],
});

// 开票信息
export const invoiceFormDs = ({readOnly, invoiceRequestId, consignmentCode, cecFromCode, skuId, invoiceState}: IDsProps) :DataSetProps => ({
  forceValidate: true,
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'ecConsignmentCode',
      label: intl.get('mallf.myInvoice.model.ecSubOrderNum').d('电商子订单号'),
    },
    {
      name: 'requestStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'invoiceHeaderLov',
      label: intl.get('mallf.myInvoice.model.invoiceTitle').d('发票抬头'),
      lovCode: 'S2FUL.COMPANY_INVOICE.FOR_PUR_COMPANY_NAME',
      textField: 'invoiceHeader',
      required: true,
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
    {
      name: 'companyId',
      bind: 'invoiceHeaderLov.companyId',
    },
    {
      name: 'invoiceHeader',
      label: intl.get('mallf.myInvoice.model.invoiceTitle').d('发票抬头'),
      bind: 'invoiceHeaderLov.invoiceHeader',
    },
    {
      name: 'taxRegistrationNumber',
      label: intl.get('mallf.myInvoice.model.taxRegistrationNumber').d('纳税人识别号'),
      bind: 'invoiceHeaderLov.taxRegistrationNumber',
      required: true,
    },
    {
      name: 'depositBank',
      label: intl.get('mallf.myInvoice.model.depositBank').d('开户银行'),
      bind: 'invoiceHeaderLov.depositBank',
      dynamicProps: {
        required: getRequiredFlag,
      },
    },
    {
      name: 'bankAccountNum',
      label: intl.get('mallf.myInvoice.model.bankAccountNum').d('银行账号'),
      bind: 'invoiceHeaderLov.bankAccountNum',
      dynamicProps: {
        required: getRequiredFlag,
      },
    },
    {
      name: 'taxRegistrationAddress',
      label: intl.get('mallf.common.model.registerAddress').d('注册地址'),
      bind: 'invoiceHeaderLov.taxRegistrationAddress',
      dynamicProps: {
        required: getRequiredFlag,
      },
    },
    {
      name: 'taxRegistrationPhone',
      label: intl.get('mallf.common.model.registerPhone').d('注册电话'),
      bind: 'invoiceHeaderLov.taxRegistrationPhone',
      dynamicProps: {
        required: getRequiredFlag,
      },
    },
    {
      name: 'invoiceTypeSelect',
      type: FieldType.object,
      label: intl.get('mallf.myInvoice.model.invoiceType').d('发票类型'),
      required: true,
      dynamicProps: {
        lookupCode({record}){
          return record && 'SMAL.INVOICE_TYPE_FOR_ORDER';
        },
        lovPara({record}) {
          return {
            companyId: record.get('companyId') || record.get('purchaseCompanyId'),
            ecPlatformCode: cecFromCode,
            skuId,
            invoiceMethod: invoiceState === 'GATHER' ? 1 : 2,
          };
        },
      },
    },
    {
      name: 'invoiceType',
      bind: 'invoiceTypeSelect.value',
      transformResponse(value) {
        switch (value) {
          case InvoiceType.VAT_INVOICE:
            return '1';
          case InvoiceType.SPECIAL_INVOICE:
            return '2';
          case InvoiceType.DIGITAL_VAT_INVOICE:
            return '3';
          case InvoiceType.DIGITAL_SPECIAL_INVOICE:
            return '4';
          default:
            break;
        }
      },
      transformRequest(value) {
        switch (value) {
          case '1':
            return InvoiceType.VAT_INVOICE;
          case '2':
            return InvoiceType.SPECIAL_INVOICE;
          case '3':
            return InvoiceType.DIGITAL_VAT_INVOICE;
          case '4':
            return InvoiceType.DIGITAL_SPECIAL_INVOICE;
          default:
            break;
        }
      },
    },
    {
      name: 'invoiceTypeName',
      bind: 'invoiceTypeSelect.meaning',
      ignore: FieldIgnore.always,
    },
    {
      name: 'invoiceTypeMeaning',
      label: intl.get('mallf.myInvoice.model.invoiceType').d('发票类型'),
    },
    {
      name: 'invoiceContentSelect',
      type: FieldType.object,
      label: intl.get('mallf.myInvoice.model.invoiceDetailType').d('发票内容'),
      required: true,
      dynamicProps: {
        lookupCode({record}){
          return record && 'SMAL.INVOICE_CONTENT_FOR_ORDER';
        },
        lovPara({record}) {
          return {
            companyId: record.get('companyId') || record.get('purchaseCompanyId'),
            ecPlatformCode: cecFromCode,
            skuId,
          };
        },
      },
    },
    {
      name: 'invoiceContent',
      bind: 'invoiceContentSelect.value',
      transformResponse(value) {
        switch (value) {
          case InvoiceContent.DETAIL:
            return '1';
          case InvoiceContent.CATEGORY:
            return '2';
          case InvoiceContent.GIFTCARD:
            return '3';
          default:
            break;
        }
      },
      transformRequest(value) {
        switch (value) {
          case '1':
            return InvoiceContent.DETAIL;
          case '2':
            return InvoiceContent.CATEGORY;
          case '3':
            return InvoiceContent.GIFTCARD;
          default:
            break;
        }
      },
    },
    {
      name: 'invoiceContentName',
      label: intl.get('mallf.myInvoice.model.invoiceDetailType').d('发票内容'),
      ignore: FieldIgnore.always,
      bind: 'invoiceContentSelect.meaning',
    },
    {
      name: 'billToAddressLov',
      label: intl.get('mallf.myInvoice.model.billToAddress').d('收单地址'),
      lovCode: 'SMAL.INVOICE_ADDRESS_CHOOSE_LIST',
      required: true,
      type: FieldType.object,
      ignore: FieldIgnore.always,
      dynamicProps: {
        lovPara({record}) {
          return {
            companyId: record.get('companyId') || record.get('purchaseCompanyId'),
          };
        },
      },
    },
    {
      name: 'addressId',
      bind: 'billToAddressLov.addressId',
    },
    {
      name: 'billToContact',
      bind: 'billToAddressLov.mobile',
    },
    {
      name: 'billToPerson',
      bind: 'billToAddressLov.contactName',
    },
    {
      name: 'billToAddress',
      label: intl.get('mallf.myInvoice.model.billToAddress').d('收单地址'),
      bind: 'billToAddressLov.fullAddress',
    },
    {
      name: 'remark',
      label: intl.get(`mallf.common.model.remark`).d('备注'),
      maxLength: 40,
    },
  ],
  events: {
    update: ({ record, name }) => {
      if(name === 'invoiceHeaderLov') {
        record.set('billToAddressLov', null);
      }
    },
  },
  transport: {
    read: () => {
      const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${getOrganizationId()}/invoice-requests/mall-invoice-request-${readOnly ? 'detail' : 'review'}`;
      return {
        url: queryUrl,
        method: 'GET',
        data: {
          consignmentCode,
          invoiceRequestId,
        },
      };
    },
  },
});

// 商品信息
export const productTableDs = ({readOnly, invoiceRequestId, consignmentCode}: IDsProps): DataSetProps => ({
  autoQuery: true,
  selection: false,
  paging: true,
  fields: [
    {
      name: 'skuName',
      label: intl.get('mallf.myInvoice.model.search.commodityNames').d('商品名称'),
    },
    {
      name: 'invoiceRequestQuantity',
      label: intl.get('mallf.myInvoice.model.invoiceRequestQuantity').d('申请数量'),
    },
    {
      name: 'unitPriceMeaning',
      label: intl.get('mallf.common.model.unitPrice').d('单价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      label: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
    },
  ],
  transport: {
    read: () => {
      const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${getOrganizationId()}/invoice-orders/mall-invoice-request-product-${readOnly ? 'detail' : 'review'}`;
      return {
        url: queryUrl,
        method: 'GET',
        data: {
          consignmentCode,
          invoiceRequestId,
        },
      };
    },
  },
});

// 发票信息
export const invoiceTableDs = ({consignmentCode}):DataSetProps => ({
  autoQuery: true,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'invoiceCode',
      label: intl.get('mallf.myInvoice.model.common.invoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceBatch',
      label: intl.get('mallf.myInvoice.model.invoiceBatch').d('发票号'),
    },
    {
      name: 'invoiceTypeMeaning',
      label: intl.get('mallf.myInvoice.model.invoiceType').d('发票类型'),
    },
    {
      name: 'invoiceContentName',
      label: intl.get('mallf.myInvoice.model.invoiceDetailType').d('发票内容'),
    },
    {
      name: 'invoiceAmountMeaning',
      label: intl.get('mallf.myInvoice.model.invoiceTotalAmount').d('发票金额'),
    },
    {
      name: 'invoiceTime',
      label: intl.get('mallf.myInvoice.view.creationDate').d('开票时间'),
      type: FieldType.dateTime,
      format: DEFAULT_DATE_FORMAT,
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: () => {
      const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${getOrganizationId()}/invoices/invoiceDetail`;
      return {
        url: queryUrl,
        method: 'GET',
        data: {
          consignmentCode,
        },
      };
    },
  },
});
