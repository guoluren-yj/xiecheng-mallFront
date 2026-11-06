import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';

const tableDs = ({ disabled, organizationId, budgetData, saveCallBack }) => ({
  primaryKey: 'orderSeq',
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      name: 'orderSeq',
    },
    {
      label: intl.get('mallf.common.view.projectNum').d('项目编码'),
      name: 'project',
      type: 'object',
      valueField: 'projectNum',
      textField: 'projectNum',
      lovCode: 'SCUX_BRANDMAX_PROJECT_VIEW',
      required: true,
      dynamicProps() {
        return {
          disabled,
        };
      },
    },
    {
      name: 'projectId',
      bind: 'project.projectId',
    },
    {
      name: 'projectNum',
      bind: 'project.projectNum',
    },
    {
      name: 'projectName',
      label: intl.get('mallf.common.view.projectName').d('项目名称'),
      bind: 'project.projectName',
    },
    {
      name: 'brandmaxCompanyId',
      bind: 'project.companyId',
    },
    {
      label: intl.get('mallf.common.view.companyOfCost').d('费用所属公司'),
      name: 'brandmaxCompanyName',
      bind: 'project.companyName',
    },
    {
      name: 'profitCenter',
      bind: 'project.attributeVarchar1',
    },
    {
      label: intl.get('mallf.common.view.profitsCenter').d('利润中心'),
      name: 'profitCenterName',
      bind: 'project.attributeVarchar18',
    },
    {
      label: intl.get('mallf.common.view.budgetAccount').d('预算科目'),
      name: 'budgetSubject',
      type: 'object',
      valueField: 'attributeCode',
      textField: 'attributeVarchar2',
      lovCode: 'SCUX_BRANDMAX_BUDGET_SUBJECT_VIEW',
      required: true,
      dynamicProps({ record }) {
        return {
          disabled: disabled || !record.get('projectId'),
          lovPara: {
            projectId: record.get('projectId'),
          },
        };
      },
    },
    {
      name: 'budgetSubjectId',
      bind: 'budgetSubject.projectAttributeId',
    },
    {
      name: 'budgetSubjectCode',
      bind: 'budgetSubject.attributeCode',
    },
    {
      name: 'budgetSubjectName',
      bind: 'budgetSubject.attributeVarchar2',
    },
    {
      label: intl.get('mallf.common.view.costType').d('费用类型'),
      name: 'costTypeCode',
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'SCUX.BRANDMAX_FEE_TYPE',
      required: true,
      dynamicProps() {
        return {
          disabled,
        };
      },
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/brandmax-budget-infos`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data }) => ({
      url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/brandmax-budget-infos`,
      method: 'DELETE',
      data,
      transformResponse: () => {
        saveCallBack([
          {
            ...budgetData,
            brandmaxBudgetInfoList: [],
            budgetInfoList: [],
          },
        ]);
      },
    }),
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'project') {
        record.set('profitCenterName', value?.attributeVarchar18 || value?.attributeVarchar1);
      }
    },
  },
});

export { tableDs };
