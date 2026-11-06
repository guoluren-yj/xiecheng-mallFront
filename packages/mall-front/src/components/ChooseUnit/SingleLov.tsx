import React, { useMemo, FC, useEffect } from 'react';
import classNames from 'classnames';
import { Lov, DataSet, Tooltip } from 'choerodon-ui/pro';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { Tooltip as Tooltiptype } from 'choerodon-ui/pro/lib/core/enum';
import { connect } from 'dva';

import { getUserConfigInfo } from 'utils/utils';
import { ds } from './ds';
import styles from './index.less';
import { fromType, IDimensionData } from './typings';
import {handleSubmit, setInitData} from './utils';

interface Iprops {
	from?: fromType; // 顶部还是banner
	unitDimensionData: IDimensionData;
	isNew?: boolean; // 新建标识
}

const SingleLov: FC<Iprops> = (props) => {
	const { from, unitDimensionData, isNew } = props;
	const { currentList = [] } = unitDimensionData || {};
	const lovDataSet = useMemo(() => {
		return new DataSet(ds({ fields: currentList }));
	}, [currentList]);

	const { purchaseUnit } = useMemo(() => getUserConfigInfo(), []);

	useEffect(() => {
		setInitData({ dataSet: lovDataSet, isNew });
	}, [lovDataSet, currentList]);

	return (
  <span
    className={classNames(['home-purchase-unit-lov', {
				[styles['unit-siggle-lov']]: from === fromType.top,
			}, { 'user-panel-info': from === fromType.top }])}
		>
    <Tooltip title={purchaseUnit.aliasName}>
      <Lov
        dataSet={lovDataSet}
        name={currentList[0].name}
        viewMode={TriggerViewMode.popup}
        clearButton={false}
        onChange={() => handleSubmit({ dataSet: lovDataSet })}
        tooltip={Tooltiptype.none}
        searchFieldProps={{ multiple: false }}
      />
    </Tooltip>
  </span>
	);
};

export default connect(({ global }) => ({
	unitDimensionData: global.unitDimensionData,
}))(SingleLov);