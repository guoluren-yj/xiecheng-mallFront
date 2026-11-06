import React, { useRef, FC, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

import MinimumUnit from './MinimumUnit';
import { handleSubmit } from './utils';

interface IProps {
  modal?: any;
}

const InitUnitForm: FC<IProps> = (props) => {
  const { modal } = props;

  const { loginName, realName, unitDimensionData } = useMemo(() => getUserConfigInfo(), []);

  const miniUnitRef = useRef<DataSet>();

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const flag = await miniUnitRef.current?.validate();
    await handleSubmit({ dataSet: miniUnitRef.current });
    return flag;
  }

  return (
    <>
      <p style={{ marginBottom: 5 }}>
        {realName}({loginName})，
        {intl.get('mallf.common.view.buyingIdentity.confirm').d('您好，请确认您的采买身份：')}
      </p>
      <div style={{ marginTop: 20 }}>
        <MinimumUnit
          onRef={(ds) => {
            miniUnitRef.current = ds;
          }}
          isNew
          unitDimensionData={unitDimensionData}
        />
      </div>
    </>
  );
};

export default InitUnitForm;