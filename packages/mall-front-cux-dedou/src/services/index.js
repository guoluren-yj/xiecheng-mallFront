import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 获取得豆payurl
export function fetchPayUrl(body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/sd/${organizationId}/pay-url`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
