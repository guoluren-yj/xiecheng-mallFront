import React, { useRef, useState, useEffect } from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { uploadAvatarService } from 'services/userInfoService';
import defaultImg from '@/assets/images/default/touxiang.png';
import styles from './index.less';
import CroperModal from './CroperModal';

export default function User(props) {
  const {
    userInfo: { imageUrl, groupName, companyName, loginName, realName },
  } = props;
  const croperModal = useRef(null);
  const [imgUrl, setImgUrl] = useState(defaultImg);

  useEffect(() => {
    if (imageUrl) {
      setImgUrl(imageUrl);
    }
  }, [imageUrl]);
  function fn(ele) {
    croperModal.current = ele;
  }

  return (
    <div className={styles.content}>
      <p className="user-title">
        {intl.get(`mallf.userCenter.view.userCenter.userInfo`).d('个人信息')}
      </p>
      <div className="user-content">
        <div className="user-icon-box">
          <div
            className="user-icon"
            onClick={() => {
              if (croperModal.current?.toggle) croperModal.current.toggle();
            }}
          >
            <div className="user-icon-cover">
              <Icon type="photo_camera" style={{ fontSize: '30px', color: '#fff' }} />
            </div>
            <img src={imgUrl} alt="" />
          </div>
        </div>
        <div className="user-name">
          <div className="one">
            <span
              className="user-label"
              title={intl.get(`mallf.userCenter.view.userCenter.loginName`).d('登录名')}
            >
              {intl.get(`mallf.userCenter.view.userCenter.loginName`).d('登录名')}：
            </span>
            <span className="user-username">{realName}</span>
          </div>
          <div className="two">
            <span
              className="user-label"
              title={intl.get(`mallf.userCenter.view.userCenter.loginNum`).d('登录账号')}
            >
              {intl.get(`mallf.userCenter.view.userCenter.loginNum`).d('登录账号')}：
            </span>
            <span className="user-username">{loginName}</span>
          </div>
        </div>
        <div className="user-name">
          <div className="one">
            <span
              className="user-label"
              title={intl.get(`mallf.userCenter.model.userCenter.affiliateGroup`).d('所属集团')}
            >
              {intl.get(`mallf.userCenter.model.userCenter.affiliateGroup`).d('所属集团')}：
            </span>
            <span className="user-username">{groupName || '-'}</span>
          </div>
          <div className="two">
            <span
              className="user-label"
              title={intl.get(`mallf.userCenter.model.userCenter.affiliateCompany`).d('所属公司')}
            >
              {intl.get(`mallf.userCenter.model.userCenter.affiliateCompany`).d('所属公司')}：
            </span>
            <span className="user-username">{companyName || '-'}</span>
          </div>
        </div>
      </div>
      <CroperModal
        fn={fn}
        width={300}
        height={300}
        callback={(res) => {
          uploadAvatarService({ avatar: res }).then(() => {
            setImgUrl(res);
          });
        }}
      />
    </div>
  );
}
