import request from 'utils/request';
import { getOrganizationId, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';

// 获取组织列表
export function getUnitList(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/user-configs/user`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取电商列表
export function getEcListService() {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/ec-platforms/labels`;
  const {
    userId,
    companyId,
    organizationId: tenantId,
    visitConfig: {
      isSecondWebSite,
      visitorFlag,
      companyId: preCompanyId,
      organizationId: preOrganizationId,
    },
  } = getUserConfigInfo();
  let query = { tenantId: 0 };
  if (userId) {
    query = { companyId, tenantId };
  } else if (isSecondWebSite && visitorFlag && preCompanyId) {
    query = { companyId: preCompanyId, tenantId: preOrganizationId };
  }
  return request(url, {
    method: 'GET',
    query,
  });
}

// check in
export function checkIn(params) {
  const { userId, companyId, organizationId, companyName } = getUserConfigInfo();
  const param = { ...params, tenantId: organizationId, companyId, userId, companyName };
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/punchout/check-in`,
    {
      method: 'POST',
      dataType: 'text',
      body: JSON.stringify(param),
    }
  );
}

// 获取购物车数量
export function getCartCountService() {
  const {
    userId: ownerId,
    companyId,
    organizationId,
    purchaseType,
    isNewCart,
  } = getUserConfigInfo();
  const url = isNewCart
    ? `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/count`
    : `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/count`;
  return request(url, {
    method: 'GET',
    query: isNewCart ? { ownerId } : { companyId, purchaseType, ownerId },
  });
}

// 获取菜单类别
export function fetchCategoriesService() {
  const {
    companyId,
    organizationId,
    userId,
    visitConfig: {
      isSecondWebSite,
      companyId: preCompanyId,
      visitorFlag,
      organizationId: preOrganizationId,
    },
  } = getUserConfigInfo();
  const publicUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/platform-catalogs/store-list`;
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/com-catalog/storeList`;
  let url = publicUrl;
  let query = {};
  if (userId) {
    url = authUrl;
    query = { companyId };
  } else if (isSecondWebSite && visitorFlag && preCompanyId) {
    url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${preOrganizationId}/com-catalog/visit-storeList`;
    query = { companyId: preCompanyId };
  }
  return request(url, {
    method: 'GET',
    query,
  });
}

// 获取菜单类别
export function fetchNewCategoriesService(params) {
  const {
    companyId,
    organizationId,
    userId,
    visitConfig: {
      isSecondWebSite,
      companyId: preCompanyId,
      visitorFlag,
      organizationId: preOrganizationId,
    },
  } = getUserConfigInfo();
  const publicUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/platform-catalogs/store-list`;
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/catalog-layouts/get-catalog-array`;
  let url = publicUrl;
  let query = {};
  if (userId) {
    url = authUrl;
    query = { companyId };
  } else if (isSecondWebSite && visitorFlag && preCompanyId) {
    url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${preOrganizationId}/com-catalog/visit-get-catalog-array`;
    query = { companyId: preCompanyId };
  }
  return request(url, {
    method: 'GET',
    query: {
      ...query,
      ...params,
    },
  });
}

// 获取购物车数据
export function fetchCartService() {
  const {
    userId: ownerId,
    companyId,
    organizationId,
    purchaseType,
    levelPath,
  } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  return request(url, {
    method: 'GET',
    query: { companyId, ownerId, time_db: new Date().getTime(), purchaseType, levelPath },
  });
}

// 获取用户配置
export function fetchUserConfigService() {
  const { userId, organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/user-configs/${userId}`
  );
}

// 保存新的用户配置
export function saveUserConfigService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/user-configs`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 搜索热词
export function fetchHotWord(params) {
  const { organizationId, channel } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/sads/v1/${organizationId}/hot-keyword`, {
    method: 'POST',
    body: JSON.stringify({ ...params, tenantId: getOrganizationId(), channel }),
  });
}

// 搜索联想词
export function fetchSuggestWord(params) {
  const { organizationId, channel } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/sads/v1/${organizationId}/suggest`, {
    method: 'POST',
    body: JSON.stringify({ ...params, channel }),
  });
}

/**
 * 查询全部的站内消息
 * {HZERO_MSG}/v1/{organizationId}/messages/user
 * @export
 * @param {object} params
 */
export async function queryNotices(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询全部的站内消息
 * {HZERO_MSG}/v1/{organizationId}/messages/user/preview
 * @export
 * @param {object} params
 */
export async function queryNoticesPreview(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user/preview`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询消息明细
 * {HZERO_MSG}/v1/{organizationId}/messages/user/${userMessageId}
 * @export
 * @param {object} params
 */
export async function queryNoticesDetail(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user/${params.userMessageId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询站内消息条数
 * {HZERO_MSG}/v1/{organizationId}/messages/user/count
 * @export
 */
export async function queryCount() {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user/count`, {
    method: 'GET',
  });
}

/**
 * 已读全部消息
 * {HZERO_MSG}/v1/${organizationId}/messages/user/read-flag
 * @export
 */
export async function allRead(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user/read-flag`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 删除全部消息
 * {HZERO_MSG}/v1/${organizationId}/messages/user/clear
 * @export
 */
export async function deleteAll() {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user/clear`, {
    method: 'GET',
  });
}

/**
 * 删除全部消息
 * {HZERO_MSG}/v1/${organizationId}/messages/user/clear
 * @export
 */
export async function deleteNoticeItem(param) {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/hmsg/v1/${organizationId}/messages/user`, {
    method: 'DELETE',
    query: param,
  });
}

// 专区list查询
export async function fetchZhuanqu(query) {
  const { organizationId } = getUserConfigInfo();
  const url = `/${HmallConfig.serviceName}/v1/${organizationId}/special-blocks/list`;
  return request(url, {
    method: 'GET',
    query,
  });
}
