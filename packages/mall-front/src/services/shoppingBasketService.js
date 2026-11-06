import { getUserConfigInfo, filterNullValueObject } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

/**
 * 查询购物篮
 * @param {Object} params - 查询条件
 */
export function fetchShoppingBasket(query, params) {
  const {
    organizationId,
    companyId,
    purchaseOrgId,
    invoiceOrgId,
    purchaseType,
    unitId,
  } = getUserConfigInfo();
  const _body = {
    ...params,
    companyId,
    purchaseType,
    tenantId: organizationId,
    purOrganizationId: purchaseOrgId,
    invOrganizationId: invoiceOrgId,
    unitId,
  };
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-bars/list`;
  return request(queryUrl, {
    method: 'POST',
    query,
    body: JSON.stringify(filterNullValueObject(_body)),
  });
}

/**
 * 查询默认地址
 */
export function fetchDefaultAddress(params) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default-address`;
  return request(queryUrl, {
    method: 'GET',
    query: params,
  });
}

/**
 * 加入购物车
 * @param {Array} list - 商品数据
 * @param {Object} addressId - 地址id
 */
export function addToCart(prams) {
  const { organizationId } = getUserConfigInfo();
  const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/market-baskets/add-shoppingCart`;
  return request(queryUrl, {
    method: 'PUT',
    body: JSON.stringify(prams),
    query: {
      customizeUnitCode: 'SMPC.WORKBENCH_PUR.LIST_ALL',
    },
  });
}

/**
 * 查询购物篮下的商品行
 * @param {*} shoppingBarId 购物篮id
 * @param {*} body 参数
 * @returns request
 */
export function fetchShoppingBasketProducts(shoppingBarId, body) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/${HmallConfig.serviceName}/v1/${organizationId}/shopping-bars/mall/${shoppingBarId}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
