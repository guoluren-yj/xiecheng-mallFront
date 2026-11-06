import React from 'react';
import { Menu } from 'choerodon-ui/pro';

import Link from 'components/Link';
import { PermissionWrapper } from 'components/Permission';
import { logout } from 'services/api';
import intl from 'utils/intl';
import cuxComponent from 'cuxTools/cuxComponent';

function UserList({ userList = [] }) {
  const beforeLogout = () => {
    window.postMessage('needLogout', window.location.origin);
    logout();
  };
  return (
    <Menu>
      {userList.map((item) => (
        <PermissionWrapper permissionList={item.permissionList}>
          <Menu.Item onItemHover={(e) => e} onClick={(e) => e} className="c7n-menu-item">
            <Link to={`/my-mall${item.path}`}>{item.name}</Link>
          </Menu.Item>
        </PermissionWrapper>
      ))}
      <Menu.Item>
        <a onClick={beforeLogout}>{intl.get('mallf.header.model.header.logOut').d('退出')}</a>
      </Menu.Item>
    </Menu>
  );
}

export default cuxComponent({ path: 'Layout/Header/TopBar/UserList' })(UserList);
