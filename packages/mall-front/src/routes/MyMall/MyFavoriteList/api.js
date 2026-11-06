import request from 'utils/request';
import { serviceName } from 'utils/api-config';
import { getUserConfigInfo } from 'utils/utils';
import { getUserCustomDimension } from 'utils/configUtils';

// 新建收藏夹
export function fetchCreateGroup(body) {
  const { mallType } = getUserConfigInfo();
  return request(`/${serviceName}/v1/{organizationId}/favorites-categories/batch-create`, {
    method: 'POST',
    body: JSON.stringify(
      body?.map((p) => ({ ...p, channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE' }))
    ),
  });
}

// 新建收藏夹
export function fetchGroupList(body) {
  const { query, ...rest } = body;
  return request(`/${serviceName}/v1/{organizationId}/favorites-categories/list`, {
    method: 'POST',
    query,
    body: JSON.stringify(rest),
  });
}

// 批量移动
export function fetchBatchMove(body) {
  return request(`/${serviceName}/v1/{organizationId}/product-favorites/batch-update`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// 删除收藏夹
export function fetchBatchRemove(body) {
  return request(`/${serviceName}/v1/{organizationId}/favorites-categories/batch-remove`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * 移除收藏
 * @param {Object} params - 移除商品
 */
export function deleteFavorite(params) {
  const { organizationId, channel } = getUserConfigInfo();
  const queryUrl = `/${serviceName}/v1/${organizationId}/product-favorites`; // url
  return request(queryUrl, {
    method: 'DELETE',
    body: JSON.stringify({ ...params, channel }),
  });
}

// 情况失效商品
export function clearInvalideProduct(params) {
  const { organizationId, companyId } = getUserConfigInfo();
  const customDimensionMap = getUserCustomDimension();
  const queryUrl = `/${serviceName}/v1/${organizationId}/product-favorites/expired-product`;
  return request(queryUrl, {
    method: 'DELETE',
    // query: { ...params, companyId },
    body: JSON.stringify({ ...params, companyId, customDimensionMap }),
  });
}

// 查询当前分类商品
export function fetchCurrentGroup(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `/${serviceName}/v1/${organizationId}/favorites-categories/single-select`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function addToSiglCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `/${serviceName}/v1/${organizationId}/member/list-page-create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchMroBudget() {
  const { organizationId, companyId, userId } = this.userInfo;
  const url = `/${serviceName}/v1/${organizationId}/cscro-budget-defaults/get`;
  return request(url, { query: { userId, companyId } });
}
