import React, { useRef, useState } from 'react';
import { Tooltip, InputNumber, Icon, Popover } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

import { getPrecision, numberRender } from 'utils/utils';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview from 'components/LabelPreview';
import useParabola from 'hooks/useParabola';
import ProductCard from 'components/ProductCard';
import { SupplierComponent } from 'utils/renderer';
import { notAddCartMessage } from 'utils/addNewCart';
import Spec from './Spec';
import styles from './Product.less';

export default function Product(props) {
  const blockBtnRef = useRef();
  const lineBtnRef = useRef();
  const {
    productCardConfig,
    defaultQuantity,
    listType = 'block',
    // uomName,
    supplierCompanyName,
    itemCode,
    imagePath,
    price,
    productName,
    productPath,
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
  } = props;
  const {
    stockState,
    sourceFromCode,
    soldOutType, // 不可售类型
    operationAuth,
  } = product || {};
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
  const noStock = offCataStock ? false : nostock;
  //   const [state, setState] = useSetState({});
  const addDisable = quantityValue >= maxPurchaseQuantity;
  const minusDisable = quantityValue <= 1 || !quantityValue || quantityValue <= minPurchaseQuantity;
  const isAddCart = ((!noStock && (!isCATA || onCataStock)) || offCataStock) && saleEnable === 1;
  const InputCount = (
    <>
      <input
        className={`${!isAddCart ? 'disable' : ''}`}
        type="text"
        defaultValue={minPurchaseQuantity || defaultQuantity}
        value={
          uomPrecision
            ? quantityObj[productId] || quantityValue || defaultQuantity
            : quantityValue || defaultQuantity
        }
        onChange={(e) => {
          onChange(e.target.value);
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
    productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;
  const specProps = {
    product,
    productId,
    quantityObj,
    setQuantityObj,
    flyCart,
    addCart,
    spining,
    setSpecVisible,
  };
  const addDisabled =
    noStock ||
    !stockDesc ||
    invalideNum ||
    (!price && price !== 0) ||
    saleEnable !== 1 ||
    operationAuth === 'VIEW';
  return (
    <>
      <div
        className={classnames({
          [styles['line-product']]: true,
          'display-none': listType === 'block',
          [styles['line-product-noStock']]: noStock,
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
                      title={intl.get('mallf.common.view.common.CATA.product').d('目录化商品')}
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
                      .get('mallf.common.view.saleQuality.w', {
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
                title={`${intl.get(`mallf.common.view.item.code`).d('物料编码')}: ${itemCode}`}
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
                    value={intl.get('mallf.common.view.sigl.product').d('积分商品')}
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
                  {intl.get('mallf.common.model.addToCart').d('加入购物车')}
                </Button>
              </div>
            )}
            {subStock && (
              <div className="btns-item">
                <Button
                  color="primary"
                  icon="watch_later-o"
                  onClick={() => {
                    if (isAddCart) {
                      addCart(undefined, flyCart);
                    }
                  }}
                  funcType="flat"
                >
                  {intl.get('mallf.common.view.reservation').d('预定')}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="line-product-count">
          <InputNumber
            disabled={noStock}
            min={1}
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
              {intl.get(`mallf.common.model.noStock`).d('无货')}
            </p>
          )}
        </div>
        <div className="line-product-price price-color">
          {product?.paymentType === 'POINTS_PAYMENT' ? (
            <>
              <span className="price">
                <Icon style={{ fontSize: 12 }} type="donut_small" />
                {numberRender(product?.pointPrice)}
              </span>
            </>
          ) : (
            <>
              <span
                className="price text-overflow"
                title={`${currencySymbol}${numberRender([product, 'sellPrice'])}`}
              >
                <span className="currencySymbol">{currencySymbol || ''}</span>
                {numberRender([product, 'sellPrice'])}
              </span>
              {/* {product?.paymentType === 'HYBRID_PAYMENT' && (
                  <span style={{ marginLeft: 15, color: '#999999', fontSize: 12 }}>
                    {intl.get('mallf.common.product.detail.hybrid.desc').d('可积分抵扣')}
                  </span>
                )} */}
            </>
          )}
          {product?.pointsTypeName && (
            <p style={{ flex: 1, color: '#999999' }}>{product?.pointsTypeName}</p>
          )}
        </div>
      </div>
      <div
        className={classnames({
          [styles['block-product']]: true,
          'display-none': listType === 'line',
        })}
      >
        <ProductCard
          productCardConfig={productCardConfig}
          product={{ ...product, labelList }}
          path={productPath}
        />
        <div className={styles['product-footer']}>
          <div className={styles['input-number-box']}>{InputCount}</div>
          <Popover
            title={intl.get('mallf.common.model.addToCart').d('加入购物车')}
            content={<Spec {...specProps} />}
            placement="top"
            visible={specVisible}
            onVisibleChange={(vis) => setSpecVisible(vis)}
            trigger={addDisabled || product.similarProduct?.length === 0 ? '' : 'click'}
          >
            <Tooltip
              key={productId}
              title={notAddCartMessage({
                saleEnable,
                stockState,
                sourceFrom: sourceFromCode,
                soldOutType, // 不可售类型
                operationAuth,
              })}
            >
              <div
                ref={blockBtnRef}
                id={`product-list-add-btn-${productId}`}
                className={`add-cart-btn text-overflow ${addDisabled ? 'disable' : ''}`}
                onClick={() => {
                  if (!addDisabled && !(product.similarProduct?.length > 0) && saleEnable === 1) {
                    addCart(undefined, flyCart);
                  }
                }}
              >
                {intl.get(`mallf.productList.model.addToCart`).d('加入购物车')}
              </div>
            </Tooltip>
          </Popover>
        </div>
      </div>
    </>
  );
}
