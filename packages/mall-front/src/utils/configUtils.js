/**
 * utils太沉重了
 * 单独封装所有配置的flag
 */
import { isNil } from 'lodash';
import { getUserConfigInfo, getOrganizationId } from 'utils/utils';

// 是否隐藏供应商
export function getIsHideSupplierFlag() {
  return +window.dvaApp._store.getState().global.hideSupplierFlag === 1; // hideSupplierFlag 1隐藏
}

// 是否开启立即购买
export function getIsEnabledBuyNowFlag() {
  return +window.dvaApp._store.getState().global.enabledBuyNowFlag === 1; // enabledBuyNowFlag 1启用
}

export function getCurrentUser() {
  return window.dvaApp._store.getState().global.userInfo;
}

/**
 * 获取采买配置
 */
export function getUserConfig() {
  return window.dvaApp._store.getState().global.userConfig;
}

/**
 * 获取原滋原味采买配置
 */
export function getUserConfigDTO() {
  return window.dvaApp._store.getState().global.purchaseUnit || {};
}

/**
 * 获取采买配置自定义维度
 */
export function getUserCustomDimension() {
  const { customDimensionMap = {} } = getUserConfigDTO();
  return customDimensionMap || {};
}

/**
 * 获取采买配置自定义维度值
 */
export function getDimensionValueMap() {
  const userCustomDimension = getUserCustomDimension();
  const dimensionValueMap = {};
  Object.keys(userCustomDimension).forEach((key) => {
    const { value } = userCustomDimension[key] || {};
    dimensionValueMap[key] = value;
  });
  return dimensionValueMap;
}

/**
 * 获取开放性购物车配置
 */
export function getOpenCartFlag(linkType) {
  // return window.dvaApp._store.getState().global.mallRequestConfig;
  return linkType ? linkType === 'REQUEST' : !getOldTenantFlag();
}

/**
 * 获取链路配置表租户
 */
export function getOldTenantFlag() {
  return window.dvaApp._store.getState().global.oldTenantFlag;
}

// 是否开启新购物车
export function getIsNewCartFlag() {
  return +window.dvaApp._store.getState().global.isNewCart === 1;
}

// 购物车简易/明细视图类型
export function getViewTypeStorageKey() {
  const { userId, organizationId } = getCurrentUser();
  return `mall-front-cart-view-type-${organizationId}-${userId}`;
}

// 是否开启双单位
export function getDoubleUomFlag() {
  return +window.dvaApp._store.getState().global.doubleUomFlag === 1;
}

// 是否拥有两个单位
export function hasDoubleUomFlag({ uomId, customUomId, customQuantity }) {
  return (
    getDoubleUomFlag() &&
    ((uomId === customUomId && customQuantity && +customQuantity !== 1) ||
      (!isNil(customUomId) && uomId !== customUomId))
  );
}

// 获取申请售后数量
export function getAfterSaleNum({
  uomId,
  customUomId,
  customQuantity,
  salePackageNum,
  customUomName,
  saleNum,
  uomName,
}) {
  return hasDoubleUomFlag({ uomId, customUomId, customQuantity })
    ? `${salePackageNum}${customUomName}${saleNum}${uomName}`
    : `${saleNum}${uomName}`;
}

// 获取排序后菜单列表
export function getMallSortMenu(mallRouters) {
  const { productSearchTypeConfig = {} } = getUserConfigInfo();
  const { myMallMenuConfigList, myMallMenuFlag } = productSearchTypeConfig;
  // 未配置 则返回原路由
  if (!myMallMenuFlag) return mallRouters.myMall.children;
  else {
    // 已配置
    const sortList = mallRouters.myMall.children
      ?.map((p) => {
        return {
          ...p,
          orderSeq: myMallMenuConfigList?.find((o) => o.searchType === p.searchType)?.orderSeq,
        };
      })
      .sort((a, b) => a.orderSeq - b.orderSeq);
    return sortList;
  }
}

// 获取比价策略信息
export function getCompareConfig() {
  return window.dvaApp._store.getState().global.compareRule || {};
}

// 获取购物车分组类型
export function getCartGrounpType() {
  const cartGroundType = localStorage.getItem(`cartGrouping-${getOrganizationId()}`);
  return cartGroundType === 'supplierCompanyName' && getIsHideSupplierFlag()
    ? undefined
    : cartGroundType;
}
