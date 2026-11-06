import React from 'react';
import { Button } from 'choerodon-ui/pro';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function PreviewBtn(props) {
  const { hasLineCustFlag, setReadVisible } = props;
  return (
    <>
      {hasLineCustFlag && (
        <span
          className="primary-color"
          onClick={() => {
            setReadVisible(true);
          }}
          style={{ float: 'right' }}
        >
          <Button
            className="primary-color"
            style={{ fontSize: 12 }}
            icon="preview"
            funcType="flat"
            color="primary"
          >
            {intl.get('mallf.common.model.preview').d('预览')}
          </Button>
        </span>
      )}
    </>
  );
}

export default cuxComponent({ path: 'BeforeCompanyOrder/PreviewBtn' })(PreviewBtn);
