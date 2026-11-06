import React from 'react';

export default function NeededDateHeader({ product }) {
  return (
    <span className="card-info" title={product.invOrganizationName || '-'}>
      {product.invOrganizationName || '-'}
    </span>
  );
}
