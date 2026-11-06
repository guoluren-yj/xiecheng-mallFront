import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function getProductDetail(params) {
  const { organizationId, memberId } = getUserConfigInfo();
  const { productId, ...other } = params;
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/product/${productId}`;
  return request(queryUrl, {
    method: 'GET',
    query: { ...other, memberId },
  });
}

export function addCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function buyNowService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/buy-now`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
