import React from 'react';
import { Spin } from 'hzero-ui';
import { Menu, Dropdown } from 'choerodon-ui/pro';

import cuxComponent from 'cuxTools/cuxComponent';

function PunchOut({ poList, checkGetUrl, checkLoading }) {
  return (
    <>
      {poList.length > 0 && (
        <li className="user-panel-info">
          <Dropdown
            overlay={
              <Spin spinning={checkLoading}>
                <Menu>
                  {poList.map((item) => (
                    <Menu.Item onClick={() => checkGetUrl(item)}>
                      <a>{item.ecPlatformName}</a>
                    </Menu.Item>
                  ))}
                </Menu>
              </Spin>
            }
          >
            <span className="link-popup">Punch Out</span>
          </Dropdown>
        </li>
      )}
    </>
  );
}

export default cuxComponent({ path: 'layout/Header/TopBar/PunchOut' })(PunchOut);
