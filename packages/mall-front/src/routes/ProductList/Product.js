import React, { useRef, useState, useMemo } from 'react';
import { InputNumber, Icon, Popover, Tooltip } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import uuidV4 from 'uuid/v4';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview, { SiglPrice } from 'components/LabelPreview';
import { SupplierComponent } from 'utils/renderer';
import ProductCard from 'components/ProductCard';
import { math } from 'choerodon-ui/dataset';
import cuxComponent from 'cuxTools/cuxComponent';
import { CollectPopOver } from 'utils/modals';
import { isExcludeCompare, notAddCartMessage } from 'utils/addNewCart';
import Spec from './Spec';
import styles from './Product.less';
import useParabola from '@/hooks/useParabola';
import { numberRender, uomRender } from '@/utils/utils';

function Product(props) {
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
    minPackageQuantity,
    onChange,
    add,
    minus,
    addCart,
    isCATA,
    onCataStock,
    offCataStock,
    // sourceFrom,
    status: { noStock: nostock, saleEnable },
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
    disabled,
    supplierCompanyId,
    templateName,
  } = props;
  const {
    stockState,
    soldOutType, // 不可售类型
    operationAuth,
    sourceFromCode,
  } = product || {};
  const { compareFlag } = getUserConfigInfo();
  const opreateType = useMemo(() => {
    let type =
      productCardConfig?.find((p) => ['COMPARE', 'COLLECT', 'NO_SHOW'].includes(p.elementType))
        ?.elementType || 'COMPARE';
    // 不启用对比 不展示, 是否排除比价
    if (compareFlag === 0 && type === 'COMPARE') {
      type = 'NO_SHOW';
    }
    return type;
  }, [productCardConfig, compareFlag]);

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
  const minusDisable = !quantityValue || math.lte(quantityValue, minPurchaseQuantity);
  const isAddCart =
    ((!noStock && (!isCATA || onCataStock)) || offCataStock) && saleEnable === 1 && !disabled;
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
    productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;
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
  const addDisabled =
    noStock ||
    invalideNum ||
    (!price && price !== 0) ||
    saleEnable !== 1 ||
    disabled ||
    operationAuth === 'VIEW';

  // 排除比价
  const exculdeCompare = isExcludeCompare(product.labelList, supplierCompanyId);

  const templateTag = templateName ? { tagName: templateName, tagFlag: 1, tagStyle: 2 } : {};

  return (
    <>
      <p
        className={classnames({
          [styles['line-product']]: true,
          'display-none': listType === 'block',
          [styles['line-product-noStock']]: noStock,
          [styles['has-platform-product']]: hasPlatformProduct,
          [styles['product-disibled']]: disabled,
        })}
      >
        <div className="line-product-img">
          <Link to={disabled ? null : productPath} disabled={disabled}>
            {/* 搜索页行视图 */}
            <Image value={imagePath} width={66} height={66} imgInfo={product} />
          </Link>
          {templateName && (
            <div className="line-product-img-template">
              <div className="text-overflow" style={{ transform: 'scale(0.8)' }} r-title>
                {templateName}
              </div>
            </div>
          )}
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
            <Link title={productName} to={productPath} disabled={disabled}>
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
                          math.floor(product.quantity / 10000) > 999
                            ? 999
                            : math.floor(product.quantity / 10000),
                      })
                      .d(
                        `${
                          math.floor(product.quantity / 10000) > 999
                            ? 999
                            : math.floor(product.quantity / 10000)
                        }万+`
                      )
                  : math.round(product.quantity || 0)}
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
            {!addDisabled && (
              <div className="btns-item">
                <Button
                  color="primary"
                  icon="add_shopping_cart-o"
                  disabled={disabled}
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
              r-if={
                product.agreementBusinessType !== 'RECEIVE' &&
                opreateType === 'COMPARE' &&
                product.sourceFromCode !== 'JD-V-ECRD' &&
                !exculdeCompare
              }
              className="btns-item text-overflow"
            >
              {hasPrice && (
                <Button
                  color="primary"
                  funcType="flat"
                  icon="bar_chart"
                  onClick={compareEvent}
                  disabled={disableCompare || disabled}
                >
                  {hasCompare
                    ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                    : intl.get(`mallf.productList.model.btn.compare`).d('对比')}
                </Button>
              )}
            </div>
            <div r-if={opreateType === 'COLLECT'} className="btns-item">
              <CollectPopOver product={product} placement="topLeft" disabled={disabled}>
                <Button color="primary" funcType="flat" icon="star" disabled={disabled}>
                  {intl.get(`mallf.productList.model.collect`).d('收藏')}
                </Button>
              </CollectPopOver>
            </div>
            {/* {subStock && (
              <div className="btns-item">
                <Button
                  type="primary"
                  icon="watch_later-o"
                  disabled={disabled}
                  onClick={() => {
                    if (isAddCart) {
                      addCart(undefined, flyCart);
                    }
                  }}
                >
                  {intl.get('mallf.productList.view.reservation').d('预定')}
                </Button>
              </div>
            )} */}
          </div>
        </div>
        <div className="line-product-count">
          <InputNumber
            disabled={noStock || disabled}
            min={minPurchaseQuantity}
            max={maxPurchaseQuantity}
            defaultValue={minPurchaseQuantity || 1}
            step={minPackageQuantity || 1}
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
        <div className="line-product-price price-color text-overflow">
          <span>
            {currencySymbol || ''}
            <span className="price">{numberRender([product, 'sellPrice'])}</span>
          </span>
          <span className="uomName"> {uomRender(uomName)}</span>
          <SiglPrice style={{ marginLeft: 8 }} pointPrice={product.pointPrice} />
        </div>
      </p>
      <div
        className={classnames({
          [styles['block-product']]: true,
          'display-none': listType === 'line',
          [styles['has-platform-product']]: hasPlatformProduct,
          [styles['product-disibled']]: disabled,
        })}
      >
        <ProductCard
          productCardConfig={productCardConfig}
          product={{ ...product, labelList, uomName, itemCode: product.itemCode || itemCode }}
          path={productPath}
          disabled={disabled}
          {...templateTag}
        />
        <div
          className={classnames({
            [styles['product-footer']]: true,
            [styles['product-footer-onShow']]:
              ((product.agreementBusinessType === 'RECEIVE' || exculdeCompare) &&
                opreateType !== 'COLLECT') ||
              opreateType === 'NO_SHOW' ||
              product.sourceFromCode === 'JD-V-ECRD',
          })}
        >
          <div
            r-if={
              product.agreementBusinessType !== 'RECEIVE' &&
              opreateType === 'COMPARE' &&
              product.sourceFromCode !== 'JD-V-ECRD' &&
              !exculdeCompare
            }
            className={classnames({
              'text-overflow': true,
              [styles['compare-btn']]: true,
              [styles['compare-disable-btn']]: disableCompare || disabled,
            })}
            onClick={hasPrice && !disableCompare && !disabled ? compareEvent : () => {}}
            title={
              hasCompare
                ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                : intl.get(`mallf.productList.model.btn.compare`).d('对比')
            }
          >
            {hasPrice
              ? hasCompare
                ? intl.get(`mallf.productList.model.cancelCompare`).d('取消对比')
                : intl.get(`mallf.productList.model.btn.compare`).d('对比')
              : '...'}
          </div>
          <CollectPopOver product={product} placement="topLeft" disabled={disabled}>
            <div
              r-if={opreateType === 'COLLECT'}
              className={classnames({
                [styles['compare-btn']]: true,
                [styles['compare-disable-btn']]: disabled,
              })}
            >
              {intl.get(`mallf.productList.model.collect`).d('收藏')}
            </div>
          </CollectPopOver>
          <div className={styles['input-number-box']}>{InputCount}</div>
          <Popover
            title={intl.get('mallf.productList.model.addToCart').d('加入购物车')}
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
export default cuxComponent({ path: 'ProductList/Product' })(Product);
