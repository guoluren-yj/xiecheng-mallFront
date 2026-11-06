import React, { useRef, useState, useMemo } from 'react';
import { Tooltip, InputNumber, Icon, Popover } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import uuidV4 from 'uuid/v4';
import { getPrecision, numberRender } from 'utils/utils';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview, { SiglPrice } from 'components/LabelPreview';
import { SupplierComponent } from 'utils/renderer';
import ProductCard from 'components/ProductCard';
import useParabola from 'hooks/useParabola';
import styles from 'mall-front/lib/routes/ProductList/Product.less';
import Spec from 'mall-front/lib/routes/ProductList/Spec';

export default function Product(props) {
  const blockBtnRef = useRef();
  const lineBtnRef = useRef();
  const {
    defaultQuantity,
    listType = 'block',
    hasCompare,
    uomName,
    supplierCompanyName,
    itemCode,
    imagePath,
    price,
    hasPrice,
    productName,
    productPath,
    compareEvent,
    quantityValue = 1,
    maxPurchaseQuantity,
    minPurchaseQuantity,
    onChange,
    add,
    minus,
    stockDesc,
    addCart,
    isCATA,
    onCataStock,
    offCataStock,
    // sourceFrom,
    status: { inStock, noStock: nostock, subStock, saleEnable },
    labels = {},
    quantityObj,
    setQuantityObj,
    productId,
    uomPrecision, // 是否支持小数
    invalideNum,
    product,
    dispatch,
    spining,
    currencySymbol,
    productCardConfig,
    hasPlatformProduct,
  } = props;
  const [specVisible, setSpecVisible] = useState(false);
  const ball = useParabola({
    startRef: listType === 'block' ? blockBtnRef : lineBtnRef,
    endRef: window.miniCartRef,
    flyOuterStyle: {
      transition: 'transform 1.5s',
    },
    flyInnerStyle: {
      transition: 'transform 1.5s',
    },
    runTime: 1500,
    imagePath,
  });

  function flyCart() {
    ball.running();
    dispatch({
      type: 'global/update',
      payload: { showMiniCart: true },
    });
  }

  const uuid = useMemo(() => uuidV4(), []);
  const noStock = offCataStock ? false : nostock;
  //   const [state, setState] = useSetState({});
  const addDisable = quantityValue >= maxPurchaseQuantity;
  const minusDisable = quantityValue <= 1 || !quantityValue || quantityValue <= minPurchaseQuantity;
  const isAddCart = ((!noStock && (!isCATA || onCataStock)) || offCataStock) && saleEnable === 1;
  const disableCompare = String(price)?.includes('*');
  const InputCount = (
    <>
      <input
        className={`${!isAddCart ? 'disable' : ''}`}
        type="text"
        defaultValue={minPurchaseQuantity || defaultQuantity}
        value={
          // || defaultQuantity
          uomPrecision ? quantityObj[productId] || quantityValue : quantityValue
        }
        onChange={(e) => {
          onChange(e.target.value);
        }}
        id={uuid}
        onFocus={() => {
          document.getElementById(`${uuid}`).select();
        }}
      />
      <div className={`btn-box ${!isAddCart ? 'disable' : ''}`}>
        <div
          className={`plus count-btn ${addDisable || !isAddCart ? 'disable' : ''}`}
          onClick={addDisable || !isAddCart ? null : add}
        >
          <Icons size={12} type="pull" />
        </div>
        <div
          style={{ borderTop: '1px solid #e8e8e8' }}
          className={`minus count-btn ${minusDisable || !isAddCart ? 'disable' : ''}`}
          onClick={minusDisable || !isAddCart ? null : minus}
        >
          <Icons size={12} type="down" />
        </div>
      </div>
    </>
  );

  const { productLabelDTOList = [] } = labels; // 商品标签
  const labelList =
    productLabelDTOList?.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;
  const isOnlyRead = productLabelDTOList?.some((p) => p.labelCode === 'CZQX001');
  const specProps = {
    product,
    productId,
    quantityObj,
    quantityValue,
    setQuantityObj,
    flyCart,
    addCart,
    spining,
    setSpecVisible,
  };
  return (
    <>
      <p
        className={classnames({
          [styles['line-product']]: true,
          'display-none': listType === 'block',
          [styles['line-product-noStock']]: noStock,
          [styles['has-platform-product']]: hasPlatformProduct,
        })}
      >
        <div className="line-product-img">
          <Link to={productPath}>
            <Image value={imagePath} width={66} height={66} />
          </Link>
        </div>
        <div className="line-product-name-box">
          <p className="line-product-name">
            <SupplierComponent showCataIcon={isCATA}>
              {supplierCompanyName && (
                <span className="product-supplierCompany">
                  {isCATA && (
                    <Tooltip
                      title={intl.get('mallf.productList.view.common.CATA.product').d('目录化商品')}
                    >
                      <Icon className="cata-icon" type="chrome_reader_mode" />
                    </Tooltip>
                  )}
                  <span
                    className="product-supplierCompanyName text-overflow"
                    title={supplierCompanyName}
                  >
                    {supplierCompanyName}
                  </span>
                </span>
              )}
            </SupplierComponent>
            <Link title={productName} to={productPath}>
              {productName}
            </Link>
          </p>
          <p className="product-itemCode">
            <span className="buy-quality text-overflow">
              {intl.get(`mallf.productList.view.productList.salesVolume`).d('销量')}:{' '}
              <b>
                {product.quantity > 10000
                  ? intl
                      .get('mallf.productList.view.saleQuality.w', {
                        value:
                          Math.floor(product.quantity / 10000) > 999
                            ? 999
                            : Math.floor(product.quantity / 10000),
                      })
                      .d(
                        `${
                          Math.floor(product.quantity / 10000) > 999
                            ? 999
                            : Math.floor(product.quantity / 10000)
                        }万+`
                      )
                  : Math.round(product.quantity || 0)}
              </b>
            </span>
            <span className="buy-itemCode text-overflow">
              <Tooltip
                title={`${intl.get(`mallf.productList.view.item.code`).d('物料编码')}: ${itemCode}`}
              >
                {itemCode}
              </Tooltip>
            </span>
          </p>
          <div className="tags-box">
            {(!isEmpty(labelList) ||
              product.agreementBusinessType === 'POINTS' ||
              product.deliveryTypeMeaning) && (
              <div className="product-label center-content">
                {product.deliveryTypeMeaning && (
                  <LabelPreview code="JDSEND" desc={product.deliveryTypeMeaning} />
                )}
                {product.agreementBusinessType === 'POINTS' && (
                  <LabelPreview
                    code="E"
                    value={intl.get('mallf.productList.view.sigl.product').d('积分商品')}
                  />
                )}
                {labelList.map((n) => (
                  <LabelPreview code={n.labelColorCode} value={n.labelName} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="line-product-btnCon">
          <div className="line-product-btns" ref={lineBtnRef}>
            {(inStock || offCataStock) && saleEnable === 1 && (
              <div className="btns-item">
                <Button
                  color="primary"
                  icon="add_shopping_cart-o"
                  onClick={() => {
                    if (isAddCart) {
                      addCart(undefined, flyCart);
                    }
                  }}
                  funcType="flat"
                >
                  {intl.get('mallf.productList.model.addToCart').d('加入购物车')}
                </Button>
              </div>
            )}
            <div
              r-if={product.agreementBusinessType !== 'RECEIVE'}
              className="btns-item"
              title={
                hasCompare
                  ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                  : intl.get(`mallf.productList.model.btn.compare`).d('对比')
              }
            >
              {hasPrice && (
                <Button
                  color="primary"
                  funcType="flat"
                  icon="bar_chart"
                  onClick={compareEvent}
                  disabled={disableCompare}
                >
                  {hasCompare
                    ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                    : intl.get(`mallf.productList.model.btn.compare`).d('对比')}
                </Button>
              )}
            </div>
            {subStock && (
              <div className="btns-item">
                <Button
                  type="primary"
                  icon="watch_later-o"
                  onClick={() => {
                    if (isAddCart) {
                      addCart(undefined, flyCart);
                    }
                  }}
                >
                  {intl.get('mallf.productList.view.reservation').d('预定')}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="line-product-count">
          <InputNumber
            disabled={noStock}
            min={minPurchaseQuantity}
            max={maxPurchaseQuantity}
            defaultValue={minPurchaseQuantity || 1}
            step={uomPrecision ? getPrecision(uomPrecision) : 1}
            precision={uomPrecision || 0}
            value={uomPrecision ? quantityObj[productId] || quantityValue || 1 : quantityValue || 1}
            onChange={(e) => {
              onChange(e);
            }}
            formatter={(value) => {
              if (!isNaN(+value) && String(value)?.endsWith('0')) {
                return +value;
              } else {
                return value;
              }
            }}
          />
          {noStock && (
            <p style={{ color: '#666666', marginTop: 5 }}>
              {intl.get(`mallf.productList.model.noStock`).d('无货')}
            </p>
          )}
        </div>
        <div className="line-product-price price-color">
          <span>
            {currencySymbol || ''}
            <span className="price">{numberRender([product, 'sellPrice'])}</span>
          </span>
          {uomName && <span className="uomName">/{uomName}</span>}
          <SiglPrice style={{ marginLeft: 8 }} pointPrice={product.pointPrice} />
        </div>
      </p>
      <div
        className={classnames({
          [styles['block-product']]: true,
          'display-none': listType === 'line',
          [styles['has-platform-product']]: hasPlatformProduct,
        })}
      >
        <ProductCard
          productCardConfig={productCardConfig}
          product={{ ...product, labelList, uomName }}
          style={isOnlyRead ? { borderBottom: 'none' } : {}}
        />
        <div className={styles['product-footer']}>
          {!isOnlyRead && (
            <>
              <div
                r-if={product.agreementBusinessType !== 'RECEIVE'}
                className={classnames({
                  [styles['compare-btn']]: true,
                  [styles['compare-disable-btn']]: disableCompare,
                })}
                onClick={hasPrice && !disableCompare ? compareEvent : () => {}}
              >
                {hasPrice
                  ? hasCompare
                    ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                    : intl.get(`mallf.productList.model.btn.compare`).d('对比')
                  : '...'}
              </div>
              <div
                className={classnames({
                  [styles['input-number-box']]: true,
                  [styles['input-number-receive-box']]: product.agreementBusinessType === 'RECEIVE',
                })}
              >
                {InputCount}
              </div>
              <Popover
                title={intl.get('mallf.productList.model.addToCart').d('加入购物车')}
                content={<Spec {...specProps} />}
                placement="top"
                visible={specVisible}
                onVisibleChange={(vis) => setSpecVisible(vis)}
                trigger={product.similarProduct?.length > 1 && !invalideNum ? 'click' : ''}
              >
                <div
                  ref={blockBtnRef}
                  id={`product-list-add-btn-${productId}`}
                  className={`add-cart-btn text-overflow ${
                    noStock ||
                    !stockDesc ||
                    invalideNum ||
                    (!price && price !== 0) ||
                    saleEnable !== 1
                      ? 'disable'
                      : ''
                  } ${subStock ? 'subStock' : ''}`}
                  onClick={() => {
                    if (
                      !(noStock || !stockDesc || invalideNum || (!price && price !== 0)) &&
                      !(product.similarProduct?.length > 1) &&
                      saleEnable === 1
                    ) {
                      addCart(undefined, flyCart);
                    }
                  }}
                >
                  {stockDesc || '...'}
                </div>
              </Popover>
            </>
          )}
        </div>
      </div>
    </>
  );
}
