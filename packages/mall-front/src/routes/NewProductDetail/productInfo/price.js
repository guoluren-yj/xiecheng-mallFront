import React from 'react';
import { connect } from 'dva';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { priceNumberRender, uomRender, getCurrentLanguage } from 'utils/utils';

import { SpanTitle } from 'utils/renderer';
import { SiglPrice } from 'components/LabelPreview';

function Price(props) {
  const {
    currentPrice,
    marketPrice,
    pointPrice,
    noTaxDisplayType,
    defaultPrecision,
    uomName,
    currencySymbol,
  } = props;
  return (
    <div className="product-price">
      <div className="product-attr" style={{ display: 'inline-block' }}>
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
            }`}
          title={
            noTaxDisplayType !== 'SHOW'
              ? intl.get(`mallf.productDetail.model.corporateExclusive`).d('企业专享')
              : intl.get(`mallf.productDetail.model.productTaxPrice`).d('含税单价')
          }
        >
          {noTaxDisplayType !== 'SHOW'
            ? intl.get(`mallf.productDetail.model.corporateExclusive`).d('企业专享')
            : intl.get(`mallf.productDetail.model.productTaxPrice`).d('含税单价')}
          { }
        </div>
      </div>
      <div style={{ marginLeft: 40, verticalAlign: 'top', display: 'inline-block' }}>
        <div className="p-content">
          <span className="p-price">
            <span className="currencySymbol">{currencySymbol || ''}</span>
            <SpanTitle
              className="text-overflow"
              style={{
                maxWidth: isNil(marketPrice) ? 315 : 255,
                display: 'inline-block',
                lineHeight: '20px',
                overflow: 'visible',
              }}
            >
              {priceNumberRender(currentPrice, defaultPrecision)}
            </SpanTitle>
            {/* {uomName && (
              <span style={{ fontSize: '12px', verticalAlign: 'middle' }}>/{uomName}</span>
            )} */}
            <span style={{ fontSize: '12px', verticalAlign: 'middle' }}> {uomRender(uomName)}</span>
          </span>
          {pointPrice || pointPrice === 0 ? (
            <SiglPrice style={{ marginLeft: 8 }} pointPrice={pointPrice} />
          ) : (
            <>
              {!isNil(marketPrice) && (
                <span className="p-jd-price text-overflow" style={{ maxWidth: 60 }}>
                  <span className="currencySymbol">{currencySymbol || ''}</span>
                  <SpanTitle>{priceNumberRender(marketPrice, defaultPrecision)}</SpanTitle>
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({ pointName: global.pointName }))(Price);
