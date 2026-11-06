import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui';
import { Message } from 'choerodon-ui/pro';
import { encryptPwd, getUserConfigInfo } from 'utils/utils';

import intl from 'utils/intl';
import {
  updatePasswordService,
  emailValidatePassword,
  validateNewCaptchaService,
  userInfoValidateService,
} from 'services/userInfoService';
import useSetState from 'hooks/useState';
import Swal from 'components/swal';
import PassWord from './PassWord';
import Email from './Email';
import Phone from './Phone';

export default function Account(props) {
  const { visible, toggleVisible, type, passwordTipMsg, fetchUserInfo, userInfo } = props;
  const { publicKey } = getUserConfigInfo();
  const form = useRef(null);

  const [state, setState] = useSetState({ lastCheckKey: '', captchaKey: '' });

  const { lastCheckKey, captchaKey } = state;

  const bindForm = (f) => {
    form.current = f;
  };

  const renderContent = () => {
    switch (type) {
      case 'A':
      case 'B':
        return (
          <Phone
            userInfo={userInfo}
            setState={setState}
            lastCheckKey={lastCheckKey}
            bindForm={bindForm}
          />
        );
      case 'C':
      case 'D':
        return (
          <Email
            userInfo={userInfo}
            setState={setState}
            lastCheckKey={lastCheckKey}
            bindForm={bindForm}
          />
        );
      case 'E':
        if (passwordTipMsg.forceCodeVerify) {
          if (+userInfo.phoneCheckFlag === 0) {
            Swal(
              intl
                .get('mallf.userCenter.view.validation.notBindPhoneYet')
                .d(' 当前用户未绑定手机号，请先绑定手机号。')
            );
            toggleVisible();
          }
        }
        return (
          <PassWord
            bindForm={bindForm}
            passwordTipMsg={passwordTipMsg}
            userInfo={userInfo}
            setState={setState}
          />
        );
      default:
        return <>A</>;
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'A':
        return intl.get('mallf.myMall.userCenter.change.phone').d('更换手机');
      case 'B':
        return intl.get('mallf.myMall.userCenter.bind.phone').d('绑定手机');
      case 'C':
        return intl.get('mallf.myMall.userCenter.change.email').d('更换邮箱');
      case 'D':
        return intl.get('mallf.myMall.userCenter.bind.email').d('绑定邮箱');
      case 'E':
        return intl.get('mallf.myMall.userCenter.change.password').d('修改密码');
      default:
        return intl.get('mallf.myMall.userCenter.change.phone').d('更换手机');
    }
  };

  const handleOk = () => {
    const {
      password,
      captcha,
      newEmail,
      // oldEmail,
      newPhone,
      oldPhone,
    } = form.current.getFieldsValue();
    switch (type) {
      case 'A':
        if (password && !lastCheckKey) {
          emailValidatePassword(password).then((res) => {
            setState({
              lastCheckKey: res.lastCheckKey,
            });
          });
        } else if (captchaKey && lastCheckKey && captcha && newPhone) {
          const params = {
            field: 'phone',
            account: newPhone,
            captcha,
            captchaKey,
            lastCheckKey,
          };
          validateNewCaptchaService(params).then((res) => {
            if (res) {
              fetchUserInfo();
              Message.success(intl.get(`mallf.myMall.model.account.passBindMsg`).d(`绑定成功`));
            }
            toggleVisible();
          });
        }
        break;
      case 'B':
        if (oldPhone && captcha) {
          userInfoValidateService({
            field: 'phone',
            captcha,
            captchaKey,
          }).then(() => {
            Message.success(
              intl.get(`mallf.myMall.model.account.firstBindSuccessMsg`).d('首次绑定成功')
            );
            toggleVisible();
            fetchUserInfo();
          });
        }
        break;
      case 'C':
      case 'D':
        if (password && !lastCheckKey) {
          emailValidatePassword(password).then((res) => {
            setState({
              lastCheckKey: res.lastCheckKey,
            });
          });
        } else if (captchaKey && lastCheckKey && captcha && newEmail) {
          const params = {
            field: 'email',
            account: newEmail,
            captcha,
            captchaKey,
            lastCheckKey,
          };
          validateNewCaptchaService(params).then((res) => {
            if (res) {
              fetchUserInfo();
              Message.success(intl.get(`mallf.myMall.model.account.passBindMsg`).d(`绑定成功`));
            }
            toggleVisible();
          });
        }
        break;
      // case 'D':
      //   if (oldEmail && captcha) {
      //     userInfoValidateService({
      //       field: 'email',
      //       captcha,
      //       captchaKey,
      //     }).then(() => {
      //       Swal(intl.get(`mallf.myMall.model.account.firstBindSuccessMsg`).d('首次绑定成功'));
      //       toggleVisible();
      //       fetchUserInfo();
      //     });
      //   }
      //   break;
      case 'E':
        form.current.validateFields((err, fieldsValue) => {
          // eslint-disable-next-line no-shadow
          const { password: passwordValue, originalPassword, captcha: captchaValue } = fieldsValue;
          const params = {
            password: encryptPwd(passwordValue, publicKey),
            originalPassword: encryptPwd(originalPassword, publicKey),
            captcha: captchaValue,
            captchaKey,
            phone: userInfo.phone,
            businessScope: 'UPDATE_PASSWORD',
          };
          if (!err) {
            updatePasswordService(params).then((res) => {
              if (res) {
                Message.success(
                  intl.get(`mallf.userCenter.model.account.pwdMsgSuccess`).d('密码修改成功')
                );
                toggleVisible();
              }
            });
          }
        });
        break;
      default:
        return intl.get(`mallf.myMall.userCenter.change.phone`).d('更换手机');
    }
  };

  return (
    <>
      {visible && (
        <Modal
          title={renderTitle()}
          visible={visible}
          onCancel={() => {
            toggleVisible();
            setState({ lastCheckKey: '', captchaKey: '' });
          }}
          onOk={handleOk}
          okText={intl.get(`mallf.common.model.confirm`).d('确认')}
          cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
        >
          {renderContent()}
        </Modal>
      )}
    </>
  );
}
