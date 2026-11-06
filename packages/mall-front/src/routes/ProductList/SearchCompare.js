// 搜索比价类
import { observable, action } from 'mobx';
import { getCompareConfig } from 'utils/configUtils';
import searchCache from 'utils/searchCache';
import { fetchProduct } from 'services/productListService';

export default class SearchCompare {
  // 搜索查询状态：ready|loading
  @observable status = 'ready';

  @action
  async query(params, searchUuid) {
    // 1 不启用比价  2 物料比价 3 手动比价 4 搜索比价
    const { compareRule, upperLimit, labelCodeList, supplierNameList } = getCompareConfig();
    // 不开启搜索比价（价格排序、二次搜索）
    const filterQueryFields = ['priceOrder', 'minPrice', 'maxPrice', 'termKeyword'];
    const disabledQuery = filterQueryFields.some((field) => params[field]);
    if (disabledQuery || compareRule !== 4) {
      searchCache.clear();
      return false;
    }
    try {
      this.status = 'loading';
      const res = await fetchProduct({
        ...params,
        onlyInStock: 1,
        receiveFlag: 0,
        needAggregateFlag: 0,
        excludeLabelList: labelCodeList || [],
        excludeCompanyList: supplierNameList || [],
        scrollFetchSize: upperLimit || 30,
      });
      if (res) {
        const { productList } = res || {};
        searchCache.set(productList.content || [], searchUuid);
      }
    } finally {
      this.status = 'ready';
    }
  }

  clearCache() {
    searchCache.clear();
  }
}
