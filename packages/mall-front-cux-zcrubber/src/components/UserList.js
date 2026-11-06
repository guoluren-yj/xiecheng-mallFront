import React from 'react';
import { Menu } from 'choerodon-ui/pro';

import Link from 'components/Link';

export default function UserList({ userList = [] }) {
  return (
    <Menu>
      {userList.map((item) => (
        <Menu.Item>
          <Link to={`/my-mall${item.path}`}>{item.name}</Link>
        </Menu.Item>
      ))}
    </Menu>
  );
}
