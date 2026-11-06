import React, { useMemo } from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';

function C7nProLov(props) {
  const { fieldProps = {}, lovProps = {}, children } = props;
  const ds = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'commonLov',
          type: 'object',
          ...fieldProps,
        },
      ],
    });
  }, []);

  return (
    <Lov dataSet={ds} noCache name="commonLov" {...lovProps}>
      {children}
    </Lov>
  );
}

export default C7nProLov;
