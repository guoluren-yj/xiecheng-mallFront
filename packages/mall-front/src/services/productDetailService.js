import { getUserConfigInfo, filterNullGetUrl, getOrganizationId, getStorage } from 'utils/utils';
import { getUserCustomDimension } from 'utils/configUtils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

import qs from 'qs';

// 商品详情信息
export function getProductDetail(data) {
  const {
    organizationId,
    companyId,
    purchaseType = 'COMPANY',
    visitConfig: {
      isSecondWebSite,
      companyId: preCompanyId,
      visitorFlag,
      organizationId: preOrganizationId,
    },
    userId,
  } = getUserConfigInfo();
  const { third } = getStorage(`${userId}_region`) || {};
  const _defaultCode = getStorage(`${userId}_defaultAddressCode`) || [];
  const {
    productId,
    sourceFrom,
    // invOrganizationId: id = '',
    addressId,
    countyCode,
    regionId,
    levelPath,
  } = data;
  const _countyCode = countyCode || third?.xianId || _defaultCode?.[2];

  let ecUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/product-details/${organizationId}/ec-products/${companyId}/${productId}?purchaseType=${purchaseType}&platformCode=${sourceFrom}&countyCode=${_countyCode}`;
  if (isSecondWebSite && visitorFlag && preCompanyId) {
    ecUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/product-details/${preOrganizationId}/visit-ec-products/${preCompanyId}/${productId}?purchaseType=${purchaseType}&platformCode=${sourceFrom}&countyCode=${_countyCode}`;
  }
  let detailUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product/${productId}?purchaseType=${purchaseType}&companyId=${companyId}`;
  if (isSecondWebSite && visitorFlag && preCompanyId) {
    detailUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${preOrganizationId}/visit-product/${productId}?purchaseType=${purchaseType}&companyId=${preCompanyId}`;
  }
  const url = sourceFrom === 'CATA' ? detailUrl : ecUrl;
  return request(url, {
    swal: false,
    query: { regionId, levelPath, addressId },
  });
}

// 获取sku
export function getProductSku(data) {
  const { organizationId, companyId, levelPath } = getUserConfigInfo();
  const { productId, regionId } = data;
  const params = {
    productId,
    regionId,
    levelPath,
    companyId,
  };
  const similarUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.productService
  }/v1/${organizationId}/skus/get-similar-sku?${qs.stringify(params)}`;
  return request(similarUrl, {
    method: 'GET',
    swal: false,
    noContent: [],
  });
}

// 获取skuList
export function getProductSkuList(data) {
  const { organizationId, companyId, levelPath } = getUserConfigInfo();
  const { productId, regionId } = data;
  const params = {
    productId,
    regionId,
    levelPath,
    companyId,
  };
  const similarUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.productService
  }/v1/${organizationId}/skus/get-similar-sku/list?${qs.stringify(params)}`;
  return request(similarUrl, {
    method: 'GET',
    swal: false,
    noContent: [],
  });
}

// 获取评论列表
export function fetchComments(productId, data) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${
    HmallConfig.productService
  }/v1/${organizationId}/assessments/sku-all-assessment?${qs.stringify(productId)}`;
  return request(queryUrl, {
    method: 'GET',
    query: data,
  });
}

// 获取同款商品
export function getSameProductList(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.proServiceName}/v1/${organizationId}/skus/get-same-sku`;
  return request(url, {
    method: 'GET',
    query: { ...params, needReasonFlag: 1 },
  });
}

// 查询默认地址
export function queryAddress(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default-address`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function queryStock(queryParams, bodyParams) {
  const { organizationId, ouId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.proServiceName}/v1/${organizationId}/sku-stocks/batch-get-stock`;
  const queryUrl = filterNullGetUrl(url, { tenantId: organizationId, ...queryParams });
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify({ ouId, ...bodyParams }),
  });
}

export function queryPay(queryParams, bodyParams) {
  const { companyId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.ecServiceName}/v1/ec-products/getIsCode`;
  const queryUrl = filterNullGetUrl(url, { companyId, ...queryParams });
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

export function addCollect(params) {
  const { companyId, purchaseType, organizationId, mallType } = getUserConfigInfo();
  const newParams = [
    {
      ...params,
      companyId,
      purchaseType,
      tenantId: organizationId,
      channel: mallType === 'sigl' ? 'PERSONAL' : null,
    },
  ];
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(newParams),
  });
}

export function checkCompareRule(productId) {
  const { organizationId, regionId, levelPath } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/check/${productId}`;
  return request(url, {
    method: 'GET',
    query: { regionId, levelPath },
  });
}

export function getCompareList({ productId, ...other }) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/${productId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(other),
  });
}

export function addCompare(params) {
  const { organizationId, regionId, levelPath, addressInfo } = getUserConfigInfo();
  const ecProductCheckDto = { ...addressInfo, tenantId: organizationId };
  const _body = params.addressId ? params : { ...params, regionId, ecProductCheckDto };
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({ ..._body, levelPath }),
  });
}

export function deleteCompare(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compare-assigns`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

export function addCartService(params) {
  const { companyId, organizationId, userId: ownerId } = getUserConfigInfo();
  const newParams = { companyId, ownerId, ...params };
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(newParams),
    query: {
      customizeUnitCode: 'SMPC.WORKBENCH_PUR.LIST_ALL',
    },
  });
}

export function buyNowService(params) {
  const { companyId, organizationId, userId: ownerId, unitId } = getUserConfigInfo();
  const newParams = { companyId, ownerId, unitId, ...params };
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/buy-now`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(newParams),
    query: {
      customizeUnitCode: 'SMPC.WORKBENCH_PUR.LIST_ALL',
    },
  });
}

export function fetchParityProduct(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-products/price-compare`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * @param params
 * {ecProductId=1
 * ecCategoryId=5834}
 * scec-25409
 */
export function fetchEcMoreProduct(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-products/recommendation`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * @param params
 * Long tenantId,
 * Long productId,
 * Long catalogId
 */
export function fetchMoreProduct(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product/recommendation`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取同类商品
 * @param params
 * Long tenantId,
 * Long productId,
 * Long catalogId
 */
export function fetchSimilarProduct(params) {
  const { organizationId, companyId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/productSimilar/getSimilarProduct`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({ ...params, companyId }),
  });
}

/**
 *
 * @param params
 * Long tenantId,
 * Long productId,
 * Long catalogId
 */
export function fetchPriceChange(params) {
  const organizationId = getOrganizationId();
  const { productId, type, ...query } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/price-changes/${productId}/${type}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 获取电商单次购买最大购买量
export function fetchPurchaseQuantity(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/ec-platforms`;
  return request(url, {
    method: 'GET',
    query: { page: 0, size: 10, ...params },
  });
}

// 查询赠品
export function queryGift(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/getSkuGift`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 查询赠品商品信息
export function queryGiftSku(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/gift-skus`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 获取京东延保服务列表
export function queryExtensionIns(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/getServiceDetail`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 获取预算lov
export function fetchBudgetLov() {
  const { organizationId, companyId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/sprm/v1/${organizationId}/budget-item/PRE_PR`;
  return request(url, {
    method: 'GET',
    query: { companyId },
  });
}

// 获取子账户权限库存组织
export function fetchSubInvoiceList() {
  const { organizationId, companyId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/invorg?lovCode=SPFM.USER_AUTH.INVORG&companyId=${companyId}`;
  return request(url, {
    method: 'GET',
  });
}

// 获取子账户权限采购组织
export function fetchSubPurchaseList() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/purchase-organization?lovCode=SPFM.USER_AUTH.PURCHASE_ORG`;
  return request(url, {
    method: 'GET',
  });
}

// 获取商品标签
export function fetchProductLabel(productIds) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.productService
  }/v1/${organizationId}/sku-labels/label-multi-name?${qs.stringify(
    { productIds },
    { arrayFormat: 'comma' }
  )}`;
  return request(url, {
    method: 'GET',
    noContent: [],
  });
}

// 新商品详情接口
export function getNewProductDetail(params) {
  const customDimensionMap = getUserCustomDimension();
  const { organizationId, companyId, unitId } = getUserConfigInfo();
  const {
    productId,
    regionId,
    addressId,
    levelPath,
    sourceFrom: platformCode,
    customizeUnitCode,
  } = params;
  return request(
    `/${HmallConfig.serviceName}/v1/${organizationId}/sku-detail/${productId}${
      customizeUnitCode ? `?customizeUnitCode=${customizeUnitCode}` : ''
    }`,
    {
      method: 'POST',
      body: JSON.stringify({
        unitId,
        productId,
        regionId,
        addressId,
        levelPath,
        platformCode,
        companyId,
        customDimensionMap,
      }),
    }
  );
}

// 查询拼单活动
export function getCentralizedInfo(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-templates/permission`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 获取历史价
export function fetchHistoryPrice({ skuType, skuId }) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/sagm/v1/${organizationId}/price-changes/${skuType}/price-history/${skuId}`;
  return request(url, {
    method: 'GET',
  });
}
