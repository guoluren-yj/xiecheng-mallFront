import React, { memo } from 'react';

import intl from 'utils/intl';

const LinkInit = memo(function LinkInit(props) {
  const { initStyle, disabled, toggleModal } = props;

  return (
    <React.Fragment>
      {initStyle ? (
        <span
          className="lov-link lov-link-change"
          onClick={() => {
            if (!disabled) {
              toggleModal();
            }
          }}
        >
          {intl.get(`mallf.common.model.update`).d('修改')}
        </span>
      ) : (
        <span
          className="lov-link lov-link-change"
          onClick={() => {
            if (!disabled) {
              toggleModal();
            }
          }}
          style={{ fontSize: '13px' }}
        >
          {intl.get('mallf.common.model.update.address').d('修改地址')}
        </span>
      )}
    </React.Fragment>
  );
});
export default LinkInit;
