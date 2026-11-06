import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { TagRender } from 'utils/renderer';

export default function CentralizeStatusRenderer({ record, value }) {
  const { centralizedRemark, centralizedStatusMeaning, oldCentralizedStatus } = record.get([
    'centralizedStatusMeaning',
    'centralizedRemark',
    'oldCentralizedStatus',
  ]);
  const typeMap = {
    SUBMIT: 'warning',
    SUBMITTED: 'success',
    RETURNED: 'danger',
    CANCELLED: 'failure',
    INVALID: 'failure',
  };

  const icon =
    value === 'RETURNED' && centralizedRemark ? (
      <Tooltip title={centralizedRemark}>
        <Icon
          style={{
            fontSize: '14px',
            marginLeft: '5px',
            fontWeight: 400,
            verticalAlign: 'text-bottom',
          }}
          type="info"
          size={14}
        />
      </Tooltip>
    ) : null;

  const type = oldCentralizedStatus !== 'APPROVEING' ? typeMap[value] || 'warning' : 'warning';
  return <TagRender type={type} text={centralizedStatusMeaning} icon={icon} />;
}
