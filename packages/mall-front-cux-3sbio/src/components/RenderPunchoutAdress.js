import React from 'react';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui/pro';
import { getPrimaryColor } from 'utils/utils';

export default function RenderPunchoutAdress(props) {
  const { record, dataSet, getGroupRecords } = props || {};
  return (
    <>
      {['1', 1].includes(record.get('addressEditFlag')) && (
        <>
          <p className="po-header-address-content">
            <span className="po-header-label">
              {intl.get(`mallf.common.view.address`).d('地址')}：
            </span>
            {/* <Tooltip placement="top" title={`${record.get('contactName')}${record.get('fullAddress')}`}> */}
            <span className="po-header-name">{record.get('contactName')}</span>
            <span className="po-header-address" title={record.get('fullAddress')}>
              {record.get('fullAddress')}
            </span>
            {/* </Tooltip> */}
          </p>
          <a
            style={{ marginLeft: 4 }}
            className="po-header-address-update"
            onClick={() => {
              const groupRecords = getGroupRecords({ record, dataSet });
              dataSet.setUpdatePoRecords(groupRecords);
              dataSet.openAddressModal();
            }}
          >
            <Icon type="mode_edit" style={{ color: getPrimaryColor(), fontSize: 12 }} />
          </a>
        </>
      )}
    </>
  );
}
