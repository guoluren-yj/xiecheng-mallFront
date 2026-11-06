import React from 'react';

export default function EmptyComponent({ product }) {
  return (
    <>
      <span className="text-overflow" title={product.postageRule} style={{ width: 60 }}>
        {product.postageRule}
      </span>
      <span className="text-overflow" title={product.itemTwoCategoryName} style={{ width: 50 }}>
        {product.itemTwoCategoryName}
      </span>
    </>
  );
}
