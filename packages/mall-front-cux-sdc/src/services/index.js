import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 查询常用组人员信息
export function fetchComGroupInfoService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`${HmallConfig.apiGateway}/scux/v1/${organizationId}/sdc-business-cards`, {
    method: 'GET',
    query: params,
  });
}

// 查询组织架构人员信息
export function fetchOrgStructureService(params) {
  const { organizationId } = getUserConfigInfo();
  const { userId, ...others } = params;
  return request(
    `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/hr/employees/user/${userId}/for-smal`,
    {
      method: 'GET',
      query: others,
    }
  );
}

// 名片信息
export function fetchCardInfo(userId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/hr/employees/user/${userId}`,
    {
      method: 'GET',
    }
  );
}
