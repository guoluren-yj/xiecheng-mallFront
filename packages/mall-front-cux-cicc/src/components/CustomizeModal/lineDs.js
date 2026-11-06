import { getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

export default function lineDs() {
  return {
    fields: [
      {
        name: 'attributeVarchar2Lov',
        type: 'object',
        label: intl.get(`mallf.common.model.costCenter`).d('成本中心'),
        lovCode: 'SPRM.COST_CENTER',
        valueField: 'costCode',
        textField: 'costName',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId'),
              ouId: record.get('ouId'),
              tenantId: getOrganizationId(),
            };
          },
        },
      },
      {
        name: 'attributeVarchar2',
        bind: 'attributeVarchar2Lov.costCode',
      },
      {
        name: 'attributeVarchar2Meaning',
        bind: 'attributeVarchar2Lov.costName',
      },
      {
        name: 'attributeBigint1Lov',
        type: 'object',
        lovCode: 'SCUX.CICC.COST_BEARING_DEPARTMENT',
        valueField: 'unitId',
        textField: 'unitName',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId'),
              tenantId: getOrganizationId(),
            };
          },
        },
      },
      {
        name: 'attributeBigint1',
        bind: 'attributeBigint1Lov.unitId',
      },
      {
        name: 'attributeBigint1Meaning',
        bind: 'attributeBigint1Lov.unitName',
      },
      {
        name: 'attributeVarchar7',
        bind: 'attributeBigint1Lov.unitCode',
      },

      {
        name: 'attributeVarchar4Lov',
        type: 'object',
        lovCode: 'SCUX.CICC.GROUP_INFO',
        valueField: 'groupName',
        textField: 'groupName',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              unitId: record.get('attributeBigint1'),
              tenantId: getOrganizationId(),
            };
          },
        },
      },
      {
        name: 'attributeVarchar4',
        bind: 'attributeVarchar4Lov.groupName',
      },
      {
        name: 'attributeVarchar4Meaning',
        bind: 'attributeVarchar4Lov.groupName',
      },

      {
        name: 'attributeVarchar3',
        bind: 'attributeVarchar3Lov.projectNum',
      },
      {
        name: 'attributeVarchar3Meaning',
        bind: 'attributeVarchar3Lov.projectName',
      },

      {
        name: 'attributeVarchar5',
        bind: 'attributeVarchar5Lov.employeeNum',
      },
      {
        name: 'attributeVarchar5Meaning',
        bind: 'attributeVarchar5Lov.name',
      },

      {
        name: 'attributeVarchar6',
        bind: 'attributeVarchar6Lov.employeeNum',
      },
      {
        name: 'attributeVarchar6Meaning',
        bind: 'attributeVarchar6Lov.name',
      },
    ],
  };
}
