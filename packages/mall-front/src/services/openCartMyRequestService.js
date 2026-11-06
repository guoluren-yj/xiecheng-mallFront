import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { NEWCART_SERVICE_PRAMS_CODE } from 'utils/customizeCode';

// 申请列表查询
export function fetchMyRequestListService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/mall-list`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// 申请列表数量查询
export function fetchMyRequestCountService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/mall-status-count`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// 详细头
export function fetchDetailHeaderService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/mall-detail`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// 详细行
export function fetchDetailLineService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-request-entrys/mall-list`;
  return request(queryUrl, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'MALL.APPLY.OPENCART.DETAIL.HEADER,MALL.APPLY.OPENCART.DETAIL.LINE',
    },
  });
}

// 重新编辑保存
export function resaveRequest(params, customizeUnitCode) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/save`;
  return request(queryUrl, {
    method: 'POST',
    query: { customizeUnitCode },
    body: JSON.stringify(params),
  });
}

// 重新编辑提交
export function resubmitRequest(params, customizeUnitCode) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/renew`;
  return request(queryUrl, {
    method: 'POST',
    query: { customizeUnitCode },
    body: JSON.stringify(params),
  });
}

// 重新编辑行删除
export function deleteRequestLine(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-request-entrys/delete`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 整单取消申请
export function cancelRequestService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/cancel`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 行取消申请
export function cancelRequestLineService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-request-entrys/cancel`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 整单撤回申请
export function withdrawRequestService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/submit-withdraw`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 再来一单
export function buyAgainService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/buy-again`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode: NEWCART_SERVICE_PRAMS_CODE,
    },
  });
}

// 审批记录查询
export function fetchApprovalRecord(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/approval-progress`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchRequestBudgetApi(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/mall-request-budget-validate`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
