import React, { useState } from 'react';
import { connect } from 'dva';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';

import NoticeModal from './NoticeModal';
import style from './index.less';

function NoticeIcon(props) {
  const count = props.unreadMessageCount;
  const [visible, setVisible] = useState(false);

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

export default connect(({ global }) => ({
  unreadMessageCount: global.unreadMessageCount,
}))(NoticeIcon);
