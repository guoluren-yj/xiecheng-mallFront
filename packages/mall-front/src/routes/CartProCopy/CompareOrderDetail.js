import React, { useState } from 'react';
import { Icon, Radio, Tooltip, Button as C7nButton, Tag } from 'choerodon-ui';
import { Button, Select } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import qs from 'qs';

import Icons from 'components/Icons';
import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import { convertImg, getPrimaryColor, filterNullValueObject, openPage } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import cuxComponent from 'cuxTools/cuxComponent';
import './renderer.less';

function CompareOrderDetail(props) {
  const { cartItem, onCompareOk, compareLoading, setCompareVisible, readOnly, dataSet } = props;
  const { productId } = cartItem;
  const [page, setPage] = useState(0);
  const [productCompareList, setProductCompareList] = useState(
    dataSet.getCurrentCompareData(cartItem)
  );
  const [currentCompare, setCurrentCompare] = useState(productCompareList?.[0]);
  const [currentProduct, setCurrentProduct] = useState({});
  const {
    fullAddress,
    unitName,
    productCompareAssignList = [],
    addressId,
    unitLevelPath,
    regionId,
    lowerFlag,
    autoFlag,
    centralizedFlag,
    orderUserId,
    userId,
    priceDimensionKey,
    priceDimensionMap: dimensionValueMap,
  } = currentCompare || {};
  // 智能比价需要手选排序字段，默认没有排序字段
  const [sortField, setSortField] = useState(+autoFlag === 2 ? null : 'price');
  const [sortType, setSortType] = useState(+autoFlag === 1 || +autoFlag === 2 ? 'ASC' : ''); // ASC生序，DESC降序

  function handleMoreCompare(type) {
    const newPage = type === 'pre' ? page - 1 : page + 1;
    setPage(newPage);
    setCurrentCompare(productCompareList[newPage]);
  }

  function handleOk() {
    setCompareVisible(false);
    openComfirmModal({
      title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
      width: 560,
      children: intl
        .get('mallf.common.view.compareOkConfirm')
        .d('当前操作将会覆盖该商品已有的组织/地址等信息，请确认是否继续'),
      onOk: () => {
        onCompareOk(currentCompare, currentProduct.productId);
      },
    });
  }

  /**
   * 执行排序逻辑
   * @param {string} targetSortField - 排序字段：price-单价，skuPrice-折算单价
   * @param {string} targetSortType - 排序方向：ASC-升序，DESC-降序
   */
  function doSort(targetSortField, targetSortType) {
    if (!targetSortType) return;
    const newProductCompareList = productCompareList.map((compare) => ({
      ...compare,
      productCompareAssignList: productCompareAssignList.sort((a, b) => {
        const aValue = targetSortField === 'price' ? a.price : a.skuPrice;
        const bValue = targetSortField === 'price' ? b.price : b.skuPrice;
        return targetSortType === 'DESC' ? bValue - aValue : aValue - bValue;
      }),
    }));
    setProductCompareList(newProductCompareList);
  }

  /**
   * 切换排序方向（升序 <-> 降序）
   */
  function handleSort() {
    const newSortType = sortType === 'DESC' ? 'ASC' : 'DESC';
    setSortType(newSortType);
    doSort(sortField, newSortType);
  }

  /**
   * 切换排序字段，保持当前排序方向不变
   * @param {string} value - 排序字段：price-单价，skuPrice-折算单价
   */
  function handleSortFieldChange(value) {
    setSortField(value);
    doSort(value, sortType);
  }

  return (
    <div className="compare-order-datail">
      <div className="compare-title">
        <div style={{ flex: 1 }}>
          {+autoFlag === 1
            ? intl.get('mallf.common.view.autoComPareTitle').d('比价单(自动生成)')
            : intl.get('mallf.common.view.comPareTitle').d('比价单')}
        </div>
        <div className="compare-sort">
          {+autoFlag === 2 ? (
            <Select
              value={sortField}
              placeholder={intl.get('mallf.common.view.selectOrderBy').d('选择排序字段')}
              onChange={(value) => {
                handleSortFieldChange(value);
              }}
              clearButton={false}
              className="compare-sort-select"
            >
              <Select.Option value="price">
                {intl.get(`mallf.common.view.sortPrice`).d('按单价')}
              </Select.Option>
              <Select.Option value="skuPrice">
                {intl.get(`mallf.common.view.sortSkuPrice`).d('按折算单价')}
              </Select.Option>
            </Select>
          ) : (
            <span>{intl.get('mallf.common.view.priceSort').d('按价格排序')}</span>
          )}
          {!sortType ? (
            <span onClick={() => handleSort()}>
              <Icons type="icon-sort_list" />
            </span>
          ) : (
            <span onClick={() => handleSort()}>
              <Icons type={sortType === 'DESC' ? 'icon-descending_left' : 'icon-ascending_left'} />
              <Icons
                className="sort-right"
                type={sortType === 'DESC' ? 'icon-descending_right' : 'icon-ascending_right'}
              />
            </span>
          )}
        </div>
      </div>
      {!readOnly && (
        <div className="compare-info">
          {lowerFlag
            ? intl
                .get('mallf.common.view.lowerComPareInfo')
                .d('比价单内有价格更低的商品,替换将会覆盖原有商品信息')
            : intl.get('mallf.common.view.comPareOrderInfo').d('替换将会覆盖原有商品信息')}
        </div>
      )}
      <div className="compare-content">
        <div className="compare-content-top">
          <div className="compare-unit text-overflow" title={unitName}>
            <Icon type="domain" style={{ fontSize: 14, marginRight: 5, marginTop: -3 }} />
            {unitName}
          </div>
          <div className="compare-address text-overflow" title={fullAddress}>
            <Icon type="room" style={{ fontSize: 14, marginRight: 5, marginTop: -3 }} />
            {fullAddress}
          </div>
        </div>
        <Radio.Group name="compare">
          {productCompareAssignList
            .filter((n) => n.productId !== productId)
            .map((product) => {
              const {
                lowerAssignFlag, // 售价最低
                lowerPriceFlag, // 价格最低
                lowerSkuPriceFlag, // 折算价最低
              } = product;
              const ShowCompareTag = [lowerAssignFlag, lowerPriceFlag, lowerSkuPriceFlag].includes(
                1
              );
              return (
                <div className="compare-product">
                  {!readOnly && (
                    <Radio
                      value={product.productId}
                      style={{ margin: '10px 5px 0 0' }}
                      onChange={() => setCurrentProduct(product)}
                    />
                  )}
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
                      <div className="goods-price-info">
                        <div className="goods-price">
                          {product.currencySymbol}
                          {product.price}
                        </div>
                        <Tag
                          className="price-tag"
                          r-if={ShowCompareTag}
                          color={
                            lowerAssignFlag === 1 || lowerPriceFlag === 1 ? '#00B377' : '#1770E6'
                          }
                        >
                          {lowerAssignFlag === 1 &&
                            intl.get('mallf.common.view.minUnitPrice').d('售价最低')}
                          {lowerPriceFlag === 1 &&
                            intl.get('mallf.common.view.minPrice').d('价格最低')}
                          {lowerSkuPriceFlag === 1 &&
                            intl.get('mallf.common.view.minSkuPrice').d('折算价最低')}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </Radio.Group>
      </div>
      {productCompareList.length > 1 && (
        <div className="compare-moreinfo">
          <Icon
            type="error"
            style={{ fontSize: 14, color: getPrimaryColor(), marginTop: -3, marginRight: 5 }}
          />
          {intl.get('mallf.common.view.moreCompareInfo').d('当前商品有多个比价单，可切换进行查看')}
        </div>
      )}
      <div className="compare-footer">
        {!readOnly && (
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
        )}
        <Button style={{ height: 32 }} onClick={() => setCompareVisible(false)}>
          {intl.get(`mallf.common.button.cancel`).d('取消')}
        </Button>
        <Button
          style={{ height: 32, maxWidth: 198 }}
          onClick={() => {
            const params = {
              productId,
              addressId,
              regionId,
              levelPath: unitLevelPath,
              autoFlag: autoFlag || 0,
              centralizedFlag,
              userId,
              orderUserId,
              priceDimensionKey,
              dimensionValueMap,
            };
            openPage(`/price-compare?${qs.stringify(filterNullValueObject(params))}`);
          }}
        >
          {intl.get('mallf.common.button.viewCompareOrder').d('查看完整比价单')}
        </Button>
        {productCompareList.length > 1 && (
          <div className="more-compare">
            <Tooltip title={intl.get('mallf.common.view.preCompare').d('上一单')}>
              <C7nButton
                icon="expand_less"
                shape="circle-outline"
                funcType="flat"
                disabled={page === 0}
                onClick={() => handleMoreCompare('pre')}
              />
            </Tooltip>
            <Tooltip title={intl.get('mallf.common.view.nextCompare').d('下一单')}>
              <C7nButton
                disabled={page === productCompareList.length - 1}
                icon="expand_more"
                shape="circle-outline"
                funcType="flat"
                onClick={() => handleMoreCompare('next')}
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}

export default cuxComponent({ path: 'CartProCopy/CompareOrderDetail' })(CompareOrderDetail);
