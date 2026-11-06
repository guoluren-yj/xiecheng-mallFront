import { getCurrentOrganizationId } from 'utils/utils';

export default function ds() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'unitLov',
        type: 'object',
        label: '组织',
        lovCode: 'SMAL.GOLDWIND.SUB_UNIT_DEPT',
        required: true,
        lovPara: {
          tenantId: getCurrentOrganizationId(),
        },
      },
      {
        name: 'unitId',
        bind: 'unitLov.dataId',
      },
      {
        name: 'unitName',
        bind: 'unitLov.dataName',
      },
      {
        name: 'unitCode',
        bind: 'unitLov.dataCode',
      },
      {
        name: 'companyLov',
        type: 'object',
        label: '公司',
        lovCode: 'SMAL.GOLD.SUB_AUTH_COMPANY',
        required: true,
      },
      {
        name: 'companyName',
        bind: 'companyLov.dataName',
      },
      {
        name: 'companyId',
        bind: 'companyLov.dataId',
      },
      {
        name: 'companyNum',
        bind: 'companyLov.dataCode',
      },
    ],
  };
}
