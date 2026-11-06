import React from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';

function Allocation({ isNewCart, templateName, setAllocatVisible, setShowBuyNow, disabled }) {
  return (
    <>
      {!!isNewCart && templateName && (
        <div className="product-attr">
          <div
            className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
              getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
            }`}
            title={templateName}
          >
            {templateName}
          </div>
          <div className="p-content">
            <a
              onClick={() => {
                setAllocatVisible(true);
                setShowBuyNow(false);
              }}
              className="primary-color"
              disabled={disabled}
            >
              {intl.get('mallf.productDetail.model.update').d('修改')}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default cuxComponent({ path: 'ProductDetail/productInfo/Allocation' })(Allocation);
