import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import { HZERO_IAM, HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, filterNullGetUrl, getCurrentLanguage } from 'utils/utils';

// 查询用户状态
export function fetchUserStatusService(params) {
  const currentOrganizationId = getCurrentOrganizationId();
  const queryUrl = `${HZERO_IAM}/v1/${currentOrganizationId}/user-status`;
  const url = filterNullGetUrl(queryUrl, { ...params, userEnd: 'MALL-PC' });
  return request(url, {
    method: 'GET',
  });
}

// 改变用户的状态
export function changeUserStatusService(params) {
  const currentOrganizationId = getCurrentOrganizationId();
  const queryUrl = `${HZERO_IAM}/v1/${currentOrganizationId}/user-status`;
  const url = filterNullGetUrl(queryUrl, { ...params, userEnd: 'MALL-PC' });
  return request(url, {
    method: 'POST',
  });
}

// 获取问卷调查code
export function getQuestionnaireService() {
  const currentOrganizationId = getCurrentOrganizationId();
  const queryUrl = `/marmot/v1/${currentOrganizationId}/marmot-organization-api/INFORMATION_OPERATION_SURVEY_FETCH`;
  const url = filterNullGetUrl(queryUrl, { userEnd: 'MALL-PC' });
  return request(url, {
    method: 'GET',
  });
}

// 获取隐私描述内容头信息
export function getPrivacyHeadInfoService(params) {
  const currentOrganizationId = getCurrentOrganizationId();
  const currentLang = getCurrentLanguage(); // 获取当前用户的语言信息
  const queryUrl = `${HZERO_PLATFORM}/v1/${currentOrganizationId}/static-texts/text/by-code?lang=${currentLang}&textCode=SRM.IAM.USER.PRIVACY.TERM.HEAD`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

// 获取隐私描述内容信息
export function getPrivacyInfoService(params) {
  const currentOrganizationId = getCurrentOrganizationId();
  const currentLang = getCurrentLanguage(); // 获取当前用户的语言信息
  const queryUrl = `${HZERO_PLATFORM}/v1/${currentOrganizationId}/static-texts/text/by-code?lang=${currentLang}&textCode=SRM.IAM.USER.PRIVACY.TERM`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

// 记录单点登陆
export function setSingleRecordService(params) {
  const organizationId = getCurrentOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/single-login-infos`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
