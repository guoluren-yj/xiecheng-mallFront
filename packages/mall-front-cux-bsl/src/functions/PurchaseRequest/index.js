import React from 'react';
import { Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export const changeBaseInfoField = () => {
  return (
    <Output
      label={intl.get('mallf.purchaseDetail.view.apply.titlePre').d('标题预览')}
      name="titlePre"
      renderer={({ record }) => {
        const { attributeLongtext12 = '', ouName = '', prNum = '' } =
          record?.get(['attributeLongtext12', 'ouName', 'prNum']) || {};
        return (
          <>
            {attributeLongtext12}
            {attributeLongtext12 ? '-' : ''}
            {ouName}
            {prNum || 'REQ20XXXXXX00005'}
          </>
        );
      }}
    />
  );
};
