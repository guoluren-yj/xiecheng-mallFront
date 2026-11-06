import {
  getAllCookies,
  getStorage,
  removeStorage,
  getUserConfigInfo,
  getAccessToken,
} from 'utils/utils';
import { removeCookie } from './utils';

//  从localStorage 中匹配出 包含_region的数据 仅一条
function getRegionLocalStorage() {
  const { userId } = getUserConfigInfo();

  const key = `${userId}_region`;
  const value = getStorage(key);

  // 获取最后一层regionId 从forth依次往前取
  const { first, second, third, fourth } = value || {};
  const { sheng } = first || {};
  const { shi } = second || {};
  const { xian } = third || {};
  const { xiangzhen } = fourth || {};

  if (value) {
    const result = [];
    result.push(xiangzhen || xian || shi || sheng);
    return result;
  }
}

// 获取 cookie中 匹配 ${userId}AddressInfo 的数据
// [{key:regionId}]形式
function getAddressCookieKey() {
  const addressMap = {};
  const { userId } = getUserConfigInfo();
  const allCookies = getAllCookies();

  Object.keys(allCookies).forEach((cookieKey) => {
    // 匹配 ${userId}AddressInfo 的数据
    if (cookieKey.includes(`${userId}AddressInfo`)) {
      const cacheAddress = allCookies[cookieKey];
      const { regionIdInfoList } = cacheAddress[getAccessToken()] || {};
      const value = regionIdInfoList?.pop();
      if (value) {
        addressMap[value] = addressMap[value] || [];
        addressMap[value].push(cookieKey);
      }
    }
  });
  return addressMap;
}

// cookie中的regionId 返回id 数组
function getCookieRegionIds() {
  const addressMap = getAddressCookieKey();
  const regionIdList = Object.keys(addressMap);
  return regionIdList;
}

// 获取浏览器所有缓存地址 最后一级 regionId
export function getAllCacheRegionId() {
  const localCache = getRegionLocalStorage() || [];
  const cookieCache = getCookieRegionIds();

  // 返回storage + cookie 数组
  return localCache.concat(cookieCache);
}

// 清除缓存
export function clearCacheAddress(res) {
  const { userId } = getUserConfigInfo();

  const localCache = getRegionLocalStorage() || [];
  const cookieAddressMap = getAddressCookieKey();

  (res.regionIsInvalidResult || []).forEach((item) => {
    // 0 地址有效 1 地址失效

    if (item.result === 1) {
      // storage缓存
      if (item.regionId === localCache[0]) {
        removeStorage(`${userId}_region`);
      }
      // cookie缓存
      const clearCookieKeys = cookieAddressMap[item.regionId] || [];
      clearCookieKeys.forEach((key) => {
        removeCookie(key);
      });
    }
  });
}
