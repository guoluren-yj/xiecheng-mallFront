import { getUserConfigInfo, filterNullValueObject } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { getOpenCartFlag } from 'utils/configUtils';
import { NEWCART_SERVICE_PRAMS_CODE } from 'utils/customizeCode';

const customizeUnitCode = NEWCART_SERVICE_PRAMS_CODE;

// 购物车行查询
export function fetchProductService(params) {
  const { userId, organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts`;
  const query = {
    ownerId: userId,
    ...params,
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 商品明细购物车行查询
export function fetchProductDimService(params) {
  const { userId, organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart`;
  const query = {
    ownerId: userId,
    ...params,
    openCartFlag: getOpenCartFlag() ? 1 : 0,
  };
  return request(url, {
    method: 'GET',
    query,
  });
}

// 加入购物车
export function addNewCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 立即购买
export function newBuyNowService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/buy-now`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 再来一单
export function newBuyAgainService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/buy-again`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 采购套餐加购
export function newBatchCreateService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/batch-create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 更新购物车
export function updateCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/update-quantity`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 更新购物车
export function updateQualityCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/list-update`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function collectProductService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/add-favorites`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 删除购物车
export function deleteNewCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/delete`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 删除勾选（行维度）
export function deleteLinesService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 查询租户默认模板
export function fetchDimensionTemplates(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/dimensiontemplates/default`;
  return request(url, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

// 查询费用分配
export function fetchProductAllocationService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/dim-value/detail`;
  return request(url, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode,
    },
  });
}

// 删除费用分配
export function allocationDeleteService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/delete-line`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 查询价格明细
export function fetchPriceDetailService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/price-detail/${params}`;
  return request(url, {
    method: 'GET',
  });
}

// 查询阶梯价
export function fetchLadderPriceService(cartId) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/ladder-price/${cartId}`;
  return request(url, {
    method: 'GET',
  });
}

// 下一步
export function preReqOrderService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/pre-req`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 开放购物车下一步
export function openCartPreReqOrderService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/pre-req`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 保存定制品
export function updateCustomService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/update-customized`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 比价单确定
export function changeCompareService(params, productId) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/change/${productId}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 删除比价单
export function deleteCompareService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/batch-delete`;
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
  });
}

// 批量分配新建
export function batchAllocationService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/batch-allocation`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 预算余额查询
export function fetchBudgetRemainService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/budget/remain`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// punchout商品更改地址
export function updatePunchoutAddressService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/punch-out/update-address`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 拼单下单校验
export function centralizedCheckService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations/check`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 拼单下单
export function batchCentralizedService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 电商定制品价格查询
export function ecCustomizedPriceService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/carts/ec-customized-price/query`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 手工加购
export function manualAddCartService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/manual-create`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 开发购物车立即购买
export function openCartBuyNowService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/buy-now`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 预采提交
export function reqOpenCartSubmitService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/pre-order`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 查询运费
export function fetchOpenCartPostageInfo(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/postage-info`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 批量分配新增
export function batchAllocationAddService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/batch-allocation/add-product`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 手工批量分配新增
export function batchManulAllocationAddService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/manual-batch-allocation/add-product`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 批量查询商品列表
export function fetchBatchProductListService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/batch-allocation/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 批量分配保存
export function saveBatchAllocationService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/batch-allocation`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 手工批量分配保存
export function saveBatchManulAllocationService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/manual-batch-allocation`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 批量分配保存
export function fetchDefAlloctionValueService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/default-value`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
    query: {
      customizeUnitCode,
    },
  });
}

// 清空购物车
export function deleteAllCartGoods() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/clean`;
  return request(url, {
    method: 'POST',
  });
}

// e卡 根据价格搜索商品id
export function getCardByPriceService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.jdecService}/v1/${organizationId}/query-card-by-price`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 查询购物篮配置
export function fetchCartConfig() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/cart-common/common-config`;
  return request(url, {
    method: 'GET',
  });
}

// 提需人取消拼单
export function cancelCentralizeService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations/cancel`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 下单人驳回拼单
export function rejectCentralizeService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations/reject`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 提需人下一步
export function submitCentralizeService(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations/submit`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 拼单修改地址
export function updateCentralizeAddress(params) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/open-cart/centralized/update-address`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function deleteBasketService() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/${HmallConfig.newCartService}/v1/${organizationId}/centralized-relations/delete`;
  return request(url, {
    method: 'DELETE',
  });
}
