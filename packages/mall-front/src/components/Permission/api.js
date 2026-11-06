import request from 'utils/request';

import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';

const { HZERO_IAM } = getEnvConfig();

/**
 * 检验权限
 * @param {array} params.code - 权限编码
 */
export async function checkPermission(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
