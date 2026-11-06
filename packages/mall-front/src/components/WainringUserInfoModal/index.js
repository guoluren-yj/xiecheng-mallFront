import React, { useEffect } from 'react';
import { Modal } from 'hzero-ui';
import { getUserConfigInfo, setStorage, getStorage } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';

function WainringUserInfoModal({ loading, history, settings }) {
  useEffect(() => {
    if (!loading) {
      const {
        companyId,
        userId,
        userInfo: { emailCheckFlag, phoneCheckFlag },
      } = getUserConfigInfo();
      const viewFlag = getStorage(`${userId}_defaultAddressId`) || getStorage(`${userId}_region`);
      if (companyId) {
        const showModalFlag = !emailCheckFlag || !phoneCheckFlag;
        if (
          showModalFlag &&
          !getStorage(`infoModal_${userId}`) &&
          viewFlag &&
          settings['011026'] === '1'
        ) {
          info(userId);
        }
      }
    }
  }, [loading, settings]);

  function info(userId) {
    Modal.confirm({
      title: `${intl.get('mallf.common.view.dear.users').d('尊敬的用户您好')},`,
      okText: intl.get('mallf.common.view.immediately.binding').d('立即绑定'),
      cancelText: intl.get('mallf.common.view.nextTime.remind').d('下次提醒'),
      iconType: 'info-circle-o',
      className: styles['info-tip-modal'],
      content: (
        <div className="content">
          <p>{intl.get('mallf.common.view.dear.users').d('尊敬的用户您好')},</p>
          <p>
            {intl
              .get('mallf.common.view.WainringUserInfoModal.info')
              .d('为保证账户安全，请前往个人中心绑定个人信息')}
            。
          </p>
        </div>
      ),
      onOk() {
        history.push('/my-mall/user-center');
      },
      onCancel() {
        setStorage(`infoModal_${userId}`, 1);
      },
    });
  }
}
export default WainringUserInfoModal;
