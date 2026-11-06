import React from 'react';
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default function PreviewBtn(props) {
  const {
    hasLineCustFlag,
    setReadVisible,
    headerCustomizedList = [],
    lineCustomizedList = [],
  } = props;
  return (
    <>
      {(hasLineCustFlag ||
        !isEmpty(headerCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1)) ||
        !isEmpty(lineCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1))) && (
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
