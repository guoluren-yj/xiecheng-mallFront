import { getOrganizationId, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// const HmallConfig = {
//   serviceName: 'smal-25496',
// };

// 获取售后类型
export function canSaleTypeService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/after-sale/type`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取商品信息
export function fetchGoodsInfo(ecPoLineId) {
  const { organizationId, companyId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/order-center/line/${ecPoLineId}?companyId=${companyId}`; // url
  return request(queryUrl);
}

// 获取orderId
export function fetchOrderId(orderCode) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/detail`; // url
  return request(queryUrl, { query: { orderCode } });
}

// 获取商品信息
export function fetchOMSGoodsInfo(query) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/get-product`; // url
  return request(queryUrl, { query });
}

// 获取商品售后属性
export function goodsAttributes(paramas) {
  const organizationId = getOrganizationId();
  const { companyId, jdOrderId, wareIds } = paramas;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.ecServiceName}/v1/${organizationId}/ec-after-sales/get-goods-attributes?companyId=${companyId}&jdOrderId=${jdOrderId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(wareIds),
  });
}

// 订单查询售后列表
export function saleAfterList(paramas) {
  const { organizationId } = getUserConfigInfo();
  const { poLineId, ...other } = paramas;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/${poLineId}`;
  return request(url, {
    method: 'GET',
    query: other,
  });
}

// oms订单查询售后列表
export function omsSaleAfterList(query) {
  const organizationId = getOrganizationId();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/get-sale-record`; // url
  return request(queryUrl, { query });
}

// 确认售后完成
export function fetchSureMessage(afterSaleId) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/confirm/${afterSaleId}`;
  return request(url, {
    method: 'POST',
  });
}

// oms确认售后完成
export function fetchomsSureMessage(body) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/confirm`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// 取消
export function fetchCancelAfterSale(params) {
  const { afterSaleId, ...other } = params;
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/cancel/${afterSaleId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(other),
  });
}

// 取消
export function fetchomsCancelAfterSale(body) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/cancel`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// 获取售后商品信息
export function fetchSaleProgress(params) {
  const organizationId = getOrganizationId();
  const { afterSaleId } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/${afterSaleId}/detail`;
  return request(url, {
    method: 'GET',
  });
}

// oms-获取售后商品信息
export function fetchomsSaleProgress(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/detail`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 提交运单
export function submitWayBill(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sale-waybills`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms提交运单
export function submitomsWayBill(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/way-bill`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
// 查询运单
export function fetchWayBillService(afterSaleWayBillId) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales-wayBills/${afterSaleWayBillId}`;
  return request(url, {
    method: 'GET',
  });
}

// 查询可售数量
export function fetchSaleNum(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/get-after-num`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// oms-查询可售数量
export function fetchOmsSaleNum(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/get-sale-num`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 商品发出
export function sentAfterSaleService(params) {
  const organizationId = getOrganizationId();
  const { afterSaleId } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/update-status/${afterSaleId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 商品发出
export function sentAfterSaleomsService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/updateStatus`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 售后申请提交
export function submitFetch(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// oms-售后申请提交
export function omsSubmitFetch(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
