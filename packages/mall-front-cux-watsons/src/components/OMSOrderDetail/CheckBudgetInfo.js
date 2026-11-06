import React, { useState } from 'react';

import intl from 'utils/intl';
import CostAllocationModal from '../BeforeCompanyOrder/ProductListOperate/CostAllocationModal';

export default function CheckBudgetInfo(props) {
  const { budgetData: product } = props;
  const [costVisible, setCostVisible] = useState(false);

  return (
    <>
      <div className="right-btn" onClick={() => setCostVisible(!costVisible)}>
        {intl.get('mallf.common.view.amount.remark').d('费用说明')}
      </div>
      {costVisible && (
        <CostAllocationModal
          visible={costVisible}
          toggleModal={() => setCostVisible(!costVisible)}
          product={product}
        />
      )}
    </>
  );
}
