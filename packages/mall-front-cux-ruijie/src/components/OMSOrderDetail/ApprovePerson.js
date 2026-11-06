import React from 'react';
import { Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import Icons from 'components/Icons';

function ApprovePerson({ item }) {
  return (
    <>
      {item.assigneeName && (
        <Tooltip
          placement="bottom"
          title={intl.get('mallf.myOrder.view.current.approver').d('当前审批人')}
        >
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 5,
            }}
          >
            <Icons
              style={{
                fontSize: '14px',
                marginRight: '5px',
                fontWeight: 400,
                verticalAlign: 'text-bottom',
              }}
              type="icon-authorize_reg"
            />
            {item.assigneeName || ''}
          </p>
        </Tooltip>
      )}
    </>
  );
}

export default ApprovePerson;
