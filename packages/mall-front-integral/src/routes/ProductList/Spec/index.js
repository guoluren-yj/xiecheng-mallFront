import React from 'react';
import { InputNumber, Button, Spin } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import * as Hmall from 'utils/utils';
import intl from 'utils/intl';
import { getProductSku } from 'services/productDetailService';
import styles from './index.less';

class Spec extends React.Component {
  constructor(props) {
    super(props);
    const { productId } = props;

    this.state = {
      currentProductId: Hmall.getNANId(productId),
      specInfo: [],
      filterStack: [], // 选择的维度列表
      skuIds: [productId],
      loading: true,
    };
    this.getProductIds = this.getProductIds.bind(this);
    this.getProducts = this.getProducts.bind(this);
    this.getSkuIds = this.getSkuIds.bind(this);
    this.addDimFilter = this.addDimFilter.bind(this);
    this.specAction = this.specAction.bind(this);
    this.getProductSpu = this.getProductSpu.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { productId } = nextProps;
    const { currentProductId } = prevState;
    const newState = {};

    if (productId !== currentProductId) {
      newState.currentProductId = Hmall.getNANId(productId);
    }

    if (Object.keys(newState).length === 0) {
      return null;
    } else {
      return newState;
    }
  }

  componentDidMount() {
    this.getProductSpu();
  }

  getProductSpu() {
    const { product, productId } = this.props;
    const { regionId } = Hmall.getUserConfigInfo();
    getProductSku({ sourceFrom: product.sourceFrom, productId, regionId }).then((res) => {
      if (res) {
        const newSimilarData = res.map((p) => ({
          dim: p.dim,
          saleName: p.saleName,
          saleAttrList: p.saleAttr,
        }));
        const filterStack = newSimilarData.map((dimObj) => {
          const { dim, saleAttrList } = dimObj;
          const selected = saleAttrList.find((idsObj) => {
            return idsObj.skuIds.includes(productId) || idsObj.skuIds.includes(String(productId));
          });
          return {
            dim, // 过滤的诶度 id
            ...selected, // 选中维度值的属性
          };
        });
        this.setState({
          filterStack,
          specInfo: newSimilarData,
          loading: false,
        });
      }
    });
  }

  /**
   * 获取skudIds
   */
  getSkuIds(filterStack) {
    const newSkuIds = filterStack
      .map((n) => n.skuIds)
      .reduce((prev, curr) => prev.filter((i) => curr?.includes(i)), filterStack[0].skuIds);
    this.setState({
      skuIds: newSkuIds,
    });
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
    if (otherSkuIds.length > 0) {
      const ret = otherSkuIds.reduce(
        (prev, curr) => prev.filter((i) => curr?.includes(i)),
        idsObj.skuIds
      );
      return ret;
    }
    return [];
  }

  /**
   * 向过滤队列添加一个过滤对象
   * @param {Number} dim - 当前维度
   * @param {Object} idsObj - saleAttrList 对象
   */
  addDimFilter(dim, idsObj) {
    const newDimFilter = {
      dim,
      ...idsObj,
    };
    this.setState(
      {
        filterStack: [newDimFilter],
      },
      () => this.getSkuIds([newDimFilter])
    );
  }

  /**
   * 当前规格条件的动作
   * @param {Number} dim 当前维度
   * @param {Object} idsObj saleAttrList 对象
   */
  specAction(dim, idsObj) {
    const { filterStack } = this.state;
    const addDimFilter = {
      dim,
      ...idsObj,
    };
    let newDimFilter = filterStack;
    // 替换当前dim维度
    if (filterStack.find((n) => n.dim === dim)) {
      newDimFilter = filterStack.map((n) => {
        return n.dim === dim ? addDimFilter : n;
      });
    } else {
      // 新增dim维度
      newDimFilter.push(addDimFilter);
    }
    this.setState(
      {
        filterStack: newDimFilter,
      },
      () => this.getSkuIds(newDimFilter)
    );
  }

  getProducts(saleAttrList, dim) {
    const { filterStack, specInfo = [] } = this.state;
    const hasImage = saleAttrList.find((idsObj) => idsObj.imagePath);

    return (
      <ul className={`spec-products${hasImage ? ' spec-img-products' : ''}`}>
        {saleAttrList.map((idsObj) => {
          const { saleValue, imagePath } = idsObj;
          const productIds = this.getProductIds(dim, idsObj, filterStack);
          const currentDimFilter = filterStack.find((_dimObj) => _dimObj.dim === dim) || {};
          const isActive =
            currentDimFilter.saleValue === idsObj.saleValue ||
            (filterStack.length === 1 &&
              filterStack[0].skuIds.toLocaleString() === idsObj.skuIds.toLocaleString());
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
          const disabledFlag = !isActive && productIds.length === 0 && specInfo.length > 1;

          return (
            <li
              className={`product${isActive ? ' product-active' : ''}${
                disabledFlag ? ' product-disable' : ''
              }`}
              key={saleValue}
            >
              {productIds.length > 0 ? (
                <a
                  title={saleValue}
                  className="product-link"
                  onClick={() =>
                    this.specAction(dim, {
                      ...idsObj,
                      // skuIds: productIds,
                    })
                  }
                >
                  {imagePath && image}
                  <span>{saleValue}</span>
                </a>
              ) : (
                <a
                  className="product-link product-link-disabled"
                  onClick={() => this.addDimFilter(dim, idsObj)}
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
    const { specInfo, skuIds, loading } = this.state;
    const {
      product,
      quantityObj,
      setQuantityObj,
      flyCart,
      addCart,
      spining,
      setSpecVisible,
      product: { maxPurchaseQuantity, minPurchaseQuantity, uomPrecision },
    } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={styles['product-spec']}>
          <ul className="product-spec-content">
            {specInfo.map((spec) => {
              const { saleName, dim, saleAttrList } = spec;
              return (
                <li className="spec-row" key={dim}>
                  <div className="spec-title" title={saleName}>
                    {saleName}
                  </div>
                  {this.getProducts(saleAttrList, dim)}
                </li>
              );
            })}
            <li className="spec-row">
              <div className="spec-title">{intl.get('mallf.common.view.num').d('数量')}</div>
              <InputNumber
                style={{ width: 100, marginBottom: 5 }}
                min={1}
                max={maxPurchaseQuantity}
                defaultValue={minPurchaseQuantity || 1}
                value={quantityObj[skuIds[0]] || 1}
                step={uomPrecision ? Hmall.getPrecision(uomPrecision) : 1}
                precision={uomPrecision || 0}
                disabled={skuIds.length !== 1}
                onChange={(val) => {
                  setQuantityObj({
                    ...quantityObj,
                    [skuIds[0]]: val || 1,
                  });
                }}
              />
            </li>
          </ul>
          <div className="spec-footer">
            <Button
              loading={spining}
              disabled={skuIds.length !== 1}
              className="spec-footer-button"
              onClick={() => addCart({ ...product, productId: skuIds[0] }, flyCart)}
            >
              {intl.get('mallf.common.model.addToCart').d('加入购物车')}
            </Button>
            <Button
              style={{ marginLeft: 10, border: '1px solid rgba(0, 0, 0, 0.2)' }}
              onClick={() => setSpecVisible(false)}
            >
              {intl.get(`mallf.common.button.cancel`).d('取消')}
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}

export default withRouter(Spec);
