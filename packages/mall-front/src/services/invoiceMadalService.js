import { getUserConfigInfo, getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchInvoiceService(ecPlatformCode = 'JD', orderId) {
  const { organizationId, companyId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-ecinvoice-headerss?companyId=${companyId}&ecPlatform=${ecPlatformCode}&ivcType=3&orderId=${orderId}&page=0&size=10`;
  return request(url, {
    method: 'GET',
  });
}

// 发票物流
export function fetchInvoiceLogistService(query) {
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/invoice/getLogisticsInfo`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// oms-发票物流
export function fetchOmsInvoiceLogistService(query) {
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.omsServiceName
  }/v1/${getOrganizationId()}/invoices/consignment-info`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// oms-发票
export function fetchOMSInvoiceService(query) {
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.omsServiceName
  }/v1/${getOrganizationId()}/invoices/invoiceDetail`;
  return request(url, {
    method: 'GET',
    query,
  });
}
