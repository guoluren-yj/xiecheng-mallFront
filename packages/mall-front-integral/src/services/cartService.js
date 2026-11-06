import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 购物车查询列表
export function fetchProductService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/list`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 购物车数量查询
export function getCartCountService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/count`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 删除购物车
export function deleteCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 下一步
export function preReqOrderService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/pre-req`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 地址查询
export function getAddressList(params) {
  const { organizationId, userId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/address/${userId}`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 更新地址
export function updateAddressService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/update-address`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 地址查询
export function getMemberDeductionService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/deduction`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 列表页加购
export function addToCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/list-page-create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 查询lov
export function getLovList(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/batch/data`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
