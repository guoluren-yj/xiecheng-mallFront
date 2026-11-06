import React from 'react';

export function organizationNameRender({ organizationName }) {
  return (
    <span
      className="text-overflow"
      title={organizationName}
      style={{ color: 'red', fontWeight: 600 }}
    >
      {organizationName}
    </span>
  );
}
