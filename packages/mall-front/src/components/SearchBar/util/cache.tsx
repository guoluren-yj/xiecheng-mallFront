import { isNil, isEmpty } from 'lodash';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { menuTabEventManager } from 'hzero-front/lib/utils/menuTab';

import { ICacheData } from './common';

// 获取当前 tab key
function getSearchBarKey(cacheCode: string) {
  const tabKey = getDvaApp()._store.getState().global.activeTabKey;
  if (!tabKey) {
    return null;
  }
  const searchBarKey = tabKey.concat('/').concat(cacheCode);
  return searchBarKey;
}

// 获取 searchCode 对应的筛选器缓存
export function getSearchBarCache(cacheCode: string) {
  if (!(window as any).searchBarCache) {
    return null;
  }
  const key = getSearchBarKey(cacheCode);
  if (!key) {
    return null;
  }
  return (window as any).searchBarCache[key] as ICacheData;
}

// 设置缓存
export function setSearchBarCache(cacheCode: string, cacheData: ICacheData) {
  const key = getSearchBarKey(cacheCode);
  if (key) {
    (window as any).searchBarCache = (window as any).searchBarCache || {};
    (window as any).searchBarCache[key] = cacheData;
  }
}

// 重置 searchCode 对应的筛选器缓存
export function resetSearchBarCache(cacheCode: string) {
  setSearchBarCache(cacheCode, {} as ICacheData);
}

// 判断是否有缓存
export function hasSearchBarCache(cacheCode: string) {
  const key = getSearchBarKey(cacheCode);
  const searchBarCache = (window as any).searchBarCache || {};
  if (isNil(key) || isEmpty(searchBarCache[key])) {
    return false;
  }
  const cache: ICacheData = searchBarCache[key];
  // 同路由下的多个筛选器单元，在路由卸载时可能导致某些筛选器单元的currentFilter值为空，故此处增加对缓存是否有效的判断
  return !!cache?.currentFilter?.filterCode;
}

export function initialFilterCache(cacheCode: string) {
  const activeTabKey = getDvaApp()?._store?.getState()?.global?.activeTabKey;
  const menuTabCloseListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      resetSearchBarCache(cacheCode);
      menuTabEventManager.off('close', menuTabCloseListener);
    }
  };
  const menuTabRefreshListener = ({ tabKey }) => {
    if (tabKey === activeTabKey) {
      // 刷新页面，增加延时以确保组件卸载时先执行设置缓存后重置缓存
      setTimeout(() => {
        resetSearchBarCache(cacheCode);
        menuTabEventManager.off('refresh', menuTabRefreshListener);
      });
    }
  };
  menuTabEventManager.on('close', menuTabCloseListener);
  menuTabEventManager.on('refresh', menuTabRefreshListener);
}
