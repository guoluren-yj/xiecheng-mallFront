import { DataSet } from 'choerodon-ui/pro';

import { getUserConfigInfo } from 'utils/utils';

import { fetchBatchProductListService } from 'services/newCartService';

export default class ProductListDataSet extends DataSet {
  constructor(props, listProps) {
    super(props);
    const { templateId } = listProps || {};
    const { userId } = getUserConfigInfo();
    this.params = {
      templateId,
      ownerId: userId,
    };
    this.selectProductList = [];
  }

  // 查询
  async queryData(params) {
    let res = [];
    this.status = 'loading';
    try {
      res = await fetchBatchProductListService({ ...this.params, ...params });
    } catch {
      this.status = 'ready';
    }
    this.status = 'ready';
    this.productList = res;
    this.loadData(res);
  }

  // 前端根据商品名模糊过滤
  searchProduct(value) {
    if (value) {
      this.searchValue = value;
      const productList = this.productList || [];
      const newList = productList.filter((product) => product.productName.includes(value)) || [];
      this.loadData(newList);
    } else {
      this.searchValue = null;
      this.queryData();
    }
  }

  // 勾选商品
  selectProduct({ check, product }) {
    if (check) {
      this.selectProductList.push(product);
    } else {
      this.selectProductList = this.selectProductList.filter((n) => n.cartId !== product.cartId);
    }
  }

  // 确定选择商品
  handleSelectProduct(alloctionDs) {
    const products = this.selectProductList || [];
    const params = alloctionDs.getAddInfoListParams(products, false);
    alloctionDs.batchFetch({ ...params, cartHeaderDTOList: alloctionDs.handleCartHeaderDTOList() });
  }
}
