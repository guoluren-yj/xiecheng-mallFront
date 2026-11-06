import { getUserConfigInfo, getOrganizationId, filterNullValueObject } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import qs from 'qs';

// 初始化购物车商品
export function fetchProductService() {
  const { userId, companyId, purchaseType, organizationId, levelPath } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  const query = {
    companyId,
    levelPath,
    purchaseType,
    ownerId: userId,
    time_db: new Date().getTime(),
    // customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE',
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 查询购物车电商商品的库存
export function fetchECStock(p) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/query-stock`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(p),
    // query: { customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE' },
  });
}

// 查询购物车商品的物料编码
export function fetchItemCode(p) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/query-item`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(p),
    // query: { customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE' },
  });
}

// 查询购物车电商商品的是否可售
export function fetchECSale(p) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/query-check-sale`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(p),

    // query: { customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE' },
  });
}

// 比价规则是否开启查询
export function queryCompareRule() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/settings/011019`;
  return request(url, {
    method: 'GET',
  });
}

// 修改购物车内地址
export function updateAddressService(params, addressId) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/change-address?addressId=${addressId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    // query: { customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE' },
  });
}

/**
 * 更改商品数量
 * @param {Object} params - 商品
 */
export function updateCartService(params) {
  const organizationId = getOrganizationId();
  const { purchaseType } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      purchaseType,
    }),
    // query: { customizeUnitCode: 'MALL.TEST.CART.PURCHAZSE' },
  });
}

/**
 * 删除商品
 * @param {Array} params - 删除商品
 */
export function deleteCartService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

/**
 * 生成订单
 * @param {Array} params - 选中商品
 */
export function preReqOrderService(params) {
  const organizationId = getOrganizationId();
  const { unitId } = getUserConfigInfo(); // 老购物车增加传参 unitId
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/pre-req?unitId=${unitId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function collectProductService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-favorites`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function handleChangePrice(params) {
  const { organizationId } = getUserConfigInfo();
  const { productId, ...others } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/update-price/${productId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(filterNullValueObject(others)),
  });
}

export function handleDeleteCompare(params) {
  const { organizationId, companyId } = getUserConfigInfo();
  const { productId, regionId, levelPath } = params;
  const url = `${HmallConfig.apiGateway}/${
    HmallConfig.serviceName
  }/v1/${organizationId}/product-compares/${companyId}/${productId}?regionId=${regionId}&levelPath=${encodeURIComponent(
    levelPath
  )}`;
  return request(url, {
    method: 'DELETE',
  });
}

export function queryLowerProduct(params) {
  const { organizationId } = getUserConfigInfo();
  const { productId, ...query } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/lower/${productId}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

export function addCompareCart(params) {
  const {
    organizationId,
    companyId,
    userId,
    purchaseOrgId,
    invoiceOrgId,
    purchaseType,
    levelPath,
  } = getUserConfigInfo();
  const {
    item: { addressId, cartId, quantity },
    addData,
  } = params;
  const saveData = addData.map((i) => {
    const { price, productId, sourceFrom, supplierCompanyId } = i;
    return {
      addressId,
      productId,
      companyId,
      purchaseType,
      supplierCompanyId,
      ownerId: userId,
      unitPrice: price,
      tenantId: organizationId,
      productSource: sourceFrom,
      purOrganizationId: purchaseOrgId,
      invOrganizationId: invoiceOrgId,
      quantity,
      latestPrice: price,
      levelPath,
    };
  });
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/add-shopping-cart/${cartId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(saveData),
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

export function fetchBatchCodeService(params) {
  const organizationId = getOrganizationId();
  const { valueType, lovCode, platformCode, dataType, companyId } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/lovs/sql/data`;
  const query = {
    lovCode,
    companyId,
    valueType,
    platformCode,
    tenantId: organizationId,
    size: 50,
    dataType,
  };

  return request(url, {
    method: 'GET',
    query,
  });
}

export function fetchMethodAndtypeService(params) {
  const organizationId = getOrganizationId();
  const { platformCode, dataType, companyId } = params;
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/smal_invoice_type_method_value`;
  const query = {
    dataType,
    ecPlatformCode: platformCode,
    tenantId: organizationId,
    size: 100,
    companyId,
  };

  return request(url, {
    method: 'GET',
    query,
  });
}

export function submitOrderListService(params) {
  const organizationId = getOrganizationId();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/pre-order`;

  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function getSourceKeyService() {
  const organizationId = getOrganizationId();
  const getSourceKeyUrl = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/companies?tenantId=${organizationId}`;
  return request(getSourceKeyUrl, {
    method: 'GET',
  });
}

export function invoiceCheckService(params) {
  const organizationId = getOrganizationId();
  const getInvoiceUrl = `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/company-invoices/queryCompanyInvoice/${params.sourceKey}`;
  return request(getInvoiceUrl, {
    method: 'GET',
  });
}

export function fetchDefaultAcAddress(parmas, flag = null) {
  const { organizationId, companyId } = getUserConfigInfo();
  const query = {
    companyId: parmas || companyId,
    isFlag: flag ? 1 : 0,
  };
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/default-invoice`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 获取京东延保服务列表
export function fetchGift(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/getSkuGift`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 获取个性化补录字段
export function fetchCustomize() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/shopping-carts/pre-req-personal`,
    {
      method: 'GET',
    }
  );
}

// 名片信息
export function fetchCardInfo(userId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/hr/employees/user/${userId}`,
    {
      method: 'GET',
    }
  );
}

// 查询预算信息
export function fetchBudgetInfo(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 批量修改预算信息
export function updateBudget(params, batchFlag) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos${
      batchFlag ? '/batch-create' : ''
    }`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 根据预算数量更新购物车数量
export function updateQuantity(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos/update-quantity`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 预算余额
export function buggetRemain(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos/budget-occupy/remain`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 删除预算信息
export function deleteBudget(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos`,
    {
      method: 'DELETE',
      body: JSON.stringify(params),
    }
  );
}

// 预算校验
export function budgetCheck(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos/budget-occupy`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

// 是否启用oms
export function isUseOms() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/smodr/v1/${organizationId}/tools/enable-order-center-flag`,
    {
      method: 'GET',
    }
  );
}

// 是否是线上支付
export function fetchIsOnline() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cata-client-values/by-condition`,
    {
      method: 'GET',
      query: {
        valueType: 'PAYMENT_TYPE',
      },
    }
  );
}

// 查询跳转批次号
export function fecthLotNum(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/smodr/v1/${organizationId}/orders/pr-lot-num?batchNum=${params}`,
    {
      method: 'GET',
    }
  );
}

// 预算发票/支付方式等默认值
export function fetchDefaultSetting(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${
      HmallConfig.serviceName
    }/v1/${organizationId}/ec-client-values/query-default-value?${qs.stringify(params, {
      arrayFormat: 'repeat',
    })}`,
    {
      method: 'GET',
    }
  );
}

// 内采支付信息值集
export function fetchCataClientValueList() {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cata-client-values/client-value-list`,
    {
      method: 'GET',
    }
  );
}

export function fetchCategory(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `/marmot/v1/${organizationId}/marmot-api/JqPIqvlgp2NF6iakzo6C7q92mGfibuyGn0ntxlXGdTk5YTiahDph05Jw6ZvrFaHxk0u`,
    {
      method: 'POST',
      body: JSON.stringify({ catalogIds: params }),
    }
  );
}

export function relaseBudgetService(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/budget-infos/budget-release`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function fetchCustom(skuId) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/customized-product-lines/${skuId}`,
    {
      method: 'GET',
    }
  );
}

export function saveCustom(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/customized-product-lines`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function deleteCustom(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/customized-product-lines`,
    {
      method: 'DELETE',
      body: JSON.stringify(params),
    }
  );
}

export function fetchCustomData(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/customized-product-lines/list`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function updateCustomQuantity(params) {
  const { organizationId } = getUserConfigInfo();
  return request(
    `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/customized-product-lines/update-quantity`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
}

export function getSiglCount() {
  const { organizationId, userId } = getUserConfigInfo();
  return request(`/${HmallConfig.siglService}/v1/${organizationId}/members`, {
    query: { userId },
  });
}

// 获取商品标签 - post
export function fetchProductLabelPost(productIds) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.productService}/v1/${organizationId}/sku-labels/label-multi-name`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(productIds),
  });
}
