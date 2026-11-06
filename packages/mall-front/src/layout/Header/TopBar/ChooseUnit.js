import React from 'react';
import { connect } from 'dva';
import { Tooltip } from 'choerodon-ui/pro';

import ChooseUnitCom from 'components/ChooseUnit';
import cuxComponent from 'cuxTools/cuxComponent';

function ChooseUnit(porps) {
  const { purchaseUnit } = porps;
  return (
    <ChooseUnitCom from="top">
      <li className="user-panel-info">
        <Tooltip title={purchaseUnit?.aliasName}>
          <span className="link-popup text-overflow">{purchaseUnit?.aliasName}</span>
        </Tooltip>
      </li>
    </ChooseUnitCom>
  );
}

export default connect(({ global }) => ({
  unitList: global.unitList,
  purchaseUnit: global.purchaseUnit,
}))(cuxComponent({ path: 'layout/Header/TopBar/ChooseUnit' })(ChooseUnit));
