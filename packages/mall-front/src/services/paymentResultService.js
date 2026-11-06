import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchPayInfo(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/payments/payment-result-handle`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
