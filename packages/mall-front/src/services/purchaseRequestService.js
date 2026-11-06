import { getOrganizationId, getUserConfigInfo } from 'utils/utils';
import HmallConfig, { omsServiceName } from 'utils/api-config';
import request from 'utils/request';
import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';

export async function fetchAutoGetCompany(params) {
  return request(`/sprm/v1/${getOrganizationId()}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}

// 获取列表
export function fetchPurchaseList(query) {
  const { organizationId, realName } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request?prRequestedName=${realName}`;
  return request(queryUrl, {
    method: 'GET',
    query,
  });
}

// 保存
export function handleSavePur(query) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request`;
  return request(queryUrl, {
    method: 'PUT',
    query: {
      customizeUnitCode: `MALL.APPLY.EDIT.BASICINFO,MALL.APPLY.EDIT.APPLYINFO.TABLE`,
    },
    body: JSON.stringify(query),
  });
}

// 提交
export function handleSubmitPur(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request/submit`;
  return request(queryUrl, {
    method: 'POST',
    query: {
      customizeUnitCode: `MALL.APPLY.EDIT.BASICINFO,MALL.APPLY.EDIT.APPLYINFO.TABLE`,
    },
    body: JSON.stringify(params),
  });
}

// 获取编辑列表
export function fetchDetailList(prHeaderId) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request/header/${prHeaderId}`;
  return request(queryUrl, {
    method: 'GET',
    query: { customizeUnitCode: 'MALL.APPLY.EDIT.BASICINFO' },
  });
}

// 查询采购申请单行信息
export function fetchProductInfo(params) {
  const { organizationId } = getUserConfigInfo();
  const { prHeaderId, ...pages } = params;
  pages.customizeUnitCode = 'MALL.APPLY.EDIT.APPLYINFO.TABLE';
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request/line/${prHeaderId}`;
  return request(queryUrl, {
    method: 'GET',
    query: pages,
  });
}

// 删除
export function deleteReqProductInfo(params, prHeaderId) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request/line/${prHeaderId}`;
  return request(queryUrl, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 附件查看
export function fetchAnnex(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/${params}/file?attachmentUUID=${params}&bucketName=private-bucket`;
  return request(queryUrl, {
    method: 'GET',
  });
}

// 查询申请类型
export function fetchRequestType() {
  const params = {
    page: 0,
    size: 10,
    newMallFlag: 1,
    tenantId: 0,
    lovCode: 'SPUC.PR_DEMAND_TYPE_SITE',
  };
  const queryUrl = `${HmallConfig.apiGateway}/spuc/v1/lovs/sql/data`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

// oms 手工申请列表
export function fetchOMSApplyCentent(query) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${omsServiceName}/v1/${organizationId}/manual-requests/list`;
  return request(queryUrl, {
    method: 'GET',
    query,
  });
}

export function fetchOMSApplyStatusCount(query) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${omsServiceName}/v1/${organizationId}/manual-requests/count-by-status`;
  return request(queryUrl, {
    method: 'GET',
    query,
  });
}

// oms 提交
export function fetchOMSSubmit(body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${omsServiceName}/v1/${organizationId}/manual-requests/submit?customizeUnitCode=${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

// oms 保存
export function fetchOMSSave(body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${omsServiceName}/v1/${organizationId}/manual-requests/save?customizeUnitCode=${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

// oms 详情查询
export function fetchOMSApplyDetail(query) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${omsServiceName}/v1/${organizationId}/manual-requests/detail?customizeUnitCode=${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    {
      query,
    }
  );
}

// OMS 批量删除行信息
export function deleteOMSLines(body) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-request-entry/batch-delete`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// OMS 删除申请
export function fetchDeleteApply(body) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-requests/delete`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// OMS 取消/关闭申请
export function fetchCloseApply(body) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-requests/cance`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// oms 手工申请关联单据
export function fetchomsAssociated(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-requests/link-order`, {
    query,
  });
}

// 转寻源
export function fetchomsSourceed(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-request-details/source`, {
    query,
  });
}

// 转协议
export function fetchomsProtocoled(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-request-details/protocol`, {
    query,
  });
}

// oms 取消申请
export function cancelRequestService(body) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${omsServiceName}/v1/${organizationId}/manual-requests/cancel`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// oms 根据company/ou查下级数据
export function fetchCompanyData(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/sprm/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query,
  });
}

// oms 根据sprm查采购员
export function fetchPrAgent(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/sprm/v1/${organizationId}/purchase-requests/agent`, {
    method: 'GET',
    query,
  });
}

// 获取双单位数量
export function getDoubleUomQuantityService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`/smdm/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 获取双单位数量
export function getDoubleUomPriceService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${HmallConfig.serviceName}/v1/${organizationId}/purchase-request/amount`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
