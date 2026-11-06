import { getUserConfigInfo } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { fetchProductCardConfig } from 'services/homeService';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

// 商品卡片配置
export default function useProductCardConfig() {
  const defaultlist = [
    {
      elementType: 'SUPPLIER',
      row: 1,
      column: 1,
      enabledFlag: 1,
      rowLength: 1,
    },
    {
      enabledFlag: 1,
      row: 2,
      column: 1,
      rowLength: 1,
      elementType: 'SALES',
    },
    {
      enabledFlag: 1,
      rowLength: 1,
      row: 2,
      column: 2,
      elementType: 'ITEM',
    },
    {
      enabledFlag: 1,
      rowLength: 2,
      row: 2,
      column: 3,
      elementType: 'LABEL',
    },
    {
      enabledFlag: 0,
      rowLength: 1,
      row: 2,
      column: 4,
      elementType: 'STOCK',
    },
  ];
  const [productCardConfig, setproductCardConfig] = useState([]);
  useEffect(() => {
    if (getUserConfigInfo().productCardConfig === undefined) {
      fetchProductCardConfig()
        .then((res) => {
          let list = [];
          if (res.cardConfigFlag) {
            list = res?.productCardConfigList || [];
          } else {
            list = defaultlist;
          }
          setproductCardConfig(list);
          getDvaApp()._store.dispatch({
            type: 'global/update',
            payload: {
              productCardConfig: list,
            },
          });
        })
        .catch(() => {
          setproductCardConfig(defaultlist);
        });
    } else {
      setproductCardConfig(getUserConfigInfo().productCardConfig || []);
    }
  }, []);
  return productCardConfig;
}
