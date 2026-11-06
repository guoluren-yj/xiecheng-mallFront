import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const listDS = () => ({
  paging: true,
  pageSize: 20,
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'receiptStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'receiptCode',
    },
    {
      name: 'receiptedTime',
    },
    {
      name: 'receiptTypeDesc',
    },
    {
      name: 'quantityMeaning',
    },
    {
      name: 'packageQuantityMeaning',
    },
    {
      name: 'realName',
    },
    {
      name: 'srmConsignmentCode',
    },
    {
      name: 'remark',
    },
    {
      name: 'attachmentUuid',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/page-receipt-record`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

export { listDS };
