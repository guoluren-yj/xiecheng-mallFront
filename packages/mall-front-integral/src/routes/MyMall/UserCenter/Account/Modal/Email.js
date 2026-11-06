import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'choerodon-ui';

import Swal from 'components/swal';
import { postCaptchaService } from 'services/userInfoService';
import { EMAIL } from 'utils/regExp';
import intl from 'utils/intl';
import './index.less';

const FormItem = Form.Item;
let timer;
const field = 'email';

function Email(props) {
  const { form, bindForm, lastCheckKey, userInfo, setState } = props;
  const { emailCheckFlag, email } = userInfo;
  const { getFieldDecorator, getFieldsValue } = form;

  const [seconds, setSeconds] = useState(60);
  const [nextPostCaptcha, setNextPostCaptcha] = useState(true);
  const [postCaptchaLoading, setPostCaptchaLoading] = useState(false);

  useEffect(() => {
    bindForm(form);
  }, []);

  // 60s之后下一次手机发送验证码
  function validateNextCaptcha() {
    let i = 60;
    timer = setInterval(() => {
      i--;
      if (i === 0) {
        setNextPostCaptcha(true);
        clearInterval(timer);
        return;
      }
      setNextPostCaptcha(false);
      setSeconds(i);
    }, 1000);
  }

  // 换绑新账号发验证码
  function postNewCaptcha(newNum) {
    const { newEmail, oldEmail } = getFieldsValue();
    if (newEmail || oldEmail) {
      setPostCaptchaLoading(true);
      postCaptchaService({ field, account: newEmail || oldEmail, lastCheckKey, newNum })
        .then((res) => {
          if (res) {
            Swal(res.message);
            setState({ captchaKey: res.captchaKey });
            setNextPostCaptcha(false);
          }
          validateNextCaptcha();
        })
        .finally(() => {
          setPostCaptchaLoading(false);
        });
    }
  }

  const validatePassWord = (
    <FormItem required>
      {getFieldDecorator('password', {
        validateTrigger: 'onBlur',
        rules: [
          {
            required: true,
            message: intl
              .get('hzero.common.validation.notNull', {
                name: intl.get('mallf.myMall.model.user.originalPassword').d('原密码'),
              })
              .d('原密码不能为空'),
          },
        ],
      })(
        <Input
          label={intl.get('mallf.myMall.model.user.originalPassword').d('原密码')}
          // type="password"
          className="password-input"
          autoComplete="off"
        />
      )}
    </FormItem>
  );

  const changeEmail = (
    <>
      <FormItem required>
        {getFieldDecorator('newEmail', {
          validateTrigger: 'onBlur',
          validateFirst: true,
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.email').d('邮箱'),
                })
                .d('邮箱不能为空'),
            },
            {
              pattern: EMAIL,
              message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
            },
          ],
        })(<Input label={intl.get('mallf.myMall.model.user.email').d('邮箱')} />)}
      </FormItem>
      <FormItem required>
        {getFieldDecorator('captcha', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.emailCaptcha').d('邮箱验证码'),
                })
                .d('邮箱验证码不能为空'),
            },
          ],
        })(
          <Input
            label={intl.get('mallf.myMall.model.user.emailCaptcha').d('邮箱验证码')}
            style={{ width: 370, marginRight: 10 }}
          />
        )}
        <Button
          loading={postCaptchaLoading}
          onClick={() => {
            form.validateFields(['newEmail'], (err) => {
              if (!err) {
                postNewCaptcha(true);
              }
            });
          }}
          disabled={!nextPostCaptcha}
          style={
            nextPostCaptcha
              ? { width: 90 }
              : { width: 90, backgroundColor: '#f5f5f5', color: '#999' }
          }
        >
          {nextPostCaptcha
            ? intl.get(`mallf.myMall.model.account.sendCode`).d('发送验证码')
            : intl
                .get(`mallf.myMall.model.account.codeTime`, {
                  value: seconds,
                })
                .d(`${seconds}秒`)}
        </Button>
      </FormItem>
    </>
  );

  const validateEmail = (
    <>
      <FormItem required>
        {getFieldDecorator('oldEmail', {
          initialValue: userInfo.email,
          validateTrigger: 'onBlur',
          validateFirst: true,
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.email').d('邮箱'),
                })
                .d('邮箱不能为空'),
            },
            {
              pattern: EMAIL,
              message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
            },
          ],
        })(<Input label={intl.get('mallf.myMall.model.user.email').d('邮箱')} disabled />)}
      </FormItem>
      <FormItem required>
        {getFieldDecorator('captcha', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.emailCaptcha').d('邮箱验证码'),
                })
                .d('邮箱验证码不能为空'),
            },
          ],
        })(
          <Input
            label={intl.get('mallf.myMall.model.user.emailCaptcha').d('邮箱验证码')}
            style={{ width: 370, marginRight: 10 }}
          />
        )}
        <Button
          style={
            nextPostCaptcha
              ? { width: 90 }
              : { width: 90, backgroundColor: '#f5f5f5', color: '#999' }
          }
          //   disabled={validCodeSendLimitFlag}
          loading={postCaptchaLoading}
          onClick={() => {
            form.validateFields(['oldEmail'], (err) => {
              if (!err) {
                postNewCaptcha();
              }
            });
          }}
        >
          {nextPostCaptcha
            ? intl.get(`mallf.myMall.model.account.sendCode`).d('发送验证码')
            : intl
                .get(`mallf.myMall.model.account.codeTime`, {
                  value: seconds,
                })
                .d(`${seconds}秒`)}
        </Button>
      </FormItem>
    </>
  );

  return (
    <>
      {email && !emailCheckFlag ? (
        validateEmail
      ) : (
        <>{lastCheckKey ? changeEmail : validatePassWord}</>
      )}
    </>
  );
}

export default Form.create({ fieldNameProp: null })(Email);
