import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchNewAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member-address/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function submitAddressService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member-address`;
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
