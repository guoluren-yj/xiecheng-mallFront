import { getUserConfigInfo, getOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import qs from 'qs';

export function fetchOrderCentent(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// oms list
export function fetchOmsOrderCentent(params) {
  const { mallOrderStatusList, ...other } = params;
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.omsServiceName
  }/v1/${organizationId}/orders?${qs.stringify({ mallOrderStatusList }, { arrayFormat: 'comma' })}`;
  return request(queryUrl, {
    method: 'GET',
    query: other,
  });
}

export function fetchOrderStatusCount() {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}/count`;
  return request(queryUrl, {
    method: 'GET',
  });
}

// oms count
export function fetchOmsOrderStatusCount() {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/page-count`;
  return request(queryUrl, {
    method: 'GET',
  });
}

// 获取订单列表
export function fetchOrderList(query) {
  const { organizationId, purchaseType } = getUserConfigInfo();
  if (query.displayStatus === 'FINISH') {
    // eslint-disable-next-line no-param-reassign
    query.evaluateFlag = 1;
  }
  const queryUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.serviceName
  }/v1/${organizationId}/order-center?purchaseType=${purchaseType && purchaseType.toUpperCase()}`; // url
  return request(queryUrl, {
    method: 'GET',
    query,
  });
}

export function fetchCanReceive(query) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/asn-receive-status`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(query),
  });
}

// 确认收货
export function fetchConfirm(params) {
  const { organizationId } = getUserConfigInfo();
  const { ecPoSubNum, ecPlatformCode } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-order/confirm/${ecPoSubNum}?ecPlatformCode=${ecPlatformCode}`;
  return request(url, {
    method: 'POST',
  });
}

// // 再来一单
// export function fetchOrderAgain(orders) {
//   const { organizationId } = getUserConfigInfo();
//   const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-lines/${organizationId}/buy-again`;
//   return request(queryUrl, {
//     method: 'POST',
//     body: JSON.stringify(orders),
//   });
// }
// 再来一单
export function fetchOrderAgain(orders) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-lines/${organizationId}/order/buy-again`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(orders),
  });
}

// 已读未读接口
export function fetchRead(param) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/sub/read/${param}`;
  return request(url, {
    method: 'POST',
  });
}

export function fetchCount(param) {
  const { organizationId, purchaseType } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.serviceName
  }/v1/${organizationId}/order-center/unread/count?purchaseType=${
    purchaseType && purchaseType.toUpperCase()
  }`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

// 物流查询
export function fetchECTrackService(param) {
  const { poSubNum, ecPlatformCode, poSubHeaderId } = param;
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/track`; // url
  return request(queryUrl, {
    query: { tenantId: organizationId, poSubNum, ecPlatformCode, poSubHeaderId },
    swal: false,
  });
}

// oms-物流查询
export function fetchOMSTrackService(param) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/consignment-entrys/mall-track`; // url
  return request(queryUrl, { method: 'POST', body: JSON.stringify(param), swal: false });
}

// 目录化物流查询
export function fetchCATATrackService(param) {
  const { poSubHeaderId } = param;
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/cata-track`; // url
  return request(queryUrl, { query: { tenantId: organizationId, poSubHeaderId } });
}

// 关联单据
export function fetchAssociated({ poLineId, poHeaderId }) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}/associate-order/${poLineId}`; // url
  return request(queryUrl, { query: { poHeaderId } });
}

// oms-关联单据
export function fetchomsAssociated(query) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/consignment-entrys/associated-doc`; // url
  return request(queryUrl, { query });
}

// 关联单据
export function toPayServise(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/payments/payment-create`; // url
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 供应商留言
export function fetchLeaveWordService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}/po-messages`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// OMS供应商留言
export function fetchOMSLeaveWordService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/po-messages-list`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// 供应商留言发送
export function sendLeaveWordService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}/po-messages`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// OMS供应商留言发送
export function sendOMSLeaveWordService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/po-messages-create`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms取消订单
export function cancelOrderService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/mall-preempt-cancel`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms申请退款
export function applyRefundService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/refunds/refund-request`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms物流基础信息
export function fetchBaseInfoService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/consignment-entrys/mall-header`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// oms售后物流
export function fetchOMSSaleTrackService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/track`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
    swal: false,
  });
}

// 修改订单查询
export function fetchAgainOrderService(orderCode) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/omsOrder/${orderCode}`;
  return request(queryUrl, {
    method: 'GET',
    swal: false,
  });
}

// 修改订单
export function againOrderCheckService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/omsOrder/check`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 修改订单提交
export function againOrderSubmitService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/omsOrder/resubmit`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 列表页重新提交
export function orderSubmitService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/order-change-submit`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 订单行删除
export function orderLineDeleteService(params) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/order-change-delete`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 查询领用商品打印预览数据
export function orderReceivePrint(query) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/receive-print`;
  return request(queryUrl, {
    query,
  });
}

// 打印
export function orderToPrint(body) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/receive-order-print`;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    dataType: 'blob',
  });
}

export function fetchOrderOtherInfo({ idString }) {
  const { organizationId, mallType } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/extra-info`,
    {
      method: 'GET',
      query: {
        orderIds: idString,
        channel: mallType === 'sigl' ? 'PERSONAL' : undefined,
      },
    }
  );
}

// 获取在线客服链接
export function getEcServiceLink(params) {
  return request(`/smodr/v1/${getCurrentOrganizationId()}/order-entrys/artificial-service-link`, {
    method: 'GET',
    query: params,
  });
}
// 获取卡密接口
export function getCardPasswordService(body) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/consignment-entrys/card/pin/reissue `;
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// 发起扣款
export function repayOrderService(params) {
  const organizationId = getOrganizationId();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/order-payment`,
    {
      method: 'POST',
      body: JSON.stringify(params),
      interceptSuccess: true, // 对于success报错响应拦截
    }
  );
}

// 订单审批记录
export async function fetchApproveRecord(params) {
  const organizationId = getOrganizationId();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/order-approve-history`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export async function fetchDocPermissionApi() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/cnf-actions/SITE.SPFM.RELATION_DOC_CONTROL/invoke_with_parameter`,
    {
      method: 'GET',
      query: {
        businessModule: 'MALL_PO',
      },
    }
  );
}

// 判断是否有撤销按钮
export async function fetchOperationFlagService(params) {
  const organizationId = getOrganizationId();
  return request(`/hwfp/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 撤销工作流审批
export function revokeApproveService(params) {
  return request(`/hwfp/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${params}`, {
    method: 'GET',
    dataType: 'text',
  });
}
