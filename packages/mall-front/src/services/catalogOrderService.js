import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 获取列表
export function fetchCatalogList(query) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-order/pur-req-summaries`; // url
  return request(queryUrl, {
    method: 'GET',
    query,
  });
}

// 查询发票类型
export function fetchInvoiceType() {
  const { organizationId } = getUserConfigInfo();
  const invoiceUrl = `${HmallConfig.apiGateway}/hpfm/v1/lovs/data?lovCode=SPRM.PR_INVOICE_TYPE&organizationId=${organizationId}`;
  return request(invoiceUrl);
}

// 再来一单
export function fetchOrderAgain(list) {
  const {
    organizationId,
    userId,
    purchaseType,
    companyId,
    tenantId,
    purchaseOrgId,
  } = getUserConfigInfo();
  const { receiverAddressId } = list;
  const dataList =
    list.prLineList &&
    list.prLineList.map(line => {
      const { taxIncludedUnitPrice } = line;
      return {
        skuType: 0,
        ...line,
        companyId,
        tenantId,
        purchaseType,
        ownerId: userId,
        purchaseFlag: 0,
        addressId: receiverAddressId,
        purOrganizationId: purchaseOrgId,
        latestPrice: taxIncludedUnitPrice,
        unitPrice: taxIncludedUnitPrice,
      };
    });
  const dataUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/another-list`;
  return request(dataUrl, {
    method: 'POST',
    body: JSON.stringify(dataList),
  });
}

// 加入购入车
export function fetchAddCart(headData, lineData) {
  const {
    organizationId,
    userId,
    purchaseType,
    companyId,
    tenantId,
    purchaseOrgId,
  } = getUserConfigInfo();
  const { receiverAddressId } = headData;
  const { taxIncludedUnitPrice } = lineData;
  const dataList = {
    skuType: 0,
    ...lineData,
    companyId,
    tenantId,
    purchaseType,
    purchaseFlag: 0,
    ownerId: userId,
    addressId: receiverAddressId,
    unitPrice: taxIncludedUnitPrice,
    purOrganizationId: purchaseOrgId,
    latestPrice: taxIncludedUnitPrice,
  };
  const dataUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  return request(dataUrl, {
    method: 'POST',
    body: JSON.stringify(dataList),
  });
}
