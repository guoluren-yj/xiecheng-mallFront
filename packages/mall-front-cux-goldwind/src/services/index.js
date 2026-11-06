import request from 'utils/request';
import { getCurrentOrganizationId, removeCookie, getUserConfigInfo } from 'utils/utils';

export function saveConfigInfo(body) {
  const { id } = body;
  const { companyId, unitId, userId } = getUserConfigInfo();
  if (unitId !== body.unitId || companyId !== body.companyId) {
    removeCookie(`${unitId}${userId}AddressInfo`);
  }
  return request(
    `/spfm/v1/${getCurrentOrganizationId()}/rel-table-records/scux_srm_goldwind_smal_unit_info_goldwind`,
    {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    }
  );
}

export function getConfigInfo(body) {
  return request(
    `/spfm/v1/${getCurrentOrganizationId()}/rel-table-records/scux_srm_goldwind_smal_unit_info_goldwind/list`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

export function getAveragePrice(params) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/gamGGm2duLuic9oqOc1UQQc3vjNE0IZ8pk89285ePliaUib3xrjicI7C7hCEfJOMYdWX`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export function getEcServiceLink(params) {
  return request(`/smodr/v1/${getCurrentOrganizationId()}/order-entrys/artificial-service-link`, {
    method: 'GET',
    query: params,
  });
}
