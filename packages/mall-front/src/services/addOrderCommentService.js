import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function addOrderCommentService(params, waitAssessFlag) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.serviceName
  }/v1/${organizationId}/product-assessments/${
    waitAssessFlag === 1 ? 'new-assessment' : 'append-assessment'
  }`; // url
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function getProductInfoService(params) {
  const { organizationId } = getUserConfigInfo();

  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-assessments/query-not-assessment`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function getOmsProductInfoService(params, query) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/assessments/hide-supplier/assessment-info`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query,
  });
}

export function addOmsOrderCommentService(params, assessmentFlag, query) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.productService
  }/v1/${organizationId}/assessments/${
    assessmentFlag === 1 ? 'create-assessment' : 'append-assessment'
  }`; // url
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query,
  });
}
