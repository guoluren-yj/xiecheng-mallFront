import React from 'react';
import { connect } from 'dva';

import { CollectAndCompareCom } from 'mall-front/lib/routes/NewProductDetail/productImg/CollectAndCompare';

function CuxCollectAndCompare(props) {
  const { SRMREIGNWOOD = {} } = props;
  return <>{!SRMREIGNWOOD.isOnlyRead && <CollectAndCompareCom {...props} />}</>;
}

export default connect(({ global }) => {
  return {
    SRMREIGNWOOD: global['SRM-REIGNWOOD'],
  };
})(CuxCollectAndCompare);
