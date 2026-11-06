import Loading from 'components/loading';
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUseOms } from 'services/cartService';
import OMS from './OMSSale';
import Sale from './SaleRecord';

function OMSOrder() {
  const [isOMS, setOmsFlag] = useState(undefined);

  useEffect(() => {
    isUseOms().then((res) => setOmsFlag(res));
  }, []);

  return <>{isOMS === undefined ? <Loading /> : isOMS ? <OMS /> : <Sale />}</>;
}

export default formatterCollections({ code: ['mallf.mySaleAfter', 'mallf.orderDetail'] })(OMSOrder);
