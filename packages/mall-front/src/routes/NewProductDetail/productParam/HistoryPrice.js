import React, { useEffect, useRef } from 'react';

import intl from 'utils/intl';
import FinalPriceChart from '../productInfo/finalPriceChart';
import useSetState from '@/hooks/useState';

export default function History({ productData }) {
  const {
    taxIncludedPrice,
    productId,
    agreementType,
    defaultPrecision,
    sourceFrom,
    skuCode,
  } = productData;
  const [state, setState] = useSetState({
    activeBtn: 0,
  });
  const productPrice1 = useRef(null);
  const productPrice2 = useRef(null);
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, false);
    return () => {
      document.addEventListener('mousedown', handleMouseDown, false);
    };
  }, []);

  function handleMouseDown(e) {
    if (
      productPrice1.current &&
      !productPrice1.current.contains?.(e.target) &&
      productPrice2.current &&
      !productPrice2.current.contains?.(e.target)
    ) {
      setState({ activeBtn: 0 });
    }
  }

  const hiddPrice = typeof taxIncludedPrice === 'string' && taxIncludedPrice.includes('*');
  return (
    <div className="price-btns">
      <div className={`btn ${state.activeBtn === 1 ? 'active' : ''}`}>
        <span
          title={intl.get('mallf.productDetail.model.historyPrice').d('历史报价')}
          className={`text-overflow ${hiddPrice ? 'disable' : ''}`}
          onClick={hiddPrice ? (e) => e : () => setState({ activeBtn: 1 })}
        >
          {intl.get('mallf.productDetail.model.historyPrice').d('历史报价')}
        </span>
        <div ref={productPrice1} className="item item-history">
          <FinalPriceChart
            type={1}
            hiddPrice={hiddPrice}
            productId={productId}
            agreementType={agreementType}
            defaultPrecision={defaultPrecision}
            skuType={sourceFrom}
            skuId={productId}
            skuCode={skuCode}
          />
        </div>
      </div>
      <div className={`btn ${state.activeBtn === 2 ? 'active' : ''}`}>
        <span
          title={intl.get('mallf.productDetail.model.historyFinalPrice').d('历史成交价')}
          className={`text-overflow ${hiddPrice ? 'disable' : ''}`}
          onClick={hiddPrice ? (e) => e : () => setState({ activeBtn: 2 })}
        >
          {intl.get('mallf.productDetail.model.historyFinalPrice').d('历史成交价')}
        </span>
        <div ref={productPrice2} className="item item-dealHistory">
          <FinalPriceChart
            type={2}
            hiddPrice={hiddPrice}
            productId={productId}
            agreementType={agreementType}
            defaultPrecision={defaultPrecision}
            skuType={sourceFrom}
            skuId={productId}
            skuCode={skuCode}
          />
        </div>
      </div>
    </div>
  );
}
