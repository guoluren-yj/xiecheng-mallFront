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

// 成本中心
export function getUnitCost(params) {
  return request(`${HmallConfig.apiGateway}/hpfm/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

// 财务/费用科目
export function getSubject(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/smpc/v1/${organizationId}/catalogs/financial-subjects`,
    {
      method: 'GET',
      query: params,
    }
  );
}
