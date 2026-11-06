import React from 'react';
import intl from 'utils/intl';
import { numberRender } from 'utils/utils';
import Icons from 'components/Icons';

export default function Price(props) {
  const {
    sourceFrom,
    hasPrice,
    currentPrice,
    prePrice,
    sameProduct = [],
    showSameProduct = e => e,
    showLadderPrices,
    marketingUnit = [],
  } = props;
  const symbol = '';
  return (
    <div className="product-price" style={{ paddingBottom: '12px' }}>
      <div className="product-attr" style={{ display: 'inline-block' }}>
        <div className="p-label">
          {sourceFrom === 'CATA'
            ? intl.get(`mallf.productDetail.model.corporateExclusive`).d('企业专享')
            : intl.get(`mallf.productDetail.model.currentPrice`).d('当前价格')}
          {}
        </div>
      </div>
      <div style={{ marginLeft: 24, verticalAlign: 'top', display: 'inline-block' }}>
        <div className="p-content">
          <span className="p-price">
            {symbol}
            {hasPrice ? numberRender(currentPrice) : '-'}
            {marketingUnit && marketingUnit.length > 0 && (
              <span style={{ fontSize: '12px' }}>/{marketingUnit?.[0]?.description}</span>
            )}
          </span>
          {hasPrice && (
            <span className="p-jd-price">
              {symbol}
              {numberRender(prePrice || currentPrice, 2)}
            </span>
          )}
        </div>
        <div className="p-price-items">
          {sameProduct.length > 0 && (
            <div className="item" id="item-1">
              <Icons type="Similarproducts" style={{ color: '#5CAE2A', fontSize: '14px' }} />
              <span className="item-desc">
                {intl.get(`mallf.productDetail.view.sameProduct`).d('同款商品')}
              </span>
              <div className="item-product">
                {sameProduct.length > 0 && (
                  <div className="same-product">
                    <div className="same-images-wrapper p-content">
                      {sameProduct.length > 5 && (
                        <div className="same-images-prev">
                          <Icons className="prev-icon" type="left" />
                        </div>
                      )}
                      <div id="same-images" className="swiper-container swiper">
                        <div className="product-same-imgs swiper-wrapper">{showSameProduct()}</div>
                      </div>
                      {sameProduct.length > 5 && (
                        <div className="same-images-next">
                          <Icons className="next-icon" type="right" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {showLadderPrices && <div className="item-dim" />}
        </div>
      </div>
    </div>
  );
}
