import React, { useState } from 'react';
import { Icon, Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import OverflowTip from 'components/OverflowTip';
import CompareOrderDetail from './CompareOrderDetail';
import './index.less';

export default function ViewCompareList(props) {
  const { productCompare = {} } = props || {};
  const [compareVisible, setCompareVisible] = useState(false);
  return (
    <Popover
      content={
        <CompareOrderDetail productCompare={productCompare} setCompareVisible={setCompareVisible} />
      }
      placement="bottom"
      overlayClassName="compare-view-popver"
      overlayStyle={{ width: 400 }}
      trigger="click"
      visible={!!compareVisible}
      onVisibleChange={(vis) => setCompareVisible(vis)}
    >
      <div className="compare-button">
        <OverflowTip>{intl.get(`mallf.common.model.compareOrder`).d(`比价单`)}</OverflowTip>
        <Icon type="assignment" />
      </div>
    </Popover>
  );
}
