import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 表格数据
const tableDS = ({ multiPcNumOrTitle, pcNum }) => {
  return {
    paging: true,
    selection: false,
    primaryKey: 'pcHeaderId',
    pageSize: 20,
    autoQuery: true,
    fields: [
      {
        label: intl.get('scux.contractInfoModal.model.pcNum').d('合同号'),
        name: 'pcNum',
      },
      {
        label: intl.get('scux.contractInfoModal.model.pcName').d('合同名称'),
        name: 'pcName',
      },
      {
        label: intl.get('scux.contractInfoModal.model.companyName').d('合同签订甲方'),
        name: 'companyName',
      },
      {
        label: intl.get('scux.contractInfoModal.model.supplierCompanyName').d('合同签订乙方'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('scux.contractInfoModal.model.startDateActive').d('协议有效期从'),
        name: 'startDateActive',
        type: 'date',
      },
      {
        label: intl.get('scux.contractInfoModal.model.endDateActive').d('协议有效期至'),
        name: 'endDateActive',
        type: 'date',
      },
      {
        label: intl.get('scux.contractInfoModal.model.taxIncludeAmount').d('合同总金额'),
        name: 'taxIncludeAmount',
        type: 'currency',
      },
      {
        label: intl.get('scux.contractInfoModal.model.executedAmount').d('已占用金额'),
        name: 'executedAmount',
        type: 'currency',
      },
      {
        label: intl.get('scux.contractInfoModal.model.toExecuteAmount').d('剩余金额'),
        name: 'toExecuteAmount',
        type: 'currency',
      },
    ],
    queryParameter: {
      pcNum,
      multiPcNumOrTitle,
      amountChinese: true,
      customizeUnitCode:
        'SPCM.PURCHASE_CONTRACT_VIEW.LINE_LIST,SPCM.PURCHASE_CONTRACT_VIEW.LIST.FILTER',
    },
    transport: {
      read: () => {
        return {
          url: `/spcm/v1/${organizationId}/purchase-contract/purchase-view/page`,
          method: 'GET',
        };
      },
    },
  };
};

export default tableDS;
