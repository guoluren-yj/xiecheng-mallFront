const sessionCache = {
  sessionKey: 'onefosun-compare-list',
  uuid: null,
  set(list, uuid) {
    // 设置会话缓存
    if (uuid) {
      this.uuid = uuid;
    }
    sessionStorage.setItem(
      this.sessionKey,
      JSON.stringify({
        uuid: uuid || this.uuid,
        list,
      })
    );
  },
  get(uuid) {
    // 拿到缓存的商品数据[{ productId, price }]
    let item = {};
    try {
      item = JSON.parse(sessionStorage.getItem(this.sessionKey) || {});
    } catch (e) {
      item = {};
    }
    const _uuid = uuid || this.uuid;
    if (item.uuid && item.uuid === _uuid) {
      return item.list;
    }
    return undefined;
  },
  clear() {
    // 清除uuid与缓存
    this.uuid = null;
    sessionStorage.removeItem(this.sessionKey);
  },
};

// 是否参与比价
function isCompare({ receiveFlag, labelList }) {
  // 领用
  const isReceive = receiveFlag === 1;
  // 标签属于 jc、st
  const labelInclude = (labelList || []).some((s) => ['jc', 'st'].includes(s.labelCode));
  return !isReceive && !labelInclude;
}

// 搜索商品缓存
export function cacheProducts({ products, queryParams, searchUuid }) {
  // 只有存在价格升序才进行比价缓存设置,否则清除
  if (queryParams.priceOrder === 'asc' && searchUuid) {
    const list = [];
    (products || []).forEach((f) => {
      // 10个
      if (list.length < 10 && isCompare(f)) {
        list.push({
          productId: f.productId,
        });
      }
    });
    sessionCache.set(list, searchUuid);
  } else {
    sessionCache.clear();
  }
}

// 商品价格信息添加
export function addProductPrice({ saleList }) {
  const cacheCompareList = sessionCache.get() || [];
  const newList = cacheCompareList.map((m) => {
    const findSku = saleList?.find((s) => m.productId === s.skuId); // 获取相应价格服务销售价
    return {
      ...m,
      price: findSku ? findSku.sellPrice : m.price,
    };
  });
  sessionCache.set(newList);
}

// 加购参数获取
export function getCartParams({ params, extraInfo }) {
  const { productId, searchUuid, receiveFlag } = params || {};
  const { price, labelList } = extraInfo || {};
  // 当前商品
  const curProduct = { productId, price };
  // 比价商品
  const compareList = sessionCache.get(searchUuid) || [];
  const cartParams = { ...params };
  if (isCompare({ receiveFlag, labelList }) && compareList.length > 0) {
    const searchProductList = [curProduct];
    compareList.forEach((f) => {
      // 过滤本身的商品以及最终最多只有10个
      if (f.productId !== productId && searchProductList.length < 10) {
        searchProductList.push(f);
      }
    });
    cartParams.searchProductList = searchProductList;
  }
  return cartParams;
}
