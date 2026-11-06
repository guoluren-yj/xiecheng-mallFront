import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 查询写字楼/部门
export function fetchDeptStoreService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos/cost-allocation-shop`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export function saveCostService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function updateCartService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos/update-quantity`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function batchCreateCostService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos/batch-create`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 费用项目值集
export function getCostAllocationProject(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos/cost-allocation-project-lov`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 费用项目子分类值集
export function getCostAllocationSubCate(params) {
  return request(`${HmallConfig.apiGateway}/scux/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

// 店铺带出仓转店地址
export function getCostAllocationWare(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos/cost-warehouse-lov`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 查询地址
export function fetchAddress(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/check-address`,
    {
      method: 'GET',
      query: params,
    }
  );
}
