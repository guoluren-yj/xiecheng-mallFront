import { getUserConfigInfo } from 'utils/utils';
import { getUserCustomDimension } from 'utils/configUtils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import qs from 'qs';

/**
 * 查询收藏商品列表
 * @param {Object} params - 查询条件
 */
export function fetchMyFavoriteList(params) {
  const { page, size, ...others } = params;
  const customDimensionMap = getUserCustomDimension();
  const { organizationId, companyId, mallType } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.serviceName
  }/v1/${organizationId}/product-favorites/list?${qs.stringify({ page, size })}`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify({
      ...others,
      companyId: mallType === 'sigl' ? null : companyId,
      channel: mallType === 'sigl' ? 'PERSONAL' : undefined,
      customDimensionMap,
    }),
  });
}

export function clearProduct(params) {
  const { organizationId, companyId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites/expired-product`;
  return request(queryUrl, {
    method: 'DELETE',
    query: { ...params, companyId },
  });
}

/**
 * 移除收藏
 * @param {Object} params - 移除商品
 */
export function deleteFavorite(params) {
  const { organizationId, channel } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites`; // url
  return request(queryUrl, {
    method: 'DELETE',
    body: JSON.stringify({ ...params, channel }),
  });
}

/**
 * 移除收藏
 * @param {Object} params - 移除商品
 */
export function batchDelete(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites/batch/delete`; // url
  return request(queryUrl, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

/**
 * 查询我的评价
 * @param {Object} params - 查询条件
 */
export function fetchAllComments(params) {
  const { organizationId } = getUserConfigInfo();
  const { isOMS, ...others } = params;
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/assessments/hide-supplier/assessment-list`;
  return request(queryUrl, {
    method: 'GET',
    query: others,
  });
}

/**
 * 查询单条评价详情
 * @param {Object} params -查询条件
 */
export function fetchSingleComment(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-assessments/query-one-assessment`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询商品评价
 * @param {Object} params -查询条件
 */
export function fetchProductComment(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-assessments/query-order-assessment`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}
