import React from 'react';

import { SpanTitle } from 'utils/renderer';
import image from '@/assets/images/shougongshenqing-product.png';

export default function Product(props) {
  const { poLineList } = props;
  return (
    <>
      {poLineList?.map((product) => {
        return (
          <div className="content-item content-item-product">
            <div className="product-img">
              <img alt="" src={image} />
            </div>
            <div className="product-productname">{product.skuName}</div>
            <div className="product-price">
              <SpanTitle>
                {product?.currencySymbol || ''}
                {product?.orderPriceFinalVO?.unitPriceMeaning ||
                  product?.orderPriceFinalVO?.unitPrice}
              </SpanTitle>
            </div>
            <div className="product-num">x{product.quantityMeaning}</div>
          </div>
        );
      })}
    </>
  );
}
