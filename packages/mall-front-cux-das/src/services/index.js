import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 批量提交评价
export function addOmsOrderBatchCommentService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/assessments/batch-create-assessment`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
