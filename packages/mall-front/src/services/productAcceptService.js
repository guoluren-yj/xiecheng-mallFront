import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchProductAccept(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/asn-preview`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms 接收列表
export function fetchomsProductAccept(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/consignment-entrys/confirm-consignment`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function receivePreviewConfirm(bodyParams) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/asn-receive`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

// oms接收
export function receiveomsPreviewConfirm(bodyParams) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/mall-receipt`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

export function fetchProductAcceptRecord(query) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/asn-record`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(query),
  });
}

// oms 接收记录
export function fetchomsProductAcceptRecord(query) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/receipt-record`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 接收记录提交
export function fetchAcceptSubmitApi(bodyParams) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/receipt-submit`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

// 接收记录取消
export function fetchCancelReceiveApi(bodyParams) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/cancel`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

export function fetchAcceptApproveRecord(bodyParams) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/receipt-entrys/receipt-approve-history`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}
