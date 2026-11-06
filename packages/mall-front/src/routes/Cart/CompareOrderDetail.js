import React, { useState, useEffect } from 'react';
import { Radio } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import Icons from 'components/Icons';
import { convertImg, openPage } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';

export default function CompareOrderDetail(props) {
  const {
    cartItem,
    onCompareOk,
    compareLoading,
    setCompareVisible,
    productCompareAssignList = [],
    setLowerProduct,
    handleCompareChange, // 切换商品
  } = props;
  const { productId } = cartItem;
  const [currentProduct, setCurrentProduct] = useState({});
  const [productCompareList, setProductCompareList] = useState([]);
  const [sortType, setSortType] = useState(cartItem.productCompare?.autoFlag === 1 ? 'DESC' : ''); // ASC降序，DESC升序
  const { addressId, levelPath, regionId, lowerFlag } = cartItem;

  useEffect(() => {
    setProductCompareList(productCompareAssignList);
  }, [productCompareAssignList]);

  function handleOk() {
    setCompareVisible(false);
    openComfirmModal({
      title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
      width: 560,
      children: intl
        .get('mallf.common.view.compareOkConfirm')
        .d('当前操作将会覆盖该商品已有的组织/地址等信息，请确认是否继续'),
      onOk: () => {
        onCompareOk(currentProduct);
      },
    });
  }

  function handlePriceSort() {
    const newProductCompareList = productCompareList.sort((a, b) =>
      sortType === 'DESC' ? b.price - a.price : a.price - b.price
    );
    setProductCompareList(newProductCompareList);
    setSortType(sortType === 'DESC' ? 'ASC' : 'DESC');
  }

  return (
    <div className="compare-product">
      <div className="compare-order-datail">
        <div className="compare-title">
          <div style={{ flex: 1 }}>
            {intl.get('mallf.common.view.comPareTitle').d('比价单')}
            {cartItem.productCompare?.autoFlag === 1
              ? `(${intl.get('mallf.cart.view.compare.autoFlag').d('自动生成')})`
              : `(${intl.get('mallf.cart.view.compare.mumaFlag').d('手动添加')})`}
          </div>
          <div className="compare-sort" onClick={() => handlePriceSort()}>
            <span>{intl.get('mallf.common.view.priceSort').d('按价格排序')}</span>
            {!sortType ? (
              <span>
                <Icons type="icon-sort_list" />
              </span>
            ) : (
              <span>
                <Icons type={sortType === 'ASC' ? 'icon-descending_left' : 'icon-ascending_left'} />
                <Icons
                  className="sort-right"
                  type={sortType === 'ASC' ? 'icon-descending_right' : 'icon-ascending_right'}
                />
              </span>
            )}
          </div>
        </div>
        <div className="compare-info">
          {lowerFlag
            ? intl
                .get('mallf.common.view.lowerComPareInfo')
                .d('比价单内有价格更低的商品,替换将会覆盖原有商品信息')
            : intl.get('mallf.common.view.comPareOrderInfo').d('替换将会覆盖原有商品信息')}
        </div>
        <div className="compare-content">
          <Radio.Group name="compare">
            {productCompareList.map((product, i) => {
              return (
                <div className="compare-product">
                  <Radio
                    value={product.productId}
                    style={{ margin: '10px 5px 0 20px' }}
                    onChange={(e) => {
                      setCurrentProduct(product);
                      handleCompareChange(i, e.target.value);
                    }}
                  />
                  <div className="goods-content">
                    <div className="goods-img">
                      <Link
                        to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceFrom}`}
                      >
                        <Image
                          value={convertImg(product.imagePath, 1, product.sourceFrom)}
                          width={40}
                          height={40}
                        />
                        {product?.lowerAssignFlag === 1 && (
                          <div className="lower-price">
                            {intl.get('mallf.common.view.lowerPrice').d('最低价')}
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="goods-product-name text-overflow">
                      <Link
                        title={product.productName}
                        className="goods-name"
                        to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceFrom}`}
                      >
                        {product.productName}
                      </Link>
                      <div className="goods-price">
                        {product.currencySymbol}
                        {product.price}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Radio.Group>
        </div>
        <div className="compare-footer">
          <Button
            waitType="throttle"
            wait={500}
            color="primary"
            loading={compareLoading}
            disabled={isEmpty(currentProduct)}
            style={{ height: 32 }}
            onClick={() => handleOk()}
          >
            {intl.get('hzero.common.button.confrim').d('确定')}
          </Button>
          <Button
            style={{ height: 32 }}
            onClick={() => {
              setCompareVisible(false);
              setLowerProduct([]);
            }}
          >
            {intl.get(`mallf.common.button.cancel`).d('取消')}
          </Button>
          <Button
            style={{ height: 32, maxWidth: 198 }}
            onClick={() =>
              openPage(
                `/price-compare?productId=${productId}&addressId=${addressId}&regionId=${regionId}&levelPath=${levelPath}&autoFlag=${
                  cartItem.productCompare?.autoFlag || 0
                }`
              )
            }
          >
            {intl.get('mallf.common.button.viewCompareOrder').d('查看完整比价单')}
          </Button>
        </div>
      </div>
    </div>
  );
}
