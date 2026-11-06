import React from 'react';
import { Skeleton } from 'choerodon-ui/pro';

export default function AllocationItemSkeleton({ index, height = 350 }) {
  return (
    <div id={index} className="aollocation-item" style={{ height }}>
      <div className="item-title">
        <div className="item-title-left">{index + 1 < 10 ? `0${index + 1}` : index + 1}</div>
      </div>
      <div style={{ padding: 20 }}>
        <Skeleton />
      </div>
    </div>
  );
}
