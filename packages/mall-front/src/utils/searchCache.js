// 搜索比价缓存
export default {
  sessionKey: 'mall-search-compare-list',
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
        list: list?.map((m) => ({
          productId: m.productId,
          price: m.salePrice,
        })),
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
