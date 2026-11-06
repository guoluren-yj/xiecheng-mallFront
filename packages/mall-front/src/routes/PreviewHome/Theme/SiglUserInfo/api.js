import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchOmsOrderCentent(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/member-list`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

export function fetchOmsOrderStatusCount() {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/member-page-count`;
  return request(queryUrl, {
    method: 'GET',
  });
}
