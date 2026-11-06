import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchEmployeeNum() {
  const { organizationId, userId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/employees?userId=${userId}`
  );
}

export function fetchUnit(employeeId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/hpfm/v1/${organizationId}/employee-assigns?customizeUnitCode=SPFM.EMPLOYEE_DETAIL.POSTION_LIST&employeeId=${employeeId}&tenantId=${organizationId}`
  );
}
