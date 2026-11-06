import React, { memo } from 'react';

import intl from 'utils/intl';

const LinkLov = memo(function LinkLov(props) {
  const { displayValue, disabled, toggleModal } = props;

  return (
    <React.Fragment>
      {displayValue ? (
        <span className="lov-value">{displayValue}</span>
      ) : require ? (
        <span className="lov-value-wrong">
          {intl.get(`mallf.common.validate.msg.required`).d('必填，请完善信息内容')}
        </span>
      ) : (
        <span className="lov-value-choose">
          {intl.get(`mallf.common.validate.msg.optional`).d('选填')}
        </span>
      )}
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
    </React.Fragment>
  );
});
export default LinkLov;
