import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';

import request from '@/utils/request';

export default function useUomName({ productIds, productId }) {
  const [uomList, setUomList] = useState([]);
  if (productId) {
    // eslint-disable-next-line no-param-reassign
    productIds = [productId];
  }
  useEffect(() => {
    if (!isEmpty(productIds) || productId) {
      request('', { method: 'POST', body: JSON.stringify(productIds) }).then((res) => {
        setUomList(res);
      });
    }
  }, [productIds, productId]);

  return productId ? uomList?.find((p) => p.productId === productId)?.unitNameAndCode : uomList;
}
