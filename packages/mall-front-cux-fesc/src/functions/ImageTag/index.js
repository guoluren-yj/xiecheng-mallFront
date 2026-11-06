import React from 'react';

export function renderImageTag({ imgInfo }) {
  const flag =
    imgInfo && imgInfo.labelList && imgInfo.labelList.length > 0
      ? imgInfo.labelList[0].labelCode === 'CONTRACT'
      : false;
  return flag ? (
    <div
      style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        color: 'red',
        width: '36px',
        height: '24px',
        background: 'white',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '16px',
      }}
    >
      协议
    </div>
  ) : (
    ''
  );
}
