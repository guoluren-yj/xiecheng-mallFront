import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const requestTypeDS = (otherProps, fieldProps) => ({
  autoCreate: true,
  fields: [
    {
      name: 'requestType',
      type: 'object',
      lovCode: 'SPUC.PR_DEMAND_TYPE',
      ignore: 'always',
      label: intl.get(`mallf.common.view.prType`).d('采购申请类型'),
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ...(fieldProps || {}),
    },
    {
      name: 'prTypeId',
      bind: 'requestType.prTypeId',
    },
    {
      name: 'prTypeName',
      bind: 'requestType.prTypeName',
    },
  ],
  ...(otherProps || {}),
});

export { requestTypeDS };
