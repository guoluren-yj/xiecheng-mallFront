import React from 'react';
import { getStorage, setStorage } from 'utils/utils';
import { getViewTypeStorageKey } from 'utils/configUtils';

export function invoiceOrgIdDisabled() {
  return true;
}

export function addressCuxRender() {
  return <></>;
}

export function cuxHandleOuChange() {}

export function getDefaultTabKey() {
  const newTabKey = 2;
  const oldTabKey = getStorage(getViewTypeStorageKey());
  if (!oldTabKey) {
    // 首次没有缓存明细，让拼单结算默认也为明细视图
    setStorage(getViewTypeStorageKey(), newTabKey);
  }
  return newTabKey;
}
