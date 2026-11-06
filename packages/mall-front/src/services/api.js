/**
 * api.js 通用services请求
 * @date 2019/08/28
 * @author peng.yang05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */
import qs from 'qs';
import HmallConfig from 'utils/api-config';
import {
  ACCESS_TOKEN,
  getAccessToken,
  getUserConfigInfo,
  // toLogin,
  logoutRemoveData,
  getOrganizationId,
  getHeader,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import request from 'utils/request';
import { getAllCacheRegionId } from 'utils/getCacheAddress';
/**
 * 获取用户信息
 */
export function fetchUserInfo() {
  if (getAccessToken()) {
    return request(`${HmallConfig.apiGateway}/iam/hzero/v1/users/self`);
  }
}

export function fetchSelf() {
  return fetch(`${HmallConfig.apiGateway}/iam/hzero/v1/users/self`, {
    headers: getHeader(),
  });
}

/*
 *  登陆请求
 */
export function accessIsLogin() {
  if (!getAccessToken()) {
    return request(`${HmallConfig.apiGateway}/iam/hzero/v1/users/self`);
  }
}

/**
 * 退出登录
 */
export function logout() {
  const accessToken = getAccessToken();
  const {
    webConfig: { isSecondWebSite, srmUrl },
  } = getUserConfigInfo();
  const logoutUrl = `${isSecondWebSite ? srmUrl : HmallConfig.oauthPath}/oauth/logout?${
    accessToken ? `${ACCESS_TOKEN}=${accessToken}` : ''
  }`;
  logoutRemoveData();
  window.location = logoutUrl;
  // toLogin();
}

/**
 * 选买配置
 */
export function fetchUserConfigs(tenantId, userId) {
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${tenantId}/user-configs/${userId}`,
    {
      swal: false,
    }
  );
}

/**
 * 切换默认语言
 */
export function checkoutLanguage(language) {
  let url = '';
  const { userId } = getUserConfigInfo();
  url = userId
    ? `${HmallConfig.apiGateway}/iam/hzero/v1/users/default-language?language=${language}`
    : `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/users/default-language?language=${language}`;
  return request(url, {
    method: 'PUT',
  });
}

/**
 * 请求多语言
 */
export function promptData(language, promptKey, id) {
  const url = `${
    HmallConfig.apiGateway
  }/hpfm/v1/${getOrganizationId()}/prompt/${language}?promptKey=${promptKey}`;
  return request(url, {
    method: 'GET',
    headers: id ? { 'h-menu-id': id } : {},
  });
  // `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId ||
  //       visitSelfData.tenantId}/prompt/${language}?promptKey=${promptKey}`
}

/**
 * 请求多语言的种类
 */
export function languageTypes() {
  let url = '';
  const { userId } = getUserConfigInfo();
  url = userId
    ? `${HmallConfig.apiGateway}/hpfm/v1/lovs/data?lovCode=HPFM.LANGUAGE`
    : `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/prompt/lov/data?lovCode=HPFM.LANGUAGE`;
  return request(url);
}

/**
 * uuid查询图片
 */
export function searchUuidImage(attachmentUuid, bucketName = 'public-bucket') {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/${attachmentUuid}/file?attachmentUuid=${attachmentUuid}&bucketName=${bucketName}`;
  return request(url);
}

/**
 * 删除uuid图片
 */
export function deleteUuidImage(item, attachmentUuid, bucketName = 'public-bucket') {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/delete-by-uuidurl?attachmentUUID=${attachmentUuid}&bucketName=${bucketName}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify([item]),
    dataType: 'text',
  });
}

/**
 * 查询门户配置
 */
export function getPortalConfig(tenantCode, callBack = (e) => e) {
  const selfData = JSON.parse(sessionStorage.getItem('selfData'));
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${selfData.organizationId}/page-config-details/mall-config?webUrl=${tenantCode}`;
  // const url = `${HmallConfig.apiGateway}/spfm/v1/portal-assigns-cache?url=shyy.dev.isrm.going-link.com`;
  return request(url, {
    method: 'GET',
    failCallBack: callBack,
  });
}

/**
 * 查询二级域名配置
 */
export function getWebUrlConfig(webUrl, unitId) {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-page-configs/new/mall-config`;
  return request(url, {
    method: 'GET',
    query: {
      webUrl,
      unitId,
    },
  });
}

/**
 * 查询登录下的二级域名配置
 */
export function getOuathWebUrlConfig(webUrl, companyId) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/page-config-details/mall-config`;
  return request(url, {
    method: 'GET',
    query: {
      webUrl,
      companyId,
    },
  });
}

/**
 * 查询二级域名的浏览配置
 */
export function getVisitConfig(tenantCode) {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-page-configs/visit-config?webUrl=${tenantCode}`;
  return request(url, {
    method: 'GET',
  });
}

// 批量获取值集
export function batchGetCodes(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value/batch`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取值集
export function getCodes(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取混合部署的租户
export function getMixTenant(tenantId) {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mix-deployments/query`;
  return request(url, {
    method: 'GET',
    query: {
      tenantId,
    },
  });
}

/**
 * 下载
 * @export
 * @param {object} params 传递参数
 * @param {string} params.requestUrl 下载文件请求的url
 * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
 */
export function downloadFile(params = {}) {
  const { requestUrl: url, queryParams, method } = params;
  let newUrl =
    !url.startsWith('/api') && !url.startsWith('http') ? `${HmallConfig.apiGateway}${url}` : url;
  const iframeName = `${url}${Math.random()}`;

  // 构建iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('name', iframeName);
  iframe.setAttribute('id', iframeName);
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.display = 'none';

  // 构建form
  const downloadForm = document.createElement('form');
  // form 指向 iframe
  downloadForm.setAttribute('target', iframeName);

  // 设置token
  const tokenInput = document.createElement('input');
  tokenInput.setAttribute('type', 'hidden');
  tokenInput.setAttribute('name', 'access_token');
  tokenInput.setAttribute('value', `${getAccessToken()}`);

  // 处理post请求时token效验
  if (method === 'POST') {
    newUrl = `${newUrl}?access_token=${getAccessToken()}`;
  }

  // 表单添加请求配置
  downloadForm.setAttribute('method', method);
  downloadForm.setAttribute('action', newUrl);
  downloadForm.appendChild(tokenInput);

  // 表单添加查询参数
  if (queryParams && Array.isArray(queryParams)) {
    queryParams.forEach((item) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', item.name);
      input.setAttribute('value', item.value);
      downloadForm.appendChild(input);
    });
  }

  document.body.appendChild(iframe);
  document.body.appendChild(downloadForm);
  downloadForm.submit();

  // setTimeout(() => {
  //   document.body.removeChild(downloadForm);
  //   document.body.removeChild(iframe);
  // }, 2500);
  return true;
}

// 是否勾选个人收货地址配置
export function queryComOrPersonRuleService() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/settings/011023`;
  return request(url, {
    method: 'GET',
  });
}

// 查询配置中心配置
export function querySettings() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/settings`;
  return request(url, {
    method: 'GET',
  });
}

/**
 * 获取可上传文件的类型和大小
 * @param {Number} params.tenantId
 * @param {String} params.bucketName
 */
export async function fetchEnabledFile(params) {
  return request(`/hfle/v1/${getOrganizationId()}/upload-configs/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 上传裁剪好的头像
 * @async
 * @function uploadAvatar
 * @returns {object} fetch Promise
 */
export async function uploadAvatar(params) {
  const formData = new FormData();
  formData.append('bucketName', params.bucketName);
  formData.append('directory', params.directory);
  formData.append('fileName', params.uploadImgName);
  formData.append('file', params.image, params.uploadImgName);
  return request(`/hfle/v1/${getOrganizationId()}/files/multipart`, {
    method: 'POST',
    type: 'FORM',
    processData: false, // 不会将 data 参数序列化字符串
    body: formData,
    dataType: 'text',
  });
}

// 业务规则配置
export function fetchCommonConfig(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/common-config`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取业务规则地址配置
export function fetchAddressConfig(organizationId, companyId) {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/cnf-for-address/${companyId}`;
  return request(url, {
    method: 'GET',
    dataType: 'text',
  });
}

// 查询lov配置
export function fetchLovConfig({ lovCode, tenantId }) {
  const url = `/hpfm/v1/${getOrganizationId()}/lov-view/info`;
  return request(url, {
    method: 'GET',
    query: { viewCode: lovCode, tenantId },
  });
}

// 查询lov配置
export function fetchLovData({ queryUrl, ...other }) {
  const url = queryUrl.replace('{organizationId}', getOrganizationId());
  return request(url, {
    method: 'GET',
    query: other,
  });
}

// 查询导出列
export function fetchExportColunms(url) {
  return request(url, {
    method: 'GET',
    query: { exportType: 'COLUMN' },
  });
}

// 根据编码查询静态文本信息
export function fetchStaticTestByCode(textCode) {
  const { language, organizationId } = getUserConfigInfo();
  return request(`/hpfm/v1/${organizationId}/static-texts/text/by-code`, {
    query: { lang: language, textCode },
  });
}

// 查询是否跳新sprm ui
export function fetchSprmNewFlag() {
  const {
    userInfo: { organizationId, tenantNum },
  } = getUserConfigInfo();
  return request(`/spfm/v1/${organizationId}/rel-table-records/sprm_old_ui_config/list-from-site`, {
    method: 'POST',
    body: JSON.stringify({
      organizationId,
      tenant: tenantNum,
    }),
  });
}

/**
 * 查询TL多语言
 * {HZERO_PLATFORM}/v1/multi-language
 * @export
 * @param {object} params - 查询参数
 * @param {string} params.fieldName - 查询的表单域名称
 * @param {string} params._token - token
 */
export async function queryTL(params) {
  return request(`/hpfm/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 值集 值集视图
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

/**
 * 统一查询独立、SQL、URL类型的值集
 * {HZERO_PLATFORM}/v1/lovs/data
 * @param {String} lovCode - 值集code
 * @param {Object} params - 额外的查询参数
 */
export async function queryUnifyIdpValue(lovCode, params = {}) {
  return request(`/hpfm/v1/${getOrganizationId()}/lovs/data`, {
    query: {
      lovCode,
      ...params,
    },
  });
}

/**
 * 查询单个独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value
 * @param {String} lovCode
 */
export async function queryIdpValue(lovCode) {
  return request(`/hpfm/v1/${getOrganizationId()}/lovs/value`, {
    query: {
      lovCode,
    },
  });
}

/**
 * 批量查询独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value/batch
 * @param {Object} params
 * @example queryMapIdpValue({ level: 'HPFM.LEVEL', dir: 'HPFM.DIRECTION' })
 */
export async function queryMapIdpValue(params) {
  return request(`/hpfm/v1/${getOrganizationId()}/lovs/value/batch`, {
    query: params,
  });
}
/**
 * 查询 LOV 配置.
 * {HZERO_PLATFORM}/v1/lov-view/info
 * @param {Object} params 参数
 */
export async function queryLov(params) {
  return request(`/hpfm/v1/${getOrganizationId()}/lov-view/info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询 LOV 数据.
 * @param {string} url URL
 * @param {Object} params 参数
 */
export async function queryLovData(url, params) {
  return request(url, {
    query: params,
  });
}

/**
 * 查询平台多语言国际化
 * {HZERO_PLATFORM}/v1/{organizationId}/prompt/{language}
 * @param {Number} organizationId
 * @param {String} language
 * @param {String} promptKey - 这里只用到了 hzero.common
 */
export async function queryPromptLocale(organizationId, language, promptKey) {
  return request(`/hpfm/v1/${organizationId}/prompt/${language}?promptKey=${promptKey}`);
}

export function fetchEmployeeNum() {
  const { organizationId, userId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/employees?userId=${userId}`
  );
}

export function fetchUnit(employeeId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/hpfm/v1/${organizationId}/employee-assigns?customizeUnitCode=SPFM.EMPLOYEE_DETAIL.POSTION_LIST&employeeId=${employeeId}&tenantId=${organizationId}`
  );
}

// 查询员工岗位
export function fetchAssigns(employeeId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/hpfm/v1/${organizationId}/employee-assigns?customizeUnitCode=SPFM.EMPLOYEE_DETAIL.POSTION_LIST&employeeId=${employeeId}&tenantId=${organizationId}`
  );
}

// 查询国家列表
export function fetchCountryList() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-regions/${organizationId}/country-list-by-config`
  );
}

// 获取菜单id
export function fetchMeunId() {
  const route = window.location.pathname;

  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/users/menu-code?route=${route}`
  );
}

// 获取积分商城和会员购的权限
export function fetchPermission({ organizationId, userId }) {
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/config`,
    {
      query: {
        userId,
      },
    }
  );
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/{attachmentUUID}/file
 * todo {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileList(params) {
  const tenantId = getCurrentOrganizationId();
  return request(`/hfle/v1/${tenantId}/files/${params.attachmentUUID}/file`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/uuid
 * {HZERO_FILE}/v1/{organizationId}/files/uuid
 * @export
 * @param {object} params 传递参数
 */
export async function queryUUID(params) {
  const tenantId = getCurrentOrganizationId();
  return request(`/hfle/v1/${tenantId}/files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 删除attachmentUUID对应的某一个文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl
 * todo {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string[]} params.urls - 要删除的文件
 */
export async function removeFile(params) {
  const { urls, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  return request(`/hfle/v1/${tenantId}/files/delete-by-uuidurl`, {
    method: 'POST',
    body: JSON.stringify(urls),
    query: filterNullValueObject(otherParams),
  });
}

// 二级域名的个性化配置
export async function getCustWebUrlConfig() {
  const organizationId = getCurrentOrganizationId();
  return request(`/${HmallConfig.serviceName}/v1/${organizationId}/personal-configs `, {
    method: 'GET',
  });
}

/**
 * 接口合并
 */
export async function prepareApi() {
  const organizationId = getCurrentOrganizationId();
  const previewInfo = qs.parse(window.location.search.substr(1));
  const regionId = getAllCacheRegionId();
  const { mallType } = getUserConfigInfo();

  // 增加regionId
  return request(
    `/${HmallConfig.serviceName}/v1/${organizationId}/prepare?${qs.stringify(
      { regionIdList: regionId },
      { arrayFormat: 'repeat' }
    )}`,
    {
      method: 'GET',
      query: {
        webUrl:
          process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'https://new.dev.going-buy.com',
        route: window.location.pathname,
        unitId:
          previewInfo?.currentRole === 'purchase' && previewInfo?.unitId
            ? previewInfo?.unitId
            : null,
        memberFlag: mallType === 'sigl' ? 1 : 0,
      },
    }
  );
}

/**
 * 获取加密公钥
 */
export async function getPublicKey() {
  return request(`${HmallConfig.HZERO_PLATFORM}/v1/tool/pass/public-key`, {
    method: 'GET',
  });
}

// 维度元素显示配置
export function fetchDimensionConfigApi(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `/sagm/v1/${organizationId}/pur-units/dimension-config`;
  return request(url, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 获取租户多语言列表
 */
export async function getTenantLanguages() {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.HZERO_PLATFORM}/v1/${organizationId}/tenant-languages/list`, {
    method: 'GET',
  });
}

/**
 * public路由下查询平台多语言国际化
 * {HZERO_PLATFORM}/v1/{organizationId}/prompt/{language}
 * @param {Number} organizationId
 * @param {String} language
 * @param {String} promptKey - 这里只用到了 hzero.common
 */
export async function queryPublicPromptLocale(language, promptKey) {
  return request(`${HmallConfig.HZERO_PLATFORM}/v1/prompt/${language}?promptKey=${promptKey}`);
}

/**
 * 查询默认国家
 */
export function getGetDefaultCountryId(condition = 'CN') {
  const url = `${HmallConfig.apiGateway}/hpfm/v1/lovs/data?condition=${condition}&lovCode=HPFM.COUNTRY`;
  return request(url);
}
