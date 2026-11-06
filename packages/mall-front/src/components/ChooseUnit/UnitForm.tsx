import React, { FC, useState, useRef } from 'react';
import { Button, DataSet } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {connect} from 'dva';

import intl from 'utils/intl';
import MinimumUnit from './MinimumUnit';
import styles from './index.less';
import {handleSubmit} from './utils';
import { IDimensionData } from './typings';

interface Iporps {
  toggleView: () => void;
  unitDimensionData: IDimensionData;
}
const UnitForm: FC<Iporps> = props => {
  const { toggleView, unitDimensionData } = props;
  const miniUnitRef = useRef<DataSet>(new DataSet());
  const [saveLoading, setLoading] = useState<boolean>(false);

  return (
    <div className={styles['unit-info']}>
      <div className="unit-header">{intl.get('mallf.header.unit.choose').d('采买身份选择')}</div>
      <div className="minimum-unit">
        <MinimumUnit
          onRef={ds => {
            miniUnitRef.current = ds;
          }}
          unitDimensionData={unitDimensionData}
        />
      </div>
      <div className="unit-footer">
        <Button
          color={ButtonColor.primary}
          onClick={async () => {
            const flag = await miniUnitRef.current?.validate();
            if(!flag) return;
            setLoading(true);
            await handleSubmit({ dataSet: miniUnitRef.current });
            toggleView();
            setLoading(false);
          }}
          loading={saveLoading}
        >
          {intl.get('hzero.common.button.confrim').d('确定')}
        </Button>
        <Button
          onClick={() => {
            toggleView();
          }}
        >
          {intl.get('hzero.common.btn.cancel').d('取消')}
        </Button>
      </div>
    </div>
  );
};

export default connect(({ global }) => ({
  unitDimensionData: global.unitDimensionData,
}))(UnitForm);
