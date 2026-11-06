import React from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { Menu, Dropdown } from 'choerodon-ui/pro';

import { PermissionWrapper } from 'components/Permission';
import Link from 'components/Link';
import Icons from 'components/Icons';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo, fillUrlToken, openPage } from 'utils/utils';
import intl from 'utils/intl';
import { logout } from 'services/api';
import MultilLanguage from 'mall-front/lib/layout/Header/TopBar/MultilLanguage';
import AddressArea from './AddressArea';
import getMallRouter from '../../../routes/MyMall/router';
import style from './index.less';

function TopBar(props) {
  const { finish, pointName } = props;
  const { userId, enterprisePermission } = getUserConfigInfo();

  const { realName, needLanguage, hideFieldList } = getUserConfigInfo();
  const mallRouters = getMallRouter(pointName);

  // const poList = ecList.filter((f) => f.interfaceType === 'PO');

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
        <ul className="user-panel">
          <li>
            {window.location.pathname !== '/sigl' && (
              <li className="user-panel-info">
                <span className="top-menu-link">
                  <Link to="/sigl">
                    <Icon type="home" style={{ fontSize: 14, margin: '-3px 6px 0' }} />
                    <span>{intl.get('mallf.common.view.backHome').d('返回首页')}</span>
                  </Link>
                </span>
              </li>
            )}
            {hideFieldList && !hideFieldList.includes('RELOCATE_TO_SRM') && (
              <li className="user-panel-info">
                <span className="top-menu-link">
                  <a
                    onClick={() => {
                      const {
                        webConfig: { isSecondWebSite, srmUrl },
                      } = getUserConfigInfo();
                      openPage(
                        `${
                          isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
                        }/workplace${fillUrlToken()}`,
                        true
                      );
                    }}
                  >
                    <Icons type="logo-going_link" style={{ fontSize: 12, margin: '0 6px' }} />
                    <span style={{ fontWeight: 600 }}>
                      {intl.get('mallf.common.view.SRMWorkspace').d('SRM工作台')}
                    </span>
                  </a>
                </span>
              </li>
            )}
            {enterprisePermission && (
              <li className="user-panel-info">
                <span className="top-menu-link">
                  <a
                    onClick={() => {
                      openPage(`${window.location.origin}`, true);
                    }}
                  >
                    {intl.get('mallf.common.view.company.buy').d('企业购')}
                  </a>
                </span>
              </li>
            )}
            <li className="user-panel-info">
              <Dropdown
                overlay={() => (
                  <Menu>
                    {mallRouters.myMall.children.map((item) => (
                      <PermissionWrapper permissionList={item.permissionList}>
                        <Menu.Item
                          onItemHover={(e) => e}
                          onClick={(e) => e}
                          className="c7n-menu-item"
                        >
                          <Link to={`/sigl/my-mall${item.path}`}>{item.name}</Link>
                        </Menu.Item>
                      </PermissionWrapper>
                    ))}
                  </Menu>
                )}
              >
                <span className="link-popup">{mallRouters.myMall.name}</span>
              </Dropdown>
            </li>
            <li className="user-panel-info">
              {userId && (
                <React.Fragment>
                  <Dropdown
                    overlay={
                      <Menu>
                        {mallRouters.account.children.map((item) => (
                          <Menu.Item>
                            <Link to={`/sigl/my-mall${item.path}`} target="_black">
                              {item.name}
                            </Link>
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          <a onClick={() => logout()}>
                            {intl.get('mallf.header.model.header.logOut').d('退出')}
                          </a>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <span className="link-popup">{`${realName}`}</span>
                  </Dropdown>
                </React.Fragment>
              )}
            </li>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default withRouter(
  connect(({ global }) => ({
    unitList: global.unitList,
    purchaseUnit: global.purchaseUnit,
    pointName: global.pointName,
  }))(TopBar)
);
