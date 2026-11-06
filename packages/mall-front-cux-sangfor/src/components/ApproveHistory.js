import React from 'react';
import { PermissionButton } from 'mall-front/lib/components/Permission';
import { orderApprovHistory } from 'mall-front/lib/components/Permission/permissionCode';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'mall-front/lib/utils/intl';

function ApproveHistory() {
  const envName = process.env.MALLENV_NAME;

  async function openUrl() {
    const urlMap = [
      {
        env: 'TEST',
        url:
          'https://apaas-uat.atrust.sangfor.com/ierp/?appNumber=capt_srm_purchase&formId=pc_main_console',
      },
      {
        url:
          'https://apaas.atrust.sangfor.com/ierp/?appNumber=capt_srm_purchase&formId=pc_main_console',
      },
    ];

    window.open(urlMap.find((m) => (m.env && envName.includes(m.env)) || !m.env).url, '_blank');
  }

  return (
    <PermissionButton
      funcType={FuncType.flat}
      className="primary-link"
      style={{ marginTop: '8px' }}
      onClick={() => openUrl()}
      permissionList={[orderApprovHistory]}
    >
      {intl.get('mallf.myOrder.view.button.approveHistory').d('审批记录')}
    </PermissionButton>
  );
}

export default ApproveHistory;
