import React, { useMemo } from 'react';
import { Anchor, Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

const { Link } = Anchor;
export default function AllocationAnchor({ alloctionDs }) {
  const anchorRender = useMemo(() => {
    const allocationData = alloctionDs.records || [];
    return (
      !isEmpty(allocationData) && (
        <div className="allocation-anchor">
          <Anchor
            targetOffset={window.innerHeight / 2 - 100}
            getContainer={() => document.querySelector('.c7n-pro-modal-body')}
          >
            {allocationData.map((_, index) => {
              return (
                <Link
                  className="anchor-item"
                  title={`${index + 1 < 10 ? `0${index + 1}` : index + 1}`}
                  href={`#${index}`}
                />
              );
            })}
          </Anchor>
        </div>
      )
    );
  }, [alloctionDs.length]);
  return (
    <div className="header-product-name">
      <Alert
        style={{
          width: 1090,
          border: 'none',
        }}
        showIcon
        iconType="error"
        type="warning"
        message={intl
          .get('mallf.common.view.allocationBatchWarn')
          .d('当前批量操作将会覆盖以下商品原有的分配信息，请谨慎操作。')}
      />
      {anchorRender}
    </div>
  );
}
