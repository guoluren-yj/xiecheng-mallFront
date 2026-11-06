import React from 'react';
import qs from 'qs';
import Link from 'components/Link';

export default function MenuBar({ mallType, queryParams }) {
  const { catalogId, catalogName } = queryParams || {};
  return (
    <li key={catalogId}>
      <div className="sub-category-item" title={catalogName}>
        <Link
          to={`${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(queryParams)}`}
        >
          {catalogName}
        </Link>
      </div>
    </li>
  );
}
