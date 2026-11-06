import React from 'react';
import intl from 'utils/intl';

export default function MovingBillNum({ associatedData }) {
  return (
    <>
      {associatedData.movingBillNum && (
        <p className="line-item">
          <span className="line-item-label">
            {intl.get('mcux.common.aeonlife.model.dongzhiNo').d('动支单号')}:
          </span>
          <span className="line-item-info">{associatedData.movingBillNum}</span>
        </p>
      )}
    </>
  );
}
