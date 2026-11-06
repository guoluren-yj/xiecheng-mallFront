import React from 'react';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';

function Allocation({
  isNewCart,
  templateName,
  setAllocatVisible,
  setShowBuyNow,
  SRMREIGNWOOD = {},
}) {
  return (
    <>
      {!SRMREIGNWOOD.isOnlyRead && !!isNewCart && templateName && (
        <div className="product-attr">
          <div
            className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
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
            >
              {intl.get('mallf.productDetail.model.update').d('修改')}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default connect(({ global }) => {
  return {
    SRMREIGNWOOD: global['SRM-REIGNWOOD'],
  };
})(Allocation);
