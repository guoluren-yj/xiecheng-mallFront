import intl from 'utils/intl';
// import moment from 'moment';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getOrganizationId } from 'utils/utils';
import { fetchSetAttributeVarchar12 } from '../index';
// 详情formDs
const DS = () => ({
  fields: [
    // 币种
    {
      name: 'currencyLov',
      type: 'object',
      textField: 'currencyName',
      valueField: 'currencyId',
      lovCode: 'SMDM.CURRENCY',
      lovPara: { tenantId: getOrganizationId() },
      required: true,
      label: intl.get('mallf.common.view.feild.currency').d('币种'),
      transformResponse: (_, { companyId, companyName }) => {
        return companyId ? { companyId, companyName } : null;
      },
    },
    {
      bind: 'currencyLov.currencyName',
      name: 'currencyName',
      type: 'string',
    },
    {
      bind: 'currencyLov.currencyId',
      name: 'currencyId',
      type: 'string',
    },
    {
      bind: 'currencyLov.currencyCode',
      name: 'currencyCode',
      type: 'string',
    },
    // 部门
    {
      name: 'bumenLov',
      type: 'object',
      textField: 'unitName',
      valueField: 'unitId',
      lovCode: 'S2FUL.USER_UNIT',
      required: true,
      label: intl.get('mallf.common.view.feild.bumen').d('部门'),
      transformResponse: (_, { companyId, companyName }) => {
        return companyId ? { companyId, companyName } : null;
      },
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: getOrganizationId(),
          companyId: record.get('purchaseCompanyId'),
        }),
      },
    },
    {
      bind: 'bumenLov.unitId',
      name: 'unitId',
      type: 'string',
    },
    {
      bind: 'bumenLov.unitName',
      name: 'unitName',
      type: 'string',
    },
    {
      bind: 'bumenLov.unitCode',
      name: 'unitCode',
      type: 'string',
    },
    // 公司
    {
      name: 'companyLov',
      type: 'object',
      textField: 'companyName',
      valueField: 'companyId',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { tenantId: getOrganizationId() },
      required: true,
      label: intl.get('mallf.common.view.company.name').d('公司名称'),
      transformResponse: (_, { companyId, companyName }) => {
        return companyId ? { companyId, companyName } : null;
      },
    },
    {
      bind: 'companyLov.companyId',
      name: 'purchaseCompanyId',
      type: 'string',
    },
    {
      bind: 'companyLov.companyName',
      name: 'purchaseCompanyName',
      type: 'string',
    },
    {
      bind: 'companyLov.companyNum',
      name: 'purchaseCompanyCode',
      type: 'string',
    },
    // 业务实体
    {
      name: 'ouLov',
      type: 'object',
      textField: 'ouName',
      valueField: 'ouId',
      lovCode: 'SPFM.USER_AUTH.OU',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: getOrganizationId(),
          companyId: record.get('purchaseCompanyId'),
          enabledFlag: 1,
        }),
        disabled: ({ record }) => !record.get('purchaseCompanyId'),
      },
      label: intl.get(`mallf.common.model.businessEntity`).d('业务实体'),
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
      bind: 'ouLov.ouCode',
      name: 'ouCode',
      type: 'string',
    },
    {
      name: 'purchaseOrgLov',
      type: 'object',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
      lovCode: 'HPFM.PURCHASE_ORGANIZATION_M',
      required: true,
      lovQueryAxiosConfig: (code, _, { data }) => {
        return {
          url: `/spfm/v1/${getOrganizationId()}/ope-pur-organizations/cascade/${data.ouId}`,
          method: 'GET',
          data,
        };
      },
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: getOrganizationId(),
          ouId: record.get('ouId'),
        }),
        disabled: ({ record }) => !record.get('ouId'),
      },
      label: intl.get('mallf.common.model.purchaseOrg').d('采购组织'),
      transformResponse: (_, { purchaseOrgId, purchaseOrgName }) => {
        return purchaseOrgId ? { purchaseOrgId, purchaseOrgName } : null;
      },
    },
    {
      bind: 'purchaseOrgLov.purchaseOrgId',
      name: 'purchaseOrganizationId',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationName',
      name: 'purchaseOrganizationName',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationCode',
      name: 'purchaseOrganizationCode',
      type: 'string',
    },
    {
      name: 'purchaseAgentLov',
      type: 'object',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovCode: 'SPUC.PURCHASE_AGENT',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => ({
          purchaseOrgIds: record.get('purchaseOrganizationId'),
        }),
        disabled: ({ record }) => !record.get('purchaseOrganizationId'),
      },
      label: intl.get('mallf.purchaseDetail.model.purchaseAgent').d('采购员'),
      transformResponse: (_, { purchaseOrgId, purchaseOrgName }) => {
        return purchaseOrgId ? { purchaseOrgId, purchaseOrgName } : null;
      },
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentName',
      name: 'agentName',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentId',
      name: 'agentId',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentCode',
      name: 'agentCode',
      type: 'string',
    },
    {
      name: 'requestByLov',
      type: 'object',
      textField: 'userName',
      valueField: 'userId',
      lovCode: 'SPCM.ACCEPT_USER',
      lovPara: { tenantId: getOrganizationId() },
      required: true,
      label: intl.get('mallf.addPurchase.model.application.person').d('申请人'),
      transformResponse: (_, { userId, userName }) => {
        return userId ? { userId, userName } : null;
      },
    },
    {
      name: 'requestByName',
      bind: 'requestByLov.userName',
    },
    {
      name: 'requestBy',
      bind: 'requestByLov.userId',
    },
    {
      name: 'requestedBy',
      type: 'string',
    },
    // {
    //   name: 'requestDate',
    //   type: 'date',
    //   required: true,
    //   disabled: true,
    //   min: moment(new Date()).format(DEFAULT_DATETIME_FORMAT),
    //   label: intl.get('mallf.common.model.create.time').d('创建时间'),
    // },
    {
      name: 'manualRequestTypeSelect',
      type: 'object',
      lookupCode: 'SPUC.PR_DEMAND_TYPE',
      label: intl.get('mallf.common.model.application.type').d('申请类型'),
    },
    {
      name: 'manualRequestTypeCode',
      bind: 'manualRequestTypeSelect.prTypeCode',
    },
    {
      name: 'manualRequestTypeName',
      bind: 'manualRequestTypeSelect.meaning',
    },
    {
      name: 'manualRequestTypeId',
      bind: 'manualRequestTypeSelect.value',
    },
    {
      name: 'receiverAddressId',
      type: 'string',
    },
    {
      name: 'receiverAddressName',
      type: 'string',
    },
    {
      name: 'receiverRegionId',
      type: 'string',
    },
    {
      name: 'remark',
      type: 'string',
      maxLength: 100,
      label: intl.get('mallf.common.view.apply.remark').d('申请说明'),
    },

    {
      name: 'predictAmount',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.common.view.estimated.amount').d('预估总金额（含税）'),
    },

    {
      name: 'remark',
      type: 'string',
      label: intl.get('mallf.common.view.apply.remark').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
    },
    {
      name: 'creationDate',
      type: 'date',
      disabled: true,
      label: intl.get('mallf.common.view.submit.time').d('提交时间'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      // 修改业务实体
      if (name === 'ouLov') {
        fetchSetAttributeVarchar12(value.ouId, record);
      }
    },
  },
});

export default DS;
