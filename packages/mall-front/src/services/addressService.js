import { getOrganizationId, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchProvinceService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-regions/${organizationId}/Subordinate`;
  return request(url, {
    method: 'GET',
    query: { page: -1, ...params },
  });
}

export function fetchCityInfoService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-regions/${organizationId}/Subordinate`;
  return request(url, {
    method: 'GET',
    query: { page: -1, ...params },
  });
}

export function submitAddressService(params) {
  const organizationId = getOrganizationId();
  const { method, ...otherParams } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/receiver`;
  return request(url, {
    method,
    body: JSON.stringify(otherParams),
  });
}

export function submitAddressServiceInteGral(params) {
  const organizationId = getOrganizationId();
  const { method, ...otherParams } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member-address`;
  return request(url, {
    method,
    body: JSON.stringify(otherParams),
  });
}

export function fetchAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default-address`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function queryAddress(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default-address`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function fetchNewAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list-receive`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 收单地址查询
export function fetchAcAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/invoice-list/choose`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 收单地址设置默认
export function setDefaultAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 收单地址修改
export function submitAcAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function deleteAddress(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/delete-personal-address`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// hpfm/v1/1052/lovs/data?lovCode=SAGM.AUTH_AGREEMENT_TYPE
export function fetchCode() {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/data`;
  return request(url, {
    method: 'GET',
    query: { lovCode: 'HPFM.IDD' },
  });
}

// 批量删除
export function batchDeleteAddressApi(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/batch-delete-personal-address`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
