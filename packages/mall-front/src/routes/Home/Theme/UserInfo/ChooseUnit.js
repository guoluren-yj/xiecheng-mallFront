import React from 'react';
import { connect } from 'dva';
import { Tooltip, Icon } from 'choerodon-ui/pro';

import ChooseUnitCom from 'components/ChooseUnit';
import cuxComponent from 'cuxTools/cuxComponent';

function ChooseUnit(porps) {
  const { purchaseUnit } = porps;
  return (
    <ChooseUnitCom from="banner">
      <div>
        <Tooltip title={purchaseUnit?.aliasName}>
          <div
            className="text-overflow"
            style={{
              width: 160,
              height: 32,
              lineHeight: '30px',
              border: '1px solid #D7D7D7',
              borderRadius: 2,
              cursor: 'pointer',
              padding: '0 15px 0 10px',
              position: 'relative',
            }}
          >
            {purchaseUnit?.aliasName}
            <Icon
              type="baseline-arrow_drop_down"
              style={{ position: 'absolute', top: 8, right: 5, color: '#666666' }}
            />
          </div>
        </Tooltip>
      </div>
    </ChooseUnitCom>
  );
}

export default connect(({ global }) => ({
  unitList: global.unitList,
  purchaseUnit: global.purchaseUnit,
}))(cuxComponent({ path: 'layout/Header/TopBar/ChooseUnit' })(ChooseUnit));
