import React from 'react';
import { withRouter } from 'react-router-dom';
import * as HmallConfig from 'utils/api-config';
import * as Hmall from 'utils/utils';
import styles from './index.less';

class Spec extends React.Component {
  constructor(props) {
    super(props);
    const { productId, data: specInfo } = props;
    const filterStack = specInfo.map((dimObj) => {
      const { dim, saleAttrList } = dimObj;
      const selected = saleAttrList.find((idsObj) => {
        return idsObj.skuIds.includes(productId) || idsObj.skuIds.includes(String(productId));
      });
      return {
        dim, // 过滤的诶度 id
        ...selected, // 选中维度值的属性
      };
    });

    this.state = {
      currentProductId: Hmall.getNANId(productId),
      specInfo,
      filterStack, // 选择的维度列表
    };
    this.getProductIds = this.getProductIds.bind(this);
    this.getProducts = this.getProducts.bind(this);
    this.fetchDetail = this.fetchDetail.bind(this);
    this.addDimFilter = this.addDimFilter.bind(this);
    this.specAction = this.specAction.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, productId } = nextProps;
    const { specInfo, currentProductId } = prevState;
    const newState = {};

    if (data !== specInfo) {
      newState.specInfo = data;
    }

    if (productId !== currentProductId) {
      newState.currentProductId = Hmall.getNANId(productId);
    }

    if (Object.keys(newState).length === 0) {
      return null;
    } else {
      return newState;
    }
  }

  /**
   * 刷新当前页面，跳转到指定详情页面
   * @param {string} location - 跳转的商品详情地址
   */
  fetchDetail(location) {
    this.props.history.push(location);
    window.mallProductDetail = {
      address: this.props.currentAddress,
    };
    this.props.history.push('/refresh');
  }

  /**
   * 从过滤队列中获取交集的 id 列表
   * @param {Number} dim - 当前维度
   * @param {Object} idsObj - saleAttrList 对象
   * @param {Array} filterStack - 当前的过滤队列
   */
  getProductIds(dim, idsObj, filterStack) {
    const otherSkuIds = filterStack
      .filter((dimObj) => dimObj.dim !== dim)
      .map((dimObj) => dimObj.skuIds);
    const ret = otherSkuIds.reduce(
      (prev, curr) => prev.filter((i) => curr?.includes(i)),
      idsObj.skuIds
    );
    return ret;
  }

  /**
   * 向过滤队列添加一个过滤对象
   * @param {Number} dim - 当前维度
   * @param {Object} idsObj - saleAttrList 对象
   */
  addDimFilter(dim, idsObj, isDisabled = false) {
    const { filterStack = [] } = this.state;
    // const index = filterStack.findIndex(item => item.dim === dim);
    const { skuIds } = idsObj;

    if (skuIds.length === 1) {
      const { sourceFrom } = this.props;
      const url = `${HmallConfig.contextPath}/sigl/product-detail?productId=${skuIds[0]}&sourceFrom=${sourceFrom}`;
      this.fetchDetail(url);
    } else {
      const newDimFilter = {
        dim,
        ...idsObj,
      };
      if (isDisabled) {
        // 选的是禁用属性，则清空
        this.setState({
          filterStack: [newDimFilter],
        });
      } else if (filterStack.find((item) => item.dim === dim)) {
        // 选的是选过的规格，则替换
        this.setState({
          filterStack: filterStack.map((item) => (item.dim === dim ? newDimFilter : item)),
        });
      } else {
        // 选的是不同规格，则添加
        this.setState({
          filterStack: [...filterStack, newDimFilter],
        });
      }
    }
  }

  /**
   * 当前规格条件的动作
   * @param {Number} dim 当前维度
   * @param {Object} idsObj saleAttrList 对象
   */
  specAction(dim, idsObj, productIds) {
    // 若 skuIds 的长度大于 1，则应该添加选择过滤，否则可跳转到相应页面
    if (productIds.length > 1) {
      this.addDimFilter(dim, idsObj);
    } else {
      const { sourceFrom } = this.props;
      const url = `${HmallConfig.contextPath}/sigl/product-detail?productId=${productIds[0]}&sourceFrom=${sourceFrom}`;
      this.fetchDetail(url);
    }
  }

  getProducts(saleAttrList, dim) {
    const { filterStack } = this.state;
    const hasImage = saleAttrList.find((idsObj) => idsObj.imagePath);

    return (
      <ul className={`spec-products${hasImage ? ' spec-img-products' : ''}`}>
        {saleAttrList.map((idsObj) => {
          const { saleValue, imagePath } = idsObj;
          const productIds = this.getProductIds(dim, idsObj, filterStack);
          const currentDimFilter = filterStack.find((_dimObj) => _dimObj.dim === dim) || {};
          const isActive = currentDimFilter.saleValue === idsObj.saleValue;
          const { sourceFrom } = this.props;
          const image = (
            <div className="spec-img">
              <img
                alt=""
                style={{ width: '100%' }}
                src={Hmall.convertImg(imagePath, 9, sourceFrom)}
              />
            </div>
          );

          return (
            <li
              className={`product${isActive ? ' product-active' : ''}${
                productIds.length === 0 ? ' product-disable' : ''
              }`}
              key={saleValue}
            >
              {productIds.length > 0 ? (
                <a
                  title={saleValue}
                  className="product-link"
                  onClick={() => this.specAction(dim, idsObj, productIds)}
                >
                  {imagePath && image}
                  <span>{saleValue}</span>
                </a>
              ) : (
                <a
                  className="product-link product-link-disabled"
                  onClick={() => this.addDimFilter(dim, idsObj, true)}
                >
                  {imagePath && image}
                  <span>{saleValue}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { specInfo } = this.state;
    return (
      <div>
        <ul className={styles['product-spec']}>
          {specInfo.map((spec) => {
            const { saleName, dim, saleAttrList } = spec;
            return (
              <li className="spec-row" key={dim}>
                <div
                  className={`spec-title ${
                    Hmall.getCurrentLanguage() === 'zh_CN' ? 'spec-title-width' : ''
                  }`}
                  title={saleName}
                >
                  {saleName}
                </div>
                {this.getProducts(saleAttrList, dim)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default withRouter(Spec);
