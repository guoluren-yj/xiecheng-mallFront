/**
 * 甄选专区接口
 */
import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo } from 'utils/utils';

// 专区供应商列表
export function fetchZoneSupplierListService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.SMALL_MARKET}/v1/${organizationId}/pick-suppliers/my-pick-supplier`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// 专区供应商商品列表
export function fetchZoneProductListService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.SMALL_MARKET}/v1/${organizationId}/skus/query-sku-by-supplier`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 商品列表
export function fetchZoneListService(params) {
  const { organizationId } = getUserConfigInfo();
  const { page, size, ...other } = params;
  const queryUrl = `/${HmallConfig.searchService}/v1/${organizationId}/platform-scroll`;
  return request(queryUrl, {
    method: 'POST',
    query: { page, size },
    body: JSON.stringify(other),
  });
}

// 商品列表
export function fetchZoneDeatilService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.SMALL_MARKET}/v1/${organizationId}/skus/${params.skuId}`;
  return request(queryUrl, {
    method: 'GET',
  });
}

// 加入心愿单
export function fetchAddWishService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.SMALL_MARKET}/v1/${organizationId}/wish-orders`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
