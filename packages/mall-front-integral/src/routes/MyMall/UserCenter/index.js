/**
 * user-center - 账户设置个人中心
 * @date: 2019-09-16
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect } from 'react';

import formatterCollections from 'utils/intl/formatterCollections';
import { fetchUserInfoService } from 'services/userInfoService';
import style from './index.less';
import User from './User';
import Account from './Account';

function UserCenter() {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    initUserInfo();
  }, []);

  // 初始化个人信息
  function initUserInfo() {
    fetchUserInfoService().then((res) => {
      setUserInfo(res);
    });
  }

  return (
    <div className={style['user-center']} style={{ width: '100%' }}>
      <User userInfo={userInfo} />
      <Account fetchUserInfo={initUserInfo} userInfo={userInfo} />
    </div>
  );
}
export default formatterCollections({ code: ['mallf.userCenter'] })(UserCenter);
