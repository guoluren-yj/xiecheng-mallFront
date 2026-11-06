import intl from 'utils/intl';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import { getOrganizationId } from 'utils/utils';

// 详情formDs
const DS = () => ({
  fields: [
    {
      name: 'purchaseHeaderNum',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.purchaseDetail.view.mallRequset.number').d('商城申请号'),
    },
    {
      name: 'prNum',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.purchaseDetail.model.purchaseApplicationNum').d('采购申请号'),
    },
    {
      name: 'companyLov',
      type: 'object',
      textField: 'companyName',
      valueField: 'companyId',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { tenantId: getOrganizationId() },
      required: true,
      label: intl.get('mallf.purchaseDetail.view.company.name').d('公司名称'),
      transformResponse: (_, { companyId, companyName }) => {
        return companyId ? { companyId, companyName } : null;
      },
    },
    {
      bind: 'companyLov.companyId',
      name: 'companyId',
      type: 'string',
    },
    {
      bind: 'companyLov.companyName',
      name: 'companyName',
      type: 'string',
    },

    {
      name: 'ouLov',
      type: 'object',
      textField: 'ouName',
      valueField: 'ouId',
      lovCode: 'SPFM.USER_AUTH.OU',
      required: true,
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: getOrganizationId(),
          companyId: record.get('companyId'),
          enabledFlag: 1,
        }),
        disabled: ({ record }) => !record.get('companyId'),
      },
      label: intl.get(`mallf.purchaseDetail.model.businessEntity`).d('业务实体'),
      transformResponse: (_, { ouId, ouName }) => {
        return ouId ? { ouId, ouName } : null;
      },
    },
    {
      bind: 'ouLov.ouId',
      name: 'ouId',
      type: 'string',
    },
    {
      bind: 'ouLov.ouName',
      name: 'ouName',
      type: 'string',
    },

    {
      name: 'purchaseOrgLov',
      type: 'object',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
      lovCode: 'HPFM.PURCHASE_ORGANIZATION_M',
      lovQueryAxiosConfig: (code, _, { data }) => {
        return {
          url: `/spfm/v1/${getOrganizationId()}/ope-pur-organizations/cascade/${data.ouId}`,
          method: 'GET',
          data,
        };
      },
      required: true,
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: getOrganizationId(),
          ouId: record.get('ouId'),
        }),
        disabled: ({ record }) => !record.get('ouId'),
      },
      label: intl.get('mallf.purchaseDetail.model.purchaseOrg').d('采购组织'),
      transformResponse: (_, { purchaseOrgId, purchaseOrgName }) => {
        return purchaseOrgId ? { purchaseOrgId, purchaseOrgName } : null;
      },
    },
    {
      bind: 'purchaseOrgLov.purchaseOrgId',
      name: 'purchaseOrgId',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationName',
      name: 'purchaseOrgName',
      type: 'string',
    },

    {
      name: 'purchaseAgentLov',
      type: 'object',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovCode: 'SPUC.PURCHASE_AGENT',
      computedProps: {
        lovPara: ({ record }) => ({
          purchaseOrgIds: record.get('purchaseOrgId'),
        }),
        disabled: ({ record }) => !record.get('purchaseOrgId'),
      },
      label: intl.get('mallf.purchaseDetail.model.purchaseAgent').d('采购员'),
      transformResponse: (_, { purchaseOrgId, purchaseOrgName }) => {
        return purchaseOrgId ? { purchaseOrgId, purchaseOrgName } : null;
      },
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentName',
      name: 'purchaseAgentName',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentId',
      name: 'purchaseAgentId',
      type: 'string',
    },

    {
      name: 'prRequestedName',
      type: 'string',
      required: true,
      disabled: true,
      label: intl.get('mallf.addPurchase.model.application.person').d('申请人'),
    },
    {
      name: 'requestedBy',
      type: 'string',
    },
    {
      name: 'requestDate',
      type: 'date',
      required: true,
      min: moment(new Date()).format(DATETIME_MIN),
      defaultValue: moment(new Date()),
      label: intl.get('mallf.purchaseDetail.model.application.date').d('申请日期'),
    },
    {
      name: 'manualRequestTypeSelect',
      type: 'object',
      required: true,
      lookupCode: 'SPUC.PR_DEMAND_TYPE',
      label: intl.get('mallf.purchaseDetail.model.application.type').d('申请类型'),
    },
    {
      name: 'prTypeCode',
      bind: 'manualRequestTypeSelect.prTypeCode',
    },
    {
      name: 'prTypeName',
      bind: 'manualRequestTypeSelect.meaning',
    },
    {
      name: 'prTypeId',
      bind: 'manualRequestTypeSelect.value',
    },
    // {
    //   name: 'prTypeCode',
    //   // type: 'object',
    //   required: true,
    //   // lookupAxiosConfig: ({dataSet}) => ({
    //   //   url: '/spuc/v1/lovs/sql/data',
    //   //   params: {
    //   //     page: 0,
    //   //     size: 10,
    //   //     newMallFlag: 1,
    //   //     tenantId: 0,
    //   //     lovCode: 'SPUC.PR_DEMAND_TYPE_SITE',
    //   //   },
    //   //   transformResponse(data) {
    //   //     const newData = data ? JSON.parse(data) : {};
    //   //     console.log(dataSet.current, dataSet.current?.get('prTypeId'));
    //   //     return newData?.content.map(p => ({
    //   //       ...p,
    //   //       value: p.prTypeCode,
    //   //       meaning: p.prTypeName,
    //   //     }));
    //   //   },
    //   // }),
    //   // ignore: 'always',
    //   // defaultValue: 'MATERIALS',
    //   label: intl.get('mallf.common.model.application.type').d('申请类型'),
    // },
    // {
    //   name: 'prTypeName',
    // },
    // {
    //   name: 'prTypeId',
    // },
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
      name: 'receiverAddressId',
      type: 'string',
      bind: 'addressLov.addressId',
    },
    {
      name: 'receiverAddressName',
      type: 'string',
      bind: 'addressLov.address',
    },
    {
      name: 'receiverRegionId',
      type: 'string',
      bind: 'addressLov.regionId',
    },
    {
      name: 'remark',
      type: 'string',
      maxLength: 100,
      label: intl.get('mallf.purchaseDetail.view.apply.remark').d('申请说明'),
    },
  ],
});

export default DS;
