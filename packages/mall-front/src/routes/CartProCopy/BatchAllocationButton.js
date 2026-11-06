import React, { useMemo } from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import BatchProductAllocation from './BatchAllocation';

function BatchAllocationButton({
  getCheckedProduct,
  fetchProduct,
  handleNext,
  history,
  batchAllocationCount,
}) {
  const BatchProductAllocationRender = useMemo(() => {
    const products = getCheckedProduct.filter((n) => !!n.invalidFlag);
    return (
      <BatchProductAllocation
        products={products}
        fetchProduct={fetchProduct}
        handleNext={handleNext}
        history={history}
        batchAllocationCount={batchAllocationCount}
      />
    );
  }, [getCheckedProduct]);
  return BatchProductAllocationRender;
}

export const BatchProductAllocationCom = BatchAllocationButton;
export default cuxComponent({ path: 'NewCart/BatchProductAllocation' })(BatchAllocationButton);
