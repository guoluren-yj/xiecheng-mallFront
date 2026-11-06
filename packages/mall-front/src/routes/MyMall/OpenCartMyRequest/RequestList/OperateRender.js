import React, { useMemo } from 'react';

import intl from 'utils/intl';
import cuxComponent from 'cuxTools/cuxComponent';
import { PermissionButton } from 'components/Permission';
import { requestCancelRequest } from 'components/Permission/permissionCode';

function OperateRender({ item, handleCancelLine = (e) => e }) {
  const OperateRenderer = useMemo(() => {
    const { mallRequestEntryViewVOList = [] } = item || {};
    const lineIsCancel = (line) => line.canCancelFlag === 1;
    const canCancelFlag = mallRequestEntryViewVOList.some(lineIsCancel);
    return canCancelFlag ? (
      mallRequestEntryViewVOList.map((n) => (
        <div className="request-item-operate">
          <PermissionButton
            r-if={lineIsCancel(n)}
            permissionList={[requestCancelRequest]}
            funcType="flat"
            color="primary"
            className="right-btn text-overflow"
            onClick={() => handleCancelLine(n)}
          >
            {intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请')}
          </PermissionButton>
        </div>
      ))
    ) : (
      <div />
    );
  }, [item]);
  return OperateRenderer;
}

export default cuxComponent({ path: 'OpenCartMyRequest/RequestList/OperateRender' })(OperateRender);
