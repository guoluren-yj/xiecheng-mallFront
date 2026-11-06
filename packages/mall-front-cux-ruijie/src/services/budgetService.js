import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 保存
export function saveBudgetService(params, batchFlag) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${
      HmallConfig.serviceName
    }/v1/${organizationId}/brandmax-budget-infos${batchFlag ? '' : '/one'}`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function fetchEmployeeNum() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/employees`
  );
}
