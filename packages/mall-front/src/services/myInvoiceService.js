import { filterNullGetUrl, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchInvoiceListService(params) {
  const { organizationId, purchaseType } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}?purchaseType=${purchaseType}&invoiceFlag=1`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

export function fetchOMSInvoiceListService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/invoices/invoice-list`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

export function fetchOMSInvoiceByGoodsService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/invoices/submit-invoice-by-goods`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchOmsInvoiceService(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/invoice-list`;
  const url = filterNullGetUrl(queryUrl, params);
  return request(url, {
    method: 'GET',
  });
}

export function submitInvoiceService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/invoices/mall-submit-invoice`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
