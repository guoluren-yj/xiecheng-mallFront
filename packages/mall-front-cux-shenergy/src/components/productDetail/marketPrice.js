import React from 'react';
import { priceNumberRender } from 'utils/utils';
import { isNil } from 'lodash';

export default function MarketPrice(props) {
  const { data } = props;
  const { marketPrice, currencySymbol, defaultPrecision } = data || {};
  return (
    !isNil(marketPrice) && (
      <span className="p-jd-price">
        <span className="currencySymbol">{currencySymbol || ''}</span>
        {priceNumberRender(marketPrice, defaultPrecision)}
      </span>
    )
  );
}
