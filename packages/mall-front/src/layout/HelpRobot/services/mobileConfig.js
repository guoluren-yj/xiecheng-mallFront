/*
获取卡片配置信息
*/
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { omit } from 'lodash';

const SRM_SMBL = '/smbl';

export async function getBindSupplierUrl(params, data) {
  let query = filterNullValueObject(parseParameters(params));
  query = omit(query, ['page', 'size']);
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/card/mappings/get/card`, {
    query,
    method: 'POST',
    body: data,
  });
}
