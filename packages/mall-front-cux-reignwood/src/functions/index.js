import { useEffect } from 'react';

export function CustomizeHeaderInfoInit({ preOrder, order }) {
  useEffect(() => {
    if (order.DS) {
      const header = preOrder?.orderLineList?.[0]?.orderLineValue?.headerCustomizedList || [];
      order.DS.current.set(
        'attributeVarchar2',
        header.find((p) => p.dimensionCode === 'orderStatus')?.value
      );
    }
  }, [preOrder, order.DS]);
}
