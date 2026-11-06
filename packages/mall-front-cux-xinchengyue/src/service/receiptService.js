import { getOrganizationId } from 'utils/utils';
import request from 'utils/request';

// 单据提交 / 修改（头行商品、价格和供应商公司信息必传）
export async function fetchReceipt(params) {
  return request(`/smpc/v1/${getOrganizationId()}/same-sku-manages/submit`, {
    method: 'POST',
    body: params,
  });
}

// 单据查询    get     /v1/{organizationId}/same-sku-manages/{skuId}
export async function queryReceipt(params) {
  const { skuId } = params;
  return request(`/smpc/v1/${getOrganizationId()}/same-sku-manages/${skuId}`, {
    method: 'GET',
  });
}

// 单据确认（只有已处理、审批通过、审批拒绝可以确认）
export async function confirmReceipt(params) {
  return request(`/smpc/v1/${getOrganizationId()}/same-sku-manages/confirm`, {
    method: 'POST',
    body: params,
  });
}

// 单据撤回（只有已提交的可以撤回）
export async function withdrawReceipt(params) {
  return request(`/smpc/v1/${getOrganizationId()}/same-sku-manages/withdraw`, {
    method: 'POST',
    body: params,
  });
}

// 智能比价开通查询（返回Boolean，无需查询条件）
export async function isIntelligentComparison() {
  return request(`/smpc/v1/${getOrganizationId()}/same-sku-manages/sku-comparsion-enable`, {
    method: 'GET',
  });
}
