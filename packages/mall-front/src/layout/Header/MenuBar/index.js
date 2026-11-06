import React from 'react';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import * as Hmall from 'utils/utils';
import * as HmallConfig from 'utils/api-config';

import Assort from './assort';
import style from './index.less';
import QuickLink from './QuickLink';

function MenuBar(props) {
  const { location } = window;
  const isAll = Hmall.getCookie('ecPlatform') === 'ALL';
  const isHome =
    location.pathname === `${HmallConfig.basePath}` ||
    location.pathname === `${HmallConfig.basePath}/` ||
    location.pathname === `${HmallConfig.basePath}/sigl` ||
    location.pathname === `${HmallConfig.basePath}/pub`;
  const currentEcPlatform = Hmall.getCookie('ecPlatform');

  return (
    <div
      id="menuDom"
      className={classNames({
        [style['menu-bar-wrapper']]: true,
      })}
    >
      <ul className="menu-bar container">
        <li className="assort">
          <Assort finish={props.finish} isAll={isAll} isHome={isHome} key={currentEcPlatform} />
        </li>
        <QuickLink ecList={props.ecList} />
      </ul>
    </div>
  );
}

export default withRouter(MenuBar);
