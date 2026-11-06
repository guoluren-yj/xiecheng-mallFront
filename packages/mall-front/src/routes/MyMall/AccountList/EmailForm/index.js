import React, { useState } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import { Button } from 'choerodon-ui';
import { Message } from 'choerodon-ui/pro';

import Swal from 'components/swal';
import intl from 'utils/intl';
import {
  postCaptchaService,
  userInfoValidateService,
  userInfoValidatePreService,
  postNewCaptchaService,
  validateNewCaptchaService,
  emailValidatePassword,
} from 'services/userInfoService';

import style from './index.less';

const FormItem = Form.Item;
let timer;
function AccountForm(props) {
  const {
    field,
    checkFlag,
    defaultValue,
    rulePattern,
    formItemLayout,
    form: { getFieldDecorator, getFieldsValue, setFieldsValue, validateFields, getFieldValue },
    fetchUserInfo = (e) => e,
  } = props;
  const [isBinded, setIsBinded] = useState(false);
  const [nextPostCaptcha, setNextPostCaptcha] = useState(true);
  const [seconds, setSeconds] = useState(60);
  const [visible, setVisible] = useState(false);
  const [emailValitePassword, setEmailValitePassword] = useState(!defaultValue);
  const [captchaKey, setCaptchaKey] = useState('');
  const [lastCheckKey, setLastCheckKey] = useState('');

  // 切换表单框
  function handleToggle() {
    setVisible(!visible);
    setCaptchaKey('');
    setIsBinded(false);
    setLastCheckKey('');
    setNextPostCaptcha(true);
    setSeconds(60);
  }

  // 发送手机验证码 首次绑定默认手机/验证已绑定手机
  function postCaptcha() {
    const { account } = getFieldsValue();
    setCaptchaKey('');
    postCaptchaService({ field, account, lastCheckKey, newNum: !defaultValue })
      .then((res) => {
        Swal(res.message);
        setCaptchaKey(res.captchaKey);
        setNextPostCaptcha(false);
      })
      .finally(() => {
        validateNextCaptcha();
      });
  }

  // 首次默认绑定校验
  function userInfoValidate() {
    const { captcha } = getFieldsValue();
    validateFields((err) => {
      if (!err) {
        userInfoValidateService({
          field,
          captcha,
          captchaKey,
        }).then(() => {
          Message.success(
            intl.get(`mallf.userCenter.model.account.firstBindSuccessMsg`).d('首次绑定成功')
          );
          setEmailValitePassword(false);
          fetchUserInfo();
          setNextPostCaptcha(true);
          clearInterval(timer);
          handleToggle();
        });
      }
    });
  }

  // 换绑新账号验证原有账号
  function userInfoValidatePre() {
    const { captcha } = getFieldsValue();
    validateFields((err) => {
      if (!err) {
        userInfoValidatePreService({ captchaKey, captcha }).then((res) => {
          if (res) {
            Message.success(
              intl.get(`mallf.userCenter.model.account.passValidateMsg`).d('身份验证通过')
            );
            setFieldsValue({ account: '', captcha: '' });
            setLastCheckKey(res.lastCheckKey);
            setIsBinded(true);
            setNextPostCaptcha(true);
            clearInterval(timer);
          }
        });
      }
    });
  }

  // 换绑新账号发验证码
  function postNewCaptcha() {
    const { account } = getFieldsValue();
    if (account) {
      postNewCaptchaService({ field, account, lastCheckKey })
        .then((res) => {
          if (res) {
            Swal(res.message);
            setCaptchaKey(res.captchaKey);
            setNextPostCaptcha(false);
          }
        })
        .finally(() => {
          validateNextCaptcha();
        });
    }
  }

  // 新账号绑定校验
  function validateNewCaptcha() {
    const { captcha, account } = getFieldsValue();
    const params = {
      field,
      account,
      captcha,
      captchaKey,
      lastCheckKey,
    };
    validateFields((err) => {
      if (!err) {
        validateNewCaptchaService(params).then((res) => {
          if (res) {
            fetchUserInfo();
            Message.success(intl.get(`mallf.userCenter.model.account.passBindMsg`).d(`绑定成功`));
          }
          handleToggle();
        });
      }
    });
  }

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
      setSeconds(i);
    }, 1000);
  }
  return (
    <div className={style['account-wrapper']}>
      <li>
        <div className="list-container">
          <div className="list-info">
            <div className="list-img">
              <span className={`icon icon-${field}`}>&nbsp;</span>
            </div>
            <div className="list-p">
              <p>
                {field === 'phone'
                  ? intl.get(`mallf.userCenter.model.account.bindPhone`).d('绑定手机')
                  : intl.get(`mallf.userCenter.model.account.bindEmail`).d('绑定邮箱')}
              </p>
            </div>
            {checkFlag === 1 ? (
              <div className="list-displayText">
                {field === 'phone'
                  ? intl.get(`mallf.userCenter.model.account.bindedPhone`).d('已绑定手机')
                  : intl.get(`mallf.userCenter.model.account.bindedEmail`).d('已绑定邮箱')}
              </div>
            ) : (
              <div className="list-displayText">
                {field === 'phone'
                  ? intl
                      .get(`mallf.userCenter.model.account.phoneNotBound`)
                      .d('暂未绑定，可添加手机绑定')
                  : intl
                      .get(`mallf.userCenter.model.account.mailboxNotBound`)
                      .d('暂未绑定，可添加邮箱绑定')}
              </div>
            )}
          </div>
          <div className="list-button">
            {visible ? (
              <Button ghost type="primary" onClick={handleToggle}>
                {intl.get('mallf.userCenter.button.pickUp').d('收起')}
              </Button>
            ) : checkFlag === 1 ? (
              <Button ghost type="primary" onClick={handleToggle}>
                {field === 'phone'
                  ? intl.get(`mallf.userCenter.model.account.updatePhone`).d('更换手机')
                  : intl.get(`mallf.userCenter.model.account.updateEmail`).d('更换邮箱')}
              </Button>
            ) : (
              <Button ghost type="primary" onClick={handleToggle}>
                {field === 'phone'
                  ? intl.get(`mallf.userCenter.model.account.bindPhone`).d('绑定手机')
                  : intl.get(`mallf.userCenter.model.account.bindEmail`).d('绑定邮箱')}
              </Button>
            )}
          </div>
        </div>
      </li>
      {visible ? (
        <div className="list-contianer-detail">
          <Form style={{ width: '100%' }}>
            {emailValitePassword && (
              <>
                <FormItem
                  required
                  key="originalPassword"
                  label={intl.get(`mallf.userCenter.model.account.currentPwd`).d('当前密码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('originalPassword', {
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`mallf.userCenter.model.account.oldPwdNullMsg`)
                          .d('当前密码不能为空'),
                      },
                    ],
                  })(
                    <Input
                      type="password"
                      placeholder={intl
                        .get(`mallf.userCenter.model.account.oldPwdPlaceholder`)
                        .d('请输入当前密码')}
                    />
                  )}
                </FormItem>
                <Row>
                  <Col offset={7}>
                    <Button
                      style={{
                        marginRight: '10px',
                        width: '72px',
                        height: '28px',
                        marginBottom: '30px',
                      }}
                      onClick={handleToggle}
                    >
                      {intl.get(`mallf.userCenter.model.account.cancel`).d('取消')}
                    </Button>
                    <Button
                      type="primary"
                      style={{ width: '72px', height: '28px', marginBottom: '30px' }}
                      onClick={() => {
                        emailValidatePassword(getFieldValue('originalPassword')).then((res) => {
                          setLastCheckKey(res.lastCheckKey);
                          setEmailValitePassword(false);
                        });
                      }}
                      disabled={!getFieldValue('originalPassword')}
                    >
                      {intl.get(`mallf.userCenter.model.account.confirm`).d('确定')}
                    </Button>
                  </Col>
                </Row>
              </>
            )}
            {!emailValitePassword && (
              <>
                <FormItem
                  label={
                    field === 'phone'
                      ? intl.get(`mallf.userCenter.model.account.phoneNumber`).d('手机号')
                      : intl.get(`mallf.userCenter.model.account.emailAddress`).d('电子邮箱')
                  }
                  required
                  {...formItemLayout}
                >
                  {getFieldDecorator('account', {
                    initialValue: defaultValue,
                    validateTrigger: 'onBlur',
                    validateFirst: true,
                    rules: [
                      {
                        required: true,
                        message:
                          field === 'phone'
                            ? intl
                                .get(`mallf.userCenter.model.account.phoneNullMsg`)
                                .d('手机号不能为空')
                            : intl
                                .get(`mallf.userCenter.model.account.emailNullMsg`)
                                .d('电子邮箱不能为空'),
                      },
                      {
                        pattern: rulePattern,
                        message:
                          field === 'phone'
                            ? intl
                                .get(`mallf.userCenter.model.account.phoneErrMsg`)
                                .d('手机号格式不正确')
                            : intl
                                .get(`mallf.userCenter.model.account.emailErrMsg`)
                                .d('电子邮箱格式不正确'),
                      },
                    ],
                  })(
                    <Input
                      disabled={!isBinded && !lastCheckKey}
                      placeholder={
                        field === 'phone'
                          ? intl
                              .get(`mallf.userCenter.model.account.phonePlaceholder`)
                              .d('请输入手机号')
                          : intl
                              .get(`mallf.userCenter.model.account.emailPlaceholder`)
                              .d('请输入电子邮箱')
                      }
                    />
                  )}
                </FormItem>
                <FormItem
                  required
                  label={intl.get(`mallf.userCenter.model.account.code`).d('验证码')}
                  {...formItemLayout}
                >
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
                    <div className="phone-capcha">
                      <Input
                        placeholder={intl
                          .get(`mallf.userCenter.model.account.codePlaceholder`)
                          .d('请输入验证码')}
                        value={getFieldsValue().captcha}
                      />
                      <Button
                        disabled={!nextPostCaptcha || (!defaultValue && !lastCheckKey)}
                        onClick={!isBinded ? postCaptcha : postNewCaptcha}
                        style={nextPostCaptcha ? {} : { backgroundColor: '#f5f5f5', color: '#999' }}
                      >
                        {nextPostCaptcha
                          ? intl.get(`mallf.userCenter.model.account.sendCode`).d('发送验证码')
                          : intl
                              .get(`mallf.userCenter.model.account.codeTime`, {
                                value: seconds,
                              })
                              .d(`${seconds}秒`)}
                      </Button>
                    </div>
                  )}
                </FormItem>
                <Row>
                  <Col offset={7}>
                    <Button
                      style={{
                        marginRight: '10px',
                        width: '72px',
                        height: '28px',
                        marginBottom: '30px',
                      }}
                      onClick={handleToggle}
                    >
                      {intl.get(`mallf.userCenter.model.account.cancel`).d('取消')}
                    </Button>
                    {!isBinded ? (
                      <Button
                        type="primary"
                        style={{ width: '72px', height: '28px', marginBottom: '30px' }}
                        onClick={checkFlag === 1 ? userInfoValidatePre : userInfoValidate}
                        disabled={captchaKey === ''}
                      >
                        {intl.get(`mallf.userCenter.model.account.confirm`).d('确定')}
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ width: '72px', height: '28px', marginBottom: '30px' }}
                        onClick={validateNewCaptcha}
                        disabled={captchaKey === ''}
                      >
                        {intl.get(`mallf.userCenter.model.account.confirm`).d('确定')}
                      </Button>
                    )}
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(AccountForm);
