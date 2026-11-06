import React from 'react';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import CustomInfo from 'components/CustomInfo';

export default function App(props) {
  const { product } = props;
  return (
    !!product?.customFlag && (
      <div className="product-attr">
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
          title={intl.get('mallf.common.view.customInfo').d('规格定制')}
        >
          {intl.get('mallf.common.view.customInfo').d('规格定制')}
        </div>
        <div className="p-content">
          <CustomInfo {...props} />
        </div>
      </div>
    )
  );
}
