import React from 'react';

import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import cuxComponent from 'cuxTools/cuxComponent';
import CustomInfo from 'components/CustomInfo';

function Custom(props) {
  const { product } = props;
  return (
    !!product?.customFlag && (
      <div className="product-attr">
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
            getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
          }`}
          title={intl.get('mallf.productDetail.view.customInfo').d('规格定制')}
        >
          {intl.get('mallf.productDetail.view.customInfo').d('规格定制')}
        </div>
        <div className="p-content" style={{ maxWidth: 375 }}>
          <CustomInfo {...props} />
        </div>
      </div>
    )
  );
}
export default cuxComponent({ path: 'ProductDetail/productInfo/CustomInfo' })(Custom);
