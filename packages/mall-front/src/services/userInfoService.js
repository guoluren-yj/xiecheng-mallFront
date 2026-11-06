import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import { getOrganizationId, filterNullGetUrl } from 'utils/utils';

// 查询用户信息
export function fetchUserInfoService() {
  const organizationId = getOrganizationId();

  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/self/detail`;
  const query = { organizationId };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 上传用户头像
export function uploadAvatarService(params) {
  const { avatar } = params;
  const queryUrl = `${HmallConfig.apiGateway}/iam/hzero/v1/users/avatar?avatar=${avatar}`;
  return request(queryUrl, {
    method: 'PUT',
  });
}

// 修改密码
export function updatePasswordService(params) {
  const queryUrl = `${HmallConfig.apiGateway}/iam/hzero/v1/users/password`;
  const body = JSON.stringify(params);
  return request(queryUrl, {
    method: 'PUT',
    body,
    swal: false,
    message: true,
  });
}

// 发送验证码
export function postCaptchaService(params) {
  const { field, account, lastCheckKey, newNum, businessScope = 'self' } = params;
  let url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/${field}/send-captcha`;
  if (newNum) {
    url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/${field}-new/send-captcha`;
  }
  const query = { [field]: account, lastCheckKey, businessScope };
  return request(url, {
    method: 'GET',
    query,
    swal: false,
    message: true,
  });
}

// 校验验证码
export function userInfoValidateService(params) {
  const { field, captcha, captchaKey } = params;
  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/${field}/authenticate`;
  const query = { captcha, captchaKey, businessScope: 'self' };
  const newUrl = filterNullGetUrl(url, query);
  return request(newUrl, {
    method: 'PUT',
  });
}

// 校验下次
export function userInfoValidatePreService(params) {
  const { captchaKey, captcha } = params;
  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/captcha/pre-validate`;
  const query = { captchaKey, captcha, businessScope: 'self' };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 用于绑定邮箱的密码校验
export function emailValidatePassword(password) {
  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/password/pre-validate`;
  const query = { password, businessScope: 'self' };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 发送新的验证码
export function postNewCaptchaService(params) {
  const { field, account, lastCheckKey } = params;
  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/${field}-new/send-captcha`;
  const query = { [field]: account, lastCheckKey, businessScope: 'self' };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 校验新的验证码
export function validateNewCaptchaService(params) {
  const { field, captcha, account, captchaKey, lastCheckKey } = params;
  const url = `${HmallConfig.apiGateway}/iam/hzero/v1/users/${field}-new/validate-captcha`;
  const query = {
    captcha,
    captchaKey,
    [field]: account,
    lastCheckKey,
    businessScope: 'self',
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 查询密码规则
export async function getPasswordRule() {
  const organizationId = getOrganizationId();
  return request(`${HmallConfig.apiGateway}/iam/v1/${organizationId}/password-policies/query`);
}
