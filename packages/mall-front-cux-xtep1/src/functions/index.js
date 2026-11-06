import React from 'react';
import { Tooltip, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getSprmDetailUrl, openPage } from 'mall-front/lib/utils/utils';

function renderManualButton(props = {}) {
  const { isShowMiniCart } = props;

  const handleLink = () => {
    const jumpUrl = getSprmDetailUrl({ prSourcePlatform: 'SRM' });
    openPage(jumpUrl, true);
  };
  return (
    <Tooltip
      title={intl
        .get('mallf.common.view.xtep1.createPurchaseRequest.tooltip')
        .d('手工建需求')}
    >
      <Button style={{ marginLeft: '10px', height: '40px', borderRadius: 'unset' }} onClick={handleLink} icon="work_log" />
    </Tooltip>
  );
}

export { renderManualButton };
