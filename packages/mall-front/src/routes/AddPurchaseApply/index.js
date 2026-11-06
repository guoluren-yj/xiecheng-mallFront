import useOmsFlag from '@/hooks/useOmsFlag';
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';

import Loading from 'components/loading';
import OMS from './OMS';
import PR from './PR';

function AddPurchaseApply() {
  const isOMS = useOmsFlag();

  return <>{isOMS === undefined ? <Loading /> : isOMS ? <OMS /> : <PR />}</>;
}

export default formatterCollections({ code: ['mallf.purchaseDetail', 'mallf.addPurchase'] })(
  AddPurchaseApply
);
