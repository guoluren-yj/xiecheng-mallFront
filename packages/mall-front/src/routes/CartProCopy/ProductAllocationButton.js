import React, { useMemo } from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import ProductAllocation from './ProductAllocation';

function ProductAllocationButton(props) {
  return useMemo(() => <ProductAllocation {...props} />, []);
}

export const ProductAllocationButtonCom = ProductAllocationButton;
export default cuxComponent({ path: 'NewCart/ProductAllocation' })(ProductAllocationButton);
