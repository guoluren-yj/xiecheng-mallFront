import React, { useState, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { queryCount } from 'services/headerService';

import NoticeModal from './NoticeModal';
import style from './index.less';

export default function NoticeIcon() {
  const [count, setCount] = useState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queryCount().then((res) => {
      if (res) {
        const { unreadMessageCount } = res;
        setCount(unreadMessageCount);
      }
    });
  }, []);

  const modalProps = {
    visible,
    setVisible,
  };

  return (
    <>
      <div className={style['notice-icon']} onClick={() => setVisible(true)}>
        <Icon type="textsms" />
        <span style={{ margin: '0 5px' }}>
          {intl.get('mallf.common.view.noticeIcon.title').d('消息通知')}
        </span>
        {count > 0 && <span className="notice-icon-count">{count > 99 ? '99+' : count}</span>}
      </div>
      {visible && <NoticeModal {...modalProps} />}
    </>
  );
}
