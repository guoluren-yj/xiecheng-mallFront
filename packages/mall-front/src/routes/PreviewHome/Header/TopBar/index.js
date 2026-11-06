import React from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import { getUserConfigInfo } from 'utils/utils';
import style from './index.less';
import MultilLanguage from './MultilLanguage';
import AddressArea from './AddressArea';

function TopBar(props) {
  const { finish } = props;

  const { needLanguage } = getUserConfigInfo();

  return (
    <div
      id="topDom"
      className={classNames({
        [style['topbar-wrapper']]: true,
      })}
    >
      <div className="topbar container">
        <div className="top-menu">
          {/* 切换多语言 */}
          {needLanguage && finish && <MultilLanguage />}
        </div>
        {finish && <AddressArea />}
      </div>
    </div>
  );
}

export default withRouter(
  connect(({ global }) => ({
    unitList: global.unitList,
    purchaseUnit: global.purchaseUnit,
  }))(TopBar)
);
