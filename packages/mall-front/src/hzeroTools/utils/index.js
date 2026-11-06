import React from 'react';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';

const statusMap = ['error', 'success'];
/**
 * 返回 是/否 多语言 并加上对应的状态
 * @param {1|any} v 值
 * @return 1 -> yes(多语言), other -> no(多语言)
 */
export function yesOrNoRender(v) {
  return (
    <Badge
      status={statusMap[v]}
      text={
        v === 1
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否')
      }
    />
  );
}
