import { filterNullGetUrl, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchWishListApi(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.wishService}/v1/${organizationId}/wish-orders/index-details`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

export function deleteWishOrderApi(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.wishService}/v1/${organizationId}/wish-orders`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}
