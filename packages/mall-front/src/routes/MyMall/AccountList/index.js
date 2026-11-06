/**
 * account - 账户设置账户安全
 * @date: 2019-09-16
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import { compose } from 'lodash';
import { Button } from 'choerodon-ui';
import { Message } from 'choerodon-ui/pro';

import Loading from 'components/loading';
import { PASSWORD, PHONE, EMAIL } from 'utils/regExp';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchUserInfoService, updatePasswordService } from 'services/userInfoService';

import AccountForm from './AccountForm';
import EmailForm from './EmailForm';
import style from './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 8 },
};

function Account(props) {
  const {
    form: { validateFields, getFieldDecorator, getFieldValue },
  } = props;
  const [userInfo, setUserInfo] = useState({});
  const [pwdFlag, setPwdFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  const { phoneCheckFlag, emailCheckFlag, phone, email } = userInfo;
  const formPhoneProps = {
    field: 'phone',
    text: intl.get(`mallf.userCenter.model.account.phone`).d('手机'),
    checkFlag: phoneCheckFlag,
    defaultValue: phone,
    rulePattern: PHONE,
    formItemLayout,
    fetchUserInfo,
  };
  const formEmailProps = {
    field: 'email',
    text: intl.get(`mallf.userCenter.model.account.email`).d('邮箱'),
    checkFlag: emailCheckFlag,
    defaultValue: email,
    rulePattern: EMAIL,
    formItemLayout,
    fetchUserInfo,
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  function fetchUserInfo() {
    setLoading(true);
    fetchUserInfoService().then((res) => {
      setUserInfo(res);
      setLoading(false);
    });
  }

  const actions = useMemo(() => {
    return new Map([
      ['toggleModal', toggleStatus],
      ['confirm', handlePasswordOk],
    ]);
  });

  const onBtnClick = (type) => {
    const action = [...actions].filter(([key]) => key === type);
    action[0][1]();
  };

  function toggleStatus() {
    setPwdFlag(!pwdFlag);
  }

  /**
   * validateNewPasswordNotSame - 验证新密码 不能和 旧密码 相同
   * @param {String} value - 新的密码
   * @param {Function} callback - 校验失败 需要回调错误， 否则空的回调
   * @param {Object} form - 表单
   * @memberof UserInfo
   */
  function validateNewPasswordNotSame(value, callback) {
    if (value && value === getFieldValue('originalPassword')) {
      callback(intl.get(`mallf.userCenter.model.account.pwdMsgA`).d('新密码不能与原密码相同'));
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
    if (value && value !== getFieldValue('password')) {
      callback(intl.get(`mallf.userCenter.model.account.pwdMsgB`).d('确认密码必须与密码相同'));
    } else {
      callback();
    }
  }

  function handlePasswordOk() {
    validateFields((err, fieldsValue) => {
      const { password, originalPassword } = fieldsValue;
      if (!err) {
        userInfoUpdatePassword({ password, originalPassword });
        toggleStatus();
      }
    });
  }

  function userInfoUpdatePassword({ password, originalPassword }) {
    updatePasswordService({ password, originalPassword }).then(
      Message.success(intl.get(`mallf.userCenter.model.account.pwdMsgSuccess`).d('密码修改成功'))
    );
  }

  return (
    <div className={style['account-info']}>
      <h2>{intl.get(`mallf.userCenter.model.account.accountTitle`).d('账户安全')}</h2>
      <div className="account-container">
        {!loading ? (
          <ul>
            <AccountForm {...formPhoneProps} />
            <EmailForm {...formEmailProps} />
            <li>
              <div className="list-container">
                <div className="list-info">
                  <div className="list-img">
                    <span className="icon icon-pwd">&nbsp;</span>
                  </div>
                  <div className="list-p">
                    <p>{intl.get(`mallf.userCenter.model.account.updatePwd`).d('修改密码')}</p>
                  </div>

                  <div className="list-displayText" />
                </div>
                <div className="list-button">
                  {pwdFlag ? (
                    <Button ghost type="primary" onClick={() => onBtnClick('toggleModal')}>
                      {intl.get(`mallf.userCenter.model.account.retract`).d('收起')}
                    </Button>
                  ) : (
                    <Button ghost type="primary" onClick={() => onBtnClick('toggleModal')}>
                      {intl.get(`mallf.userCenter.model.account.updatePwd`).d('修改密码')}
                    </Button>
                  )}
                </div>
              </div>
            </li>
            {pwdFlag ? (
              <div className="list-contianer-detail no-border">
                <Form style={{ width: '100%' }}>
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
                  <FormItem
                    label={intl.get(`mallf.userCenter.model.account.updatePwd`).d('修改密码')}
                    key="password"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('password', {
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get(`mallf.userCenter.model.account.pwdNullMsg`)
                            .d('密码不能为空'),
                        },
                        {
                          pattern: PASSWORD,
                          message: intl
                            .get(`mallf.userCenter.model.account.pwdErrMsg`)
                            .d('至少包含数字/字母/字符2种组合,长度为6-30个字符'),
                        },
                        {
                          validator: (_, value, callback) => {
                            validateNewPasswordNotSame(value, callback);
                          },
                        },
                      ],
                    })(
                      <Input
                        type="password"
                        placeholder={intl
                          .get(`mallf.userCenter.model.account.pwdPlaceholder`)
                          .d('请输入新密码')}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    label={intl.get(`mallf.userCenter.model.account.againSure`).d('再次确认')}
                    {...formItemLayout}
                    key="anotherPassword"
                  >
                    {getFieldDecorator('anotherPassword', {
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get(`mallf.userCenter.model.account.pwdAgainNullMsg`)
                            .d('确认密码不能为空'),
                        },
                        {
                          validator: (_, value, callback) => {
                            validatePasswordAnther(value, callback);
                          },
                        },
                      ],
                    })(
                      <Input
                        type="password"
                        placeholder={intl
                          .get(`mallf.userCenter.model.account.pwdAgainPlaceholder`)
                          .d('请再次输入新密码')}
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
                        onClick={() => onBtnClick('toggleModal')}
                      >
                        {intl.get(`mallf.userCenter.model.account.cancel`).d('取消')}
                      </Button>
                      <Button
                        type="primary"
                        style={{ width: '72px', height: '28px', marginBottom: '30px' }}
                        onClick={() => onBtnClick('confirm')}
                      >
                        {intl.get(`mallf.userCenter.model.account.confirm`).d('确定')}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            ) : (
              ''
            )}
          </ul>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}

export default compose(
  Form.create({ fieldNameProp: null }),
  formatterCollections({ code: ['mallf.userCenter'] })
)(Account);
