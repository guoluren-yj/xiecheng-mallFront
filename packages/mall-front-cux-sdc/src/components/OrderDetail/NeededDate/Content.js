import React from 'react';

import PersonInfo from './PersonInfo';

export default function NeededDateHeader({ product }) {
  return (
    <span className="card-info">
      <PersonInfo
        product={{
          businessCardFlag: product.userName,
        }}
        cardInfo={{
          name: product.userName,
          mobile: product.phone,
          email: product.mail,
          attributeLongtext1: product.fundraiseQrCode,
          attributeLongtext2: product.wechatQrCode,
        }}
      />
    </span>
  );
}
