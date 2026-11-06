import { getUserConfigInfo, filterNullGetUrl } from 'utils/utils';
import { getDimensionValueMap } from 'utils/configUtils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

// 获取所有产品
export function fetchProduct(params) {
  const {
    companyId,
    organizationId,
    userId,
    levelPath,
    unitId,
    visitConfig: { companyId: preCompanyId, organizationId: preOrganizationId },
    language,
    channel,
  } = getUserConfigInfo();
  const dimensionValueMap = getDimensionValueMap();
  const { page, size, barId, ...other } = params;
  const _query = { page, size };
  const _body = {
    userId,
    unitId,
    lang: language,
    customBarId: barId,
    unitLevelPath: levelPath,
    companyId: companyId || preCompanyId,
    tenantId: organizationId || preOrganizationId,
    ...other,
    channel,
    dimensionValueMap,
  };
  const url = `${HmallConfig.apiGateway}/sads/v1/${organizationId}/scroll`;
  return request(filterNullGetUrl(url, _query), {
    method: 'POST',
    body: JSON.stringify(_body),
  });
}

// 获取商品收藏状态
export function fetchProductFavorite(queryParam) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites/search-list`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(queryParam),
  });
}

// 获取当前目录结构
export function fetchCurrentCategoryService(catalogId) {
  const { organizationId } = getUserConfigInfo();
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/catalogs/get-parent-catalog/${catalogId}`;
  return request(authUrl);
}

export function addToCartService(params) {
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${params.organizationId}/products/add-shoppingCart`;
  return request(authUrl, {
    method: 'PUT',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode: 'SMPC.WORKBENCH_PUR.LIST_ALL',
    },
  });
}

export function fetchBannerDetail(id) {
  const { unitId, organizationId } = getUserConfigInfo();
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/page-banners/${id}`;
  return request(authUrl, {
    method: 'GET',
    query: {
      unitId,
    },
  });
}

export function fetchCustomDetail(id) {
  const { unitId, organizationId } = getUserConfigInfo();
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/custom-tags/${id}`;
  return request(authUrl, {
    method: 'GET',
    query: {
      unitId,
    },
  });
}

export function fetchZhuanquDetail(id) {
  const { unitId, organizationId } = getUserConfigInfo();
  const authUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/special-blocks/${id}`;
  return request(authUrl, {
    method: 'GET',
    query: {
      unitId,
    },
  });
}

// 生成比加单
export function fetchAddPriceCompare(body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/add-compare-cart`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      query: {
        customizeUnitCode: 'SMPC.WORKBENCH_PUR.LIST_ALL',
      },
    }
  );
}

// 反查是否为同款
export function fetchIsSameSku(body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${HmallConfig.productService}/v1/${organizationId}/skus/check-same-sku
  `,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
