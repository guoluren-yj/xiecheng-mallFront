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

// 再来一单
export function fetchOrderAgain(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/member/buy-again`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
