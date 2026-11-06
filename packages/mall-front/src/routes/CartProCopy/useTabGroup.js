import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import intl from 'utils/intl';
import { getStorage, setStorage } from 'utils/utils';
import { getViewTypeStorageKey } from 'utils/configUtils';
import CuxFn from '@/cuxTools/cuxFn';

export default function useTabGroup({ centralizedFlag, centralizedOrderFlag, tabChange }) {
  const defaultTabKey = CuxFn({
    name: 'CartProCopy-fn-defaultTabKey',
  })(() => 1);
  const [tabKey, setTabKey] = useState(getStorage(getViewTypeStorageKey()) || defaultTabKey);
  const groupTabKeys = useRef({
    cart: 1,
    basket: 3,
  });

  const isBasket = [3, 4].includes(tabKey);

  useEffect(() => {
    const groupTab = isBasket ? 'basket' : 'cart';
    groupTabKeys.current[groupTab] = tabKey;
  }, [tabKey, isBasket]);

  const groups = useMemo(
    () =>
      [
        {
          title: intl.get(`mallf.common.view.common.cart`).d('购物车'),
          value: 'cart',
        },
        {
          title: intl.get(`mallf.common.view.common.basket`).d('拼单篮'),
          value: 'basket',
          show: !!centralizedFlag || !!centralizedOrderFlag,
        },
      ].filter((f) => f.show !== false),
    [centralizedFlag, centralizedOrderFlag]
  );

  // tabs
  const tabs = useMemo(
    () =>
      [
        { title: intl.get('mallf.common.cart.viewType1').d('简易视图'), type: 'cart', value: 1 },
        { title: intl.get('mallf.common.cart.viewType2').d('明细视图'), type: 'cart', value: 2 },
        {
          title: intl.get('mallf.common.cart.demander').d('提需人'),
          type: 'basket',
          value: 3,
          show: !!centralizedFlag,
        },
        {
          title: intl.get('mallf.common.cart.orderPerson').d('下单人'),
          type: 'basket',
          value: 4,
          show: !!centralizedOrderFlag,
        },
      ].filter((f) => f.show !== false),
    [centralizedFlag, centralizedOrderFlag]
  );

  const onTabChange = useCallback(
    ({ value, type, item }) => {
      let newTabKey = type === 'group' ? groupTabKeys.current[value] : value;
      const newGroupKey = type === 'group' ? value : item.type;
      if (newTabKey === tabKey) return;
      if (!centralizedOrderFlag && newTabKey === 4) {
        // 无下单人权限切换提需人
        newTabKey = 3;
      }
      setStorage(getViewTypeStorageKey(), newTabKey);
      tabChange(newTabKey, newGroupKey);
      setTabKey(newTabKey);
    },
    [tabKey, centralizedOrderFlag]
  );

  // 重置为1
  const onResetTab = useCallback((resetKey = 1) => {
    setStorage(getViewTypeStorageKey(), resetKey);
    setTabKey(resetKey);
  }, []);

  return {
    tabs,
    tabKey,
    groups,
    isBasket,
    initKey: getStorage(getViewTypeStorageKey()) || 1,
    onTabChange,
    onResetTab,
  };
}
