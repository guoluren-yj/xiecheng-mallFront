import React, { useEffect, useMemo } from 'react';
import { Modal, DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import tableDS from './tableDS';

export const showContractInfoModal = (props) => {
  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get('scux.contractInfoModal.title.contractInfo').d('合同信息'),
    style: {
      width: 1090,
    },
    children: <ModalChildren {...props} />,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn, cancelBtn) => cancelBtn,
    cancelProps: {
      color: 'primary',
    },
  });
};

const ModalChildren = (props) => {
  const { modal, multiPcNumOrTitle } = props;
  // 没有传入协议单号
  // if (!pcNum && !multiPcNumOrTitle) {
  //   return <></>;
  // }
  const tableDs = useMemo(() => new DataSet(tableDS({ multiPcNumOrTitle })), [multiPcNumOrTitle]);

  useEffect(() => {
    if (modal) {
      modal.update({
        title: intl.get('scux.contractInfoModal.title.contractInfo').d('合同信息'),
        style: { width: '1090px' },
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        footer: (okBtn, cancelBtn) => cancelBtn,
        cancelProps: {
          color: 'primary',
        },
      });
    }
  }, []);

  const columns = [
    {
      name: 'pcNum',
      width: 150,
    },
    {
      name: 'pcName',
      width: 150,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'startDateActive',
      width: 130,
    },
    {
      name: 'endDateActive',
      width: 130,
    },
    {
      name: 'taxIncludeAmount',
      width: 130,
    },
    {
      name: 'executedAmount',
      width: 130,
    },
    {
      name: 'toExecuteAmount',
      width: 100,
    },
  ];
  return <Table dataSet={tableDs} columns={columns} style={{ maxHeight: 'calc(100% - 50px)' }} />;
};

export default ModalChildren;
