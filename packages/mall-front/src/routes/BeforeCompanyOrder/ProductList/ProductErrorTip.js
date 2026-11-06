import React from 'react';
import { Icon } from 'hzero-ui';

import cuxComonent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function productErrorTip(product = {}) {
  const { error = false } = product;
  return (
    <>
      {error && (
        <div className="product-line-warn" style={{ marginTop: '8px' }}>
          <span>
            <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            {intl.get('mallf.applyRes.fill.info.warning').d('补充信息不通过，点击补充信息查看详情')}
          </span>
        </div>
      )}
    </>
  );
}

export default cuxComonent({ path: 'BeforeCompanyOrder/ProductList/ProductErrorTip' })(
  productErrorTip
);
