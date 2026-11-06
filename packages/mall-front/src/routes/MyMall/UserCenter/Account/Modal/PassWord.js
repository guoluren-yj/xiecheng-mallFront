import React, { useEffect } from 'react';
import { Form, Input } from 'choerodon-ui';

import { getUserConfigInfo } from 'utils/utils';
import { validatePasswordRule } from '@/utils/validator';
import intl from 'utils/intl';
// import { Button as C7nButton, Message } from 'choerodon-ui/pro';
// import { postCaptchaService } from 'services/userInfoService';
import ValidateButton from './ValidateButton';
import './index.less';

const FormItem = Form.Item;
// let timer;
// const field = 'phone';
const reg = /^(\d{3})\d*(\d{4})$/;
function Account(props) {
  const { form, passwordTipMsg, bindForm, userInfo, setState } = props;
  const { getFieldDecorator } = form;
  const { forceCodeVerify } = passwordTipMsg;
  const {
    userInfo: { loginName },
  } = getUserConfigInfo();

  useEffect(() => {
    bindForm(form);
  }, []);

  /**
   * validateNewPasswordNotSame - 验证新密码 不能和 旧密码 相同
   * @param {String} value - 新的密码
   * @param {Function} callback - 校验失败 需要回调错误， 否则空的回调
   * @param {Object} form - 表单
   * @memberof UserInfo
   */
  function validateNewPasswordNotSame(value, callback) {
    if (value && value === form.getFieldValue('originalPassword')) {
      callback(
        intl.get('mallf.userCenter.view.validation.passwordNoSame').d('新密码不能与原密码相同')
      );
    } else {
      callback();
    }
  }

  /**
   * validatePasswordAnther - 验证 新密码 和 确认密码 相同
   * @param {String} value - 新的密码
   * @param {Function} callback - 校验失败 需要回调错误， 否则空的回调
   * @param {Object} form - 表单
   * @memberof UserInfo
   */
  function validatePasswordAnther(value, callback) {
    if (value && value !== form.getFieldValue('password')) {
      callback(
        intl.get('mallf.userCenter.view.validation.passwordSame').d('确认密码必须与密码相同')
      );
    } else {
      callback();
    }
  }

  /**
   * 检查 确认密码是否与密码一致
   */
  function validatePasswordRepeatForPassword(e) {
    const anotherPassword = form.getFieldValue('anotherPassword');
    const anotherPasswordField = {
      value: anotherPassword,
    };
    if (e.target.value) {
      if (e.target.value === anotherPassword) {
        anotherPasswordField.errors = null;
      } else {
        anotherPasswordField.errors = [
          new Error(
            intl.get('mallf.userCenter.view.validation.passwordSame').d('确认密码必须与密码相同')
          ),
        ];
      }
    } else {
      anotherPasswordField.errors = null;
    }
    form.setFields({
      anotherPassword: anotherPasswordField,
    });
  }
  return (
    <>
      <FormItem required key="originalPassword">
        {getFieldDecorator('originalPassword', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.userCenter.model.user.originalPassword').d('原密码'),
                })
                .d('原密码不能为空'),
            },
            {
              max: 110,
              message: intl.get('hzero.common.validation.max', {
                max: 110,
              }),
            },
          ],
          // 密码字段自动填充 https://developer.mozilla.org/zh-CN/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
        })(
          <Input
            label={intl.get('mallf.userCenter.model.user.originalPassword').d('原密码')}
            // type="password"
            autoComplete="off"
            className="password-input"
          />
        )}
      </FormItem>
      <FormItem required key="password">
        {getFieldDecorator('password', {
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.userCenter.model.userInfo.password').d('密码'),
                })
                .d('密码不能为空'),
            },
            {
              validator: (_, value, callback) => {
                validatePasswordRule(value, callback, { ...passwordTipMsg, loginName });
              },
            },
            {
              validator: (_, value, callback) => {
                validateNewPasswordNotSame(value, callback, form);
              },
            },
            {
              max: 110,
              message: intl.get('hzero.common.validation.max', {
                max: 110,
              }),
            },
          ],
        })(
          <Input
            label={intl.get('mallf.userCenter.model.user.password').d('密码')}
            // type="password"
            className="password-input"
            autoComplete="off"
            onChange={(e) => {
              validatePasswordRepeatForPassword(e, form);
            }}
          />
        )}
      </FormItem>
      <FormItem required key="anotherPassword">
        {getFieldDecorator('anotherPassword', {
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.userCenter.model.userInfo.anotherPassword').d('确认密码'),
                })
                .d('确认密码不能为空'),
            },
            {
              validator: (_, value, callback) => {
                validatePasswordAnther(value, callback, form);
              },
            },
          ],
        })(
          <Input
            label={intl.get('mallf.userCenter.model.user.anotherPassword').d('确认密码')}
            // type="password"
            className="password-input"
            autoComplete="off"
          />
        )}
      </FormItem>
      {/* 绑定了号码 && 租户开启了【强制验证码校验】 */}
      {!!userInfo.phoneCheckFlag && forceCodeVerify && (
        <>
          <FormItem required key="phoneNumber">
            {getFieldDecorator('phoneNumber', {
              initialValue: userInfo.phone.replace(reg, '$1****$2'),
            })(
              <Input
                label={intl.get('mallf.userCenter.userCenter.phoneNumber').d('手机号码')}
                autoComplete="off"
                disabled
              />
            )}
          </FormItem>
          <FormItem required key="captcha">
            {getFieldDecorator('captcha', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl
                    .get(`mallf.userCenter.model.account.codeNullMsg`)
                    .d('验证码不能为空'),
                },
              ],
            })(
              <Input
                label={intl.get('mallf.userCenter.model.user.Captcha').d('验证码')}
                style={{ width: 360, marginRight: 10 }}
                placeholder={intl
                  .get(`mallf.userCenter.model.account.codePlaceholder`)
                  .d('请输入验证码')}
              />
            )}
            <>
              <ValidateButton
                userInfo={userInfo}
                callback={(captchaKey) => setState({ captchaKey })}
              />
            </>
          </FormItem>
        </>
      )}
    </>
  );
}

export default Form.create({ fieldNameProp: null })(Account);
