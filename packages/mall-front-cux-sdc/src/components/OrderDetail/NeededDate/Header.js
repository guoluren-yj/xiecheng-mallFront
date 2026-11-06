import React from 'react';

import intl from 'utils/intl';

export default function NeededDateHeader() {
  return <span className="card-info">{intl.get(`mallf.common.view.card.info`).d('名片信息')}</span>;
}
