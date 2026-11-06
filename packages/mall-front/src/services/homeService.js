import request from 'utils/request';
import { getUserConfigInfo, filterNullGetUrl } from 'utils/utils';
import { getUserCustomDimension, getDimensionValueMap } from 'utils/configUtils';
import HmallConfig from 'utils/api-config';

// 获取产品列表
export function fetchCarouselService(param = {}) {
  const { organizationId, mallType, unitId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/page-banners/list`;
  const query = {
    tenantId: organizationId, // 租户id
    unitId, // 采买组织id
    shelfFlag: 1, // 上架状态 0下架，1上架
    groupAttribute: mallType === 'sigl' ? 1 : 0, // 0企业购 1员购
    ...param,
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 获取首页商品
export function fetchBarList(param = {}) {
  const { organizationId, unitId, mallType } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/custom-tags/list`;
  const query = {
    tenantId: organizationId, // 租户id
    unitId, // 采买组织id
    shelfFlag: 1, // 上架状态 0下架，1上架
    groupAttribute: mallType === 'sigl' ? 1 : 0, // 0企业购 1员购
    ...param,
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

export function queryStock(params) {
  const { organizationId, ouId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.proServiceName}/v1/${organizationId}/sku-stocks/batch-get-stock`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({ ouId, ...params }),
  });
}

export function checkSale(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/batch-saleCheck`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 查询价格服务
export function checkSaleBySagm(params) {
  const customDimensionMap = getUserCustomDimension();
  const { organizationId, channel } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/agreement/es-search/price`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      channel,
      queryAttrFlag: true,
      customDimensionMap,
    }),
  });
}

export function fetchUom(params) {
  const { productDTOS } = params;
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/sku-center-interface/batch-query-sku-attr`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({
      skuIds: productDTOS.map((p) => p.productId),
    }),
  });
}

export function fetchUomNameAndCode(productIds) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product/unit-info`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(productIds),
  });
}

// 搜索接口更新自定义栏
export function fetchBarBySearch(params, hashParam = {}) {
  const {
    companyId,
    organizationId,
    userId,
    unitId,
    levelPath,
    visitConfig: { companyId: preCompanyId, organizationId: preOrganizationId },
    language,
    channel,
  } = getUserConfigInfo();
  const dimensionValueMap = getDimensionValueMap();
  const _query = { page: 0, size: 10 };
  const _body = {
    ...hashParam,
    searchParam: {
      userId,
      unitId,
      lang: language,
      unitLevelPath: levelPath,
      companyId: companyId || preCompanyId,
      tenantId: organizationId || preOrganizationId,
      ...params,
      channel,
      dimensionValueMap,
    },
  };
  const url = `${HmallConfig.apiGateway}/sads/v1/${organizationId}/custom-tag`;
  return request(filterNullGetUrl(url, _query), {
    method: 'POST',
    body: JSON.stringify(_body),
  });
}

// 查询公告
export function fetchBulletinBoards(query) {
  const { organizationId } = getUserConfigInfo();
  return request(`/${HmallConfig.serviceName}/v1/${organizationId}/bulletin-boards/list`, {
    method: 'GET',
    query,
  });
}

// 公告详情
export function fetchBulletinBoardDeatil(id) {
  const { organizationId, unitId } = getUserConfigInfo();
  return request(`/${HmallConfig.serviceName}/v1/${organizationId}/bulletin-boards/${id}`, {
    method: 'GET',
    query: { unitId },
  });
}

// 商品卡片配置
export async function fetchProductCardConfig() {
  const { organizationId, companyId } = getUserConfigInfo();
  const url = `/${HmallConfig.serviceName}/v1/${organizationId}/product-card-configs`;
  return request(url, {
    method: 'GET',
    query: { companyId },
  });
}

// 公告已读接口
export function noticeReadedService(bulletinId) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/bulletin-boards/read/${bulletinId}`;
  return request(url, {
    method: 'POST',
  });
}
