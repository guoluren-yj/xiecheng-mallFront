import React from 'react';

export default function OtherBaseInfo({ trackData }) {
  return (
    <div className="base-info-item">
      <span>预计到货日期：</span>
      <span>{trackData?.attributeDate1}</span>
    </div>
  );
}
