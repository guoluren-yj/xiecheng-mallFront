import React, { useMemo, useEffect } from 'react';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

import { AddCartCom } from 'mall-front/lib/routes/NewProductDetail/productInfo/AddCart';

export default function CuxAddCart(props) {
  const isOnlyRead = useMemo(() => {
    return props.labelList?.some((p) => p.labelCode === 'CZQX001');
  }, [props.labelList]);

  useEffect(() => {
    getDvaApp()._store.dispatch({
      type: 'global/update',
      payload: {
        'SRM-REIGNWOOD': {
          isOnlyRead,
        },
      },
    });
  }, [isOnlyRead]);

  return <>{props.labelList && !isOnlyRead && <AddCartCom {...props} />}</>;
}
