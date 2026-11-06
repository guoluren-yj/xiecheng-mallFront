import React from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { priceNumberRender, getCurrentLanguage } from 'utils/utils';
// import { isEmpty } from 'lodash';

import { SiglPrice } from 'components/LabelPreview';
// import Icons from 'components/Icons';

function Price(props) {
  const {
    hasPrice,
    currentPrice,
    prePrice,
    pointPrice,
    // sameProduct = [],
    // showSameProduct = (e) => e,
    // showLadderPrices,
    noTaxDisplayType,
    defaultPrecision,
    uomName,
    currencySymbol,
  } = props;
  // const symbol = '';
  return (
    <div className="product-price">
      <div className="product-attr" style={{ display: 'inline-block' }}>
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
          title={
            noTaxDisplayType !== 'SHOW'
              ? intl.get(`mallf.productDetail.model.corporateExclusive`).d('企业专享')
              : intl.get(`mallf.productDetail.model.productTaxPrice`).d('含税单价')
          }
        >
          {noTaxDisplayType !== 'SHOW'
            ? intl.get(`mallf.productDetail.model.corporateExclusive`).d('企业专享')
            : intl.get(`mallf.productDetail.model.productTaxPrice`).d('含税单价')}
          {}
        </div>
      </div>
      <div style={{ marginLeft: 40, verticalAlign: 'top', display: 'inline-block' }}>
        <div className="p-content">
          <span className="p-price">
            <span className="currencySymbol">{currencySymbol || ''}</span>

            {priceNumberRender(currentPrice, defaultPrecision)}
            {uomName && <span style={{ fontSize: '12px' }}>/{uomName}</span>}
          </span>
          {pointPrice || pointPrice === 0 ? (
            <SiglPrice style={{ marginLeft: 8 }} pointPrice={pointPrice} />
          ) : (
            <>
              {hasPrice && (
                <span className="p-jd-price">
                  <span className="currencySymbol">{currencySymbol || ''}</span>
                  {priceNumberRender(prePrice || currentPrice, defaultPrecision)}
                </span>
              )}
            </>
          )}
        </div>
        {/* {(!isEmpty(sameProduct) || showLadderPrices) && (
          <div className="p-price-items">{showLadderPrices && <div className="item-dim" />}</div>
        )} */}
      </div>
    </div>
  );
}

export default connect(({ global }) => ({ pointName: global.pointName }))(Price);
