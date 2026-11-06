import React from 'react';

export default function NeededDateHeader({ product }) {
  return (
    <span className="card-info" title={product.attributeBigint1Meaning}>
      {product.attributeBigint1Meaning}
    </span>
  );
}
