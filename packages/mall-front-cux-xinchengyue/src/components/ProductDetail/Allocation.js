import React from 'react';

import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';

function Allocation({ isNewCart, templateName, setAllocatVisible, setShowBuyNow, product }) {
  const { hasLowPriceFlag } = product; // 存在最低价不展示分配
  return (
    <>
      {!!isNewCart && templateName && !hasLowPriceFlag && (
        <div className="product-attr">
          <div
            className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
            title={templateName}
          >
            {templateName}
          </div>
          <div className="p-content">
            <a
              disabled={hasLowPriceFlag === undefined}
              onClick={() => {
                setAllocatVisible(true);
                setShowBuyNow(false);
              }}
              className="primary-color"
            >
              {intl.get('mallf.productDetail.model.update').d('修改')}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default Allocation;
