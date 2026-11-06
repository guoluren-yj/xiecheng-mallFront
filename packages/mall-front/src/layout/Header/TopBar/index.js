import React, { useState } from 'react';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { Menu, Dropdown } from 'choerodon-ui/pro';

import Icons from 'components/Icons';
import { PermissionWrapper } from 'components/Permission';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo, fillUrlToken, openPage } from 'utils/utils';
import { getMallSortMenu } from 'utils/configUtils';
import intl from 'utils/intl';
import Swal from 'components/swal';
import { checkIn } from 'services/headerService';
import style from './index.less';
import MultilLanguage from './MultilLanguage';
import AddressArea from './AddressArea';
import NoticeIcon from './NoticeIcon';
import PunchOut from './PunchOut';
import QuickLink from './QuickLink';
import UserList from './UserList';
import getMallRouter from '@/routes/MyMall/router';
import ChooseUnit from './ChooseUnit';

function TopBar(props) {
  const { ecList, finish } = props;
  const { userId, memberPermission } = getUserConfigInfo();

  const { realName, needLanguage, hideFieldList } = getUserConfigInfo();
  const mallRouters = getMallRouter();

  const [checkLoading, setCheckLoading] = useState(false);
  const sortMenuList = getMallSortMenu(mallRouters);
  async function checkGetUrl(item) {
    const { ecPlatformCode: supplierCode } = item;
    setCheckLoading(true);
    const res = await checkIn({ supplierCode, webUrl: `${window.location.origin}/cart` });
    setCheckLoading(false);
    if (isJson(res) && JSON.parse(res).failed) {
      Swal(JSON.parse(res).message);
    } else if (res) {
      openPage(res);
    }
  }

  function isJson(res) {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  }

  const poList = ecList.filter((f) => f.interfaceType === 'PO');

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
            {window.location.pathname !== '/' && (
              <li className="user-panel-info">
                <span className="top-menu-link">
                  <Link to="/">
                    <Icon type="home" style={{ fontSize: 14, margin: '-3px 6px 0' }} />
                    <span>{intl.get('mallf.common.view.backHome').d('返回首页')}</span>
                  </Link>
                </span>
              </li>
            )}
            <QuickLink />
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
            {memberPermission && (
              <li className="user-panel-info">
                <span className="top-menu-link">
                  <a
                    onClick={() => {
                      openPage(`${window.location.origin}/sigl`, true);
                    }}
                  >
                    {intl.get('mallf.common.view.integral.buy').d('会员购')}
                  </a>
                </span>
              </li>
            )}
            <PunchOut poList={poList} checkGetUrl={checkGetUrl} checkLoading={checkLoading} />
            {userId && (
              <React.Fragment>
                <ChooseUnit />
                <li className="user-panel-info">
                  <Dropdown
                    overlay={() => (
                      <Menu>
                        {sortMenuList?.map((item) => (
                          <PermissionWrapper permissionList={item.permissionList}>
                            <Menu.Item
                              onItemHover={(e) => e}
                              onClick={(e) => e}
                              className="c7n-menu-item"
                            >
                              <Link to={`/my-mall${item.path}`}>{item.name}</Link>
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
                  <NoticeIcon />
                </li>
              </React.Fragment>
            )}
            <li className="user-panel-info">
              {userId && (
                <React.Fragment>
                  <Dropdown overlay={<UserList userList={mallRouters.account.children} />}>
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

export default withRouter(TopBar);
