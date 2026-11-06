import React, { useEffect, useState } from 'react';
import { Form, Input } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import Swal from 'components/swal';
import { postCaptchaService } from 'services/userInfoService';
import { PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import './index.less';

const FormItem = Form.Item;
let timer;
const field = 'phone';

function Phone(props) {
  const { form, bindForm, lastCheckKey, userInfo, setState } = props;
  const { phoneCheckFlag, phone } = userInfo;
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
    const { newPhone, oldPhone } = getFieldsValue();
    if (newPhone || oldPhone) {
      setPostCaptchaLoading(true);
      postCaptchaService({
        field,
        account: newPhone || oldPhone,
        businessScope: 'self',
        lastCheckKey,
        newNum,
      })
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
          className="password-input"
          // type="password"
        />
      )}
    </FormItem>
  );

  const changePhone = (
    <>
      <FormItem required>
        {getFieldDecorator('newPhone', {
          validateTrigger: 'onBlur',
          validateFirst: true,
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.phone').d('手机号码'),
                })
                .d('手机号码不能为空'),
            },
            {
              pattern: PHONE,
              message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
            },
          ],
        })(
          <Input
            disabled={!phone}
            label={
              userInfo.phone ? intl.get('mallf.userCenter.model.user.phone').d('手机号码') : null
            }
            placeholder={
              userInfo.phone
                ? null
                : intl
                    .get('mallf.userCenter.model.user.noPhoneWar')
                    .d('请联系管理员在子账户管理维护手机号')
            }
          />
        )}
      </FormItem>
      <FormItem required>
        {getFieldDecorator('captcha', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.phoneCaptcha').d('短信验证码'),
                })
                .d('短信验证码不能为空'),
            },
          ],
        })(
          <Input
            label={intl.get('mallf.myMall.model.user.phoneCaptcha').d('短信验证码')}
            style={{ width: 360, marginRight: 10 }}
          />
        )}
        <Button
          loading={postCaptchaLoading}
          onClick={() => {
            form.validateFields(['newPhone'], (err) => {
              if (!err) {
                postNewCaptcha(true);
              }
            });
          }}
          disabled={!nextPostCaptcha}
          style={
            nextPostCaptcha
              ? { width: 96 }
              : { width: 96, backgroundColor: '#f5f5f5', color: '#999' }
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

  const validatePhone = (
    <>
      <FormItem required>
        {getFieldDecorator('oldPhone', {
          initialValue: userInfo.phone,
          validateTrigger: 'onBlur',
          validateFirst: true,
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.phone').d('手机号码'),
                })
                .d('手机号码不能为空'),
            },
            {
              pattern: PHONE,
              message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
            },
          ],
        })(<Input label={intl.get('mallf.myMall.model.user.phone').d('手机号码')} disabled />)}
      </FormItem>
      <FormItem required>
        {getFieldDecorator('captcha', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get('mallf.myMall.model.user.phoneCaptcha').d('短信验证码'),
                })
                .d('短信验证码不能为空'),
            },
          ],
        })(
          <Input
            label={intl.get('mallf.myMall.model.user.phoneCaptcha').d('短信验证码')}
            style={{ width: 360, marginRight: 10 }}
          />
        )}
        <Button
          style={
            nextPostCaptcha
              ? { width: 96 }
              : { width: 96, backgroundColor: '#f5f5f5', color: '#999' }
          }
          //   disabled={validCodeSendLimitFlag}
          loading={postCaptchaLoading}
          onClick={() => {
            form.validateFields(['oldPhone'], (err) => {
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
      {phone && !phoneCheckFlag ? (
        validatePhone
      ) : (
        <>{lastCheckKey || !phoneCheckFlag ? changePhone : validatePassWord}</>
      )}
    </>
  );
}

export default Form.create({ fieldNameProp: null })(Phone);
