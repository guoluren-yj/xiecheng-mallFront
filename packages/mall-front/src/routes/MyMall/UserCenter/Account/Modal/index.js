import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui';
import { Button, Message } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { encryptPwd, getUserConfigInfo } from 'utils/utils';
import {
  updatePasswordService,
  emailValidatePassword,
  validateNewCaptchaService,
  userInfoValidateService,
} from 'services/userInfoService';
import Swal from 'components/swal';
import PassWord from './PassWord';
import Email from './Email';
import Phone from './Phone';
import useSetState from '@/hooks/useState';
import '../index.less';

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
        return intl.get('mallf.userCenter.userCenter.change.phone').d('更换手机');
      case 'B':
        return intl.get('mallf.userCenter.userCenter.bind.phone').d('绑定手机');
      case 'C':
        return intl.get('mallf.userCenter.userCenter.change.email').d('更换邮箱');
      case 'D':
        return intl.get('mallf.userCenter.userCenter.bind.email').d('绑定邮箱');
      case 'E':
        return intl.get('mallf.userCenter.userCenter.change.password').d('修改密码');
      default:
        return intl.get('mallf.userCenter.userCenter.change.phone').d('更换手机');
    }
  };

  const handleOk = () => {
    const {
      password,
      captcha,
      newEmail,
      oldEmail,
      newPhone,
      oldPhone,
    } = form.current.getFieldsValue();

    switch (type) {
      case 'A':
        if (password && !lastCheckKey) {
          emailValidatePassword(encryptPwd(password, publicKey)).then((res) => {
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
              Message.success(intl.get(`mallf.userCenter.model.account.passBindMsg`).d(`绑定成功`));
            }
            toggleVisible();
          });
        }
        break;
      case 'B':
        if (oldPhone && captcha && captchaKey) {
          userInfoValidateService({
            field: 'phone',
            captcha,
            captchaKey,
          }).then(() => {
            Message.success(
              intl.get(`mallf.userCenter.model.account.firstBindSuccessMsg`).d('首次绑定成功')
            );
            toggleVisible();
            fetchUserInfo();
          });
        }
        break;
      case 'C':
      case 'D':
        if (password && !lastCheckKey) {
          emailValidatePassword(encryptPwd(password, publicKey)).then((res) => {
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
              Message.success(intl.get(`mallf.userCenter.model.account.passBindMsg`).d(`绑定成功`));
            }
            toggleVisible();
          });
        } else if (oldEmail && captcha && captchaKey) {
          userInfoValidateService({
            field: 'email',
            captcha,
            captchaKey,
          }).then(() => {
            Message.success(
              intl.get(`mallf.shoppingBasket.model.account.firstBindSuccessMsg`).d('首次绑定成功')
            );
            toggleVisible();
            fetchUserInfo();
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
      //       Swal(intl.get(`mallf.shoppingBasket.model.account.firstBindSuccessMsg`).d('首次绑定成功'));
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
        return intl.get(`mallf.userCenter.userCenter.change.phone`).d('更换手机');
    }
  };

  return (
    <>
      {visible && (
        <Modal
          className="user-modal"
          title={renderTitle()}
          visible={visible}
          onCancel={() => {
            toggleVisible();
            setState({ lastCheckKey: '', captchaKey: '' });
          }}
          onOk={handleOk}
          footer={[
            <Button
              key="back"
              onClick={() => {
                toggleVisible();
                setState({ lastCheckKey: '', captchaKey: '' });
              }}
            >
              {intl.get(`mallf.userCenter.button.cancel`).d('取消')}
            </Button>,
            <Button
              color="primary"
              key="save"
              onClick={() => {
                handleOk();
              }}
            >
              {intl.get(`mallf.userCenter.model.confirm`).d('确认')}
            </Button>,
          ]}
        >
          {renderContent()}
        </Modal>
      )}
    </>
  );
}
