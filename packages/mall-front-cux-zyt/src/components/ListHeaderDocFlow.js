import React from 'react';

import DocFlow from 'components/DocFlow';
import { requestDocFlow } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import { TagRender } from 'utils/renderer';
import intl from 'utils/intl';

export default function ListHeaderAppendBtn(props) {
  const { item } = props || {};
  const { mallRequestEntryViewVOList = [] } = item || {};
  return mallRequestEntryViewVOList.map(product => {
    const { requestEntryId, skuType } = product || {};
    // 是否赠品
    const isGift = ['ATTACHMENT', 'GIFT'].includes(skuType);
    return (
      !isGift && (
        <PermissionWrapper permissionList={[requestDocFlow]}>
          <div className="header-request-status">
            {TagRender({
              text: intl.get('mallf.myRequest.view.button.zyt.docFlow.progress').d('单据进度'),
              type: 'warning',
              style: { maxWidth: '160px', marginRight: 0 },
            })}
          </div>
          <DocFlow
            tableName="s2ful_mall_request_entry"
            tablePk={requestEntryId}
            style={{
              color: 'red',
            }}
            buttonType="aTag"
            buttonText={intl.get('mallf.myRequest.view.zyt.link.view').d('查看')}
          />
        </PermissionWrapper>
      )
    );
  });
}
