import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import { getPasswordRule } from 'services/userInfoService';
import intl from 'utils/intl';
import Modal from './Modal';
import styles from './index.less';
import useSetState from '@/hooks/useState';

const reg = /^(\d{3})\d*(\d{4})$/;
export default function Account(props) {
  const {
    userInfo: { phoneCheckFlag, phone, emailCheckFlag, email },
    fetchUserInfo,
  } = props;
  const [state, setState] = useSetState({ visible: false, type: '', passwordTipMsg: {} });
  const { visible, type, passwordTipMsg } = state;

  const toggleVisible = () => setState({ visible: !visible });

  const handleClick = (t) => {
    toggleVisible();
    setState({ type: t });
  };

  const setPasswordRule = () => {
    getPasswordRule().then((res) => setState({ passwordTipMsg: res }));
  };

  return (
    <div className={styles['user-center-content']}>
      <p className="account-title">
        {intl.get('mallf.userCenter.model.account.safety').d('账户安全')}
      </p>
      <div className="account-content">
        <div className="content-box">
          <div className="box-icon phone" />
          <p className="box-title">
            {intl.get('mallf.userCenter.userCenter.bind.phone').d('绑定手机')}
          </p>
          {phoneCheckFlag ? (
            <p className="box-num">
              {intl.get('mallf.userCenter.userCenter.hasbind.phone').d('已绑定手机')}
              {phone ? `+${phone.replace(reg, '$1****$2')}` : ''}
            </p>
          ) : (
            <p className="box-num">
              <Icon
                type="info"
                style={{ fontSize: '16px', color: '#FA6400', marginRight: 10, marginTop: -2 }}
              />
              {intl
                .get(`mallf.userCenter.model.account.phoneNotBound`)
                .d('暂未绑定，可添加手机绑定')}
            </p>
          )}
          {phoneCheckFlag ? (
            // <Tooltip
            //   placement="bottom"
            //   title={intl.get('mallf.userCenter.userCenter.change.phone').d('更换手机')}
            // >
            <Button
              className={`box-btn ${phoneCheckFlag ? '' : 'active'}`}
              onClick={() => {
                handleClick('A');
              }}
            >
              {intl.get('mallf.userCenter.userCenter.change.phone').d('更换手机')}
            </Button>
          ) : (
            // </Tooltip>
            // <Tooltip
            //   placement="bottom"
            //   title={intl.get('mallf.userCenter.userCenter.bind.phone').d('绑定手机')}
            // >
            <Button
              className={`box-btn ${phoneCheckFlag ? '' : 'active'}`}
              color="primary"
              onClick={() => {
                handleClick('B');
              }}
            >
              {intl.get('mallf.userCenter.userCenter.bind.phone').d('绑定手机')}
            </Button>
            // </Tooltip>
          )}
        </div>
        <div className="content-box">
          <div className="box-icon email" />
          <p className="box-title">
            {intl.get('mallf.userCenter.userCenter.bind.email').d('绑定邮箱')}
          </p>
          {emailCheckFlag ? (
            <p className="box-num">
              {intl.get('mallf.userCenter.userCenter.hasbind.email').d('已绑定邮箱')} {email || ''}
            </p>
          ) : (
            <p className="box-num">
              <Icon
                type="info"
                style={{ fontSize: '16px', color: '#FA6400', marginRight: 10, marginTop: -2 }}
              />
              {intl
                .get(`mallf.userCenter.model.account.mailboxNotBound`)
                .d('暂未绑定，可添加邮箱绑定')}
            </p>
          )}
          {emailCheckFlag ? (
            // <Tooltip
            //   placement="bottom"
            //   title={intl.get('mallf.userCenter.userCenter.change.email').d('更换邮箱')}
            // >
            <Button
              className={`box-btn ${emailCheckFlag ? '' : 'active'}`}
              onClick={() => {
                handleClick('C');
              }}
            >
              {intl.get('mallf.userCenter.userCenter.change.email').d('更换邮箱')}
            </Button>
          ) : (
            // </Tooltip>
            // <Tooltip
            //   placement="bottom"
            //   title={intl.get('mallf.userCenter.userCenter.bind.email').d('绑定邮箱')}
            // >
            <Button
              className={`box-btn ${emailCheckFlag ? '' : 'active'}`}
              color="primary"
              onClick={() => {
                handleClick('D');
              }}
            >
              {intl.get('mallf.userCenter.userCenter.bind.email').d('绑定邮箱')}
            </Button>
            // </Tooltip>
          )}
        </div>
        <div className="content-box">
          <div className="box-icon password" />
          <p className="box-title">
            {intl.get('mallf.userCenter.userCenter.change.password').d('修改密码')}
          </p>
          <p className="box-num">
            {intl.get('mallf.userCenter.userCenter.password.warning').d('请选择安全系数高的密码')}
          </p>
          {/* <Tooltip
            placement="bottom"
            title={intl.get('mallf.userCenter.userCenter.change.password').d('修改密码')}
          > */}
          <Button
            className="box-btn"
            onClick={() => {
              setPasswordRule();
              handleClick('E');
            }}
          >
            {intl.get('mallf.userCenter.userCenter.change.password').d('修改密码')}
          </Button>
          {/* </Tooltip> */}
        </div>
      </div>
      <Modal
        userInfo={props.userInfo}
        fetchUserInfo={fetchUserInfo}
        emailCheckFlag={emailCheckFlag}
        passwordTipMsg={passwordTipMsg}
        type={type}
        visible={visible}
        toggleVisible={toggleVisible}
      />
    </div>
  );
}
