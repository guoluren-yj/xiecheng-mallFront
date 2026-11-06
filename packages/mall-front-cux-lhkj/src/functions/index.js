import { useEffect } from 'react';
import { getCookie } from 'utils/utils';

export function CustomizeHeaderInfoInit({ order }) {
  useEffect(() => {
    if (order.DS) {
      const { requestId } = getCookie('singleRecordCookie') || {};
      order.DS.current.set({
        attributeVarchar3: requestId,
      });
    }
  }, [order.DS]);
}
