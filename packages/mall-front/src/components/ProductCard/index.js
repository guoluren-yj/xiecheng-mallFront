/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { Icon, Tooltip } from 'choerodon-ui';

import { SupplierComponent, SpanTitle } from 'utils/renderer';
import LabelPreview from 'components/LabelPreview';
import intl from 'utils/intl';
import { numberRender, uomRender, getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import Image from 'components/Image';
import Link from 'components/Link';
import { math } from 'choerodon-ui/dataset';
import colors from '@/colors';
import OverflowTip from 'components/OverflowTip';
import styles from './index.less';
import CuxFn from '@/cuxTools/cuxFn';

function getCodeColor(code) {
  return colors?.[code]?.['primary-color'] || getPrimaryColor() || colors.A['primary-color'];
}

const codeMapping = {
  ITEM: 'itemCode',
  SUPPLIER: 'supplierCompanyName',
  SALES: 'quantity',
  LABEL: 'labelList',
  STOCK: 'stockNumMeaning',
};

export default function ProductCard(props) {
  const {
    product: { currencySymbol, deliveryCycle },
    wraperClass = '',
    product = {},
    tagFlag,
    tagStyle,
    tagName,
    tagColor,
    style = {},
    hiddenCata, // 隐藏目录化icon
    detailPath = '/product-detail',
    hiddenTagBorder,
    showSupplier, // 显示供应商
    path,
    disabled,
  } = props;
  const productCardConfig = props.productCardConfig?.filter((p) => {
    return p.elementType !== 'COMPARE' && p.elementType !== 'COLLECT';
  });
  const isPreview = window.location.pathname === '/pub' || disabled;
  const { mallType } = getUserConfigInfo();
  const topData = useMemo(() => {
    return (productCardConfig?.filter((d) => d.row === 1) || []).sort((a, b) => {
      const value1 = a?.column;
      const value2 = b?.column;
      return value1 - value2;
    });
  }, [productCardConfig]);
  const bottomData = useMemo(() => {
    return (productCardConfig?.filter((i) => i?.row === 2) || []).sort((a, b) => {
      const value1 = a?.column;
      const value2 = b?.column;
      return value1 - value2;
    });
  }, [productCardConfig]);
  let halfNum = 0;

  function getComponent(type) {
    switch (type) {
      case 'AD':
        return <span className="product-ad">{intl.get('mallf.common.view.ad').d('广告')}</span>;
      case 'CATA':
        return (
          <SupplierComponent
            showSupplier={showSupplier}
            showCataIcon={product.sourceFromCode === 'CATA' && !hiddenCata}
          >
            <span className="product-supplierCompany">
              {product.sourceFromCode === 'CATA' && !hiddenCata && (
                <Tooltip title={intl.get('mallf.common.view.common.CATA.product').d('目录化商品')}>
                  <Icon style={{ marginTop: -5 }} className="cata-icon" type="chrome_reader_mode" />
                </Tooltip>
              )}
            </span>
          </SupplierComponent>
        );
      case 'SUPPLIER':
        return (
          <SupplierComponent
            showSupplier={showSupplier}
            showCataIcon={
              product.sourceFromCode === 'CATA' &&
              topData?.some((p) => p.elementType === 'SUPPLIER') &&
              !hiddenCata
            }
          >
            {(product.supplierCompanyName || product.sourceFrom) && (
              <span className="product-supplierCompany">
                {product.sourceFromCode === 'CATA' &&
                  !hiddenCata &&
                  topData?.some((p) => p.elementType === 'SUPPLIER') && (
                    <Tooltip
                      title={intl.get('mallf.common.view.common.CATA.product').d('目录化商品')}
                    >
                      <Icon className="cata-icon" type="chrome_reader_mode" />
                    </Tooltip>
                  )}
                <span className="product-supplierCompanyName text-overflow">
                  <Tooltip
                    title={`${intl.get('mallf.common.view.supplier').d('供应商')}:${
                      product.supplierCompanyName
                    }`}
                  >
                    {product.supplierCompanyName}
                  </Tooltip>
                </span>
              </span>
            )}
          </SupplierComponent>
        );
      case 'SALES':
        return CuxFn({
          name: 'ProductCard-fn-showSales',
          value: { product },
        })(() => (
          <span
            className="buy-quality text-overflow"
            title={`${intl.get(`mallf.common.view.productList.salesVolume`).d('销量')}:${
              product.quantity > 10000
                ? intl
                    .get('mallf.common.view.saleQuality.w', {
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
                : math.round(product.quantity || 0)
            }`}
          >
            {intl.get(`mallf.common.view.productList.salesVolume`).d('销量')}:{' '}
            <b>
              {product.quantity > 10000
                ? intl
                    .get('mallf.common.view.saleQuality.w', {
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
        ))();
      case 'STOCK':
        return (
          <span>
            <OverflowTip>
              {`${intl.get('mallf.common.view.stock').d('库存')}: ${product.stockNumMeaning || ''}`}
            </OverflowTip>
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="product-itemCode text-overflow">
            <Tooltip
              title={`${intl.get('mallf.common.view.deliveryDay').d('供货周期(天)')}: ${
                deliveryCycle || '-'
              }`}
            >
              {intl.get('mallf.common.view.deliveryDay').d('供货周期(天)')}: {deliveryCycle || '-'}
            </Tooltip>
          </span>
        );
      case 'ITEM':
        return (
          <span className="product-itemCode text-overflow">
            <Tooltip
              title={`${intl.get('mallf.common.view.item.code').d('物料编码')}: ${
                product.itemCode
              }`}
            >
              {product.itemCode}
            </Tooltip>
          </span>
        );
      case 'LABEL':
        if (
          isEmpty(product.labelList) &&
          !product.deliveryTypeMeaning &&
          product.agreementBusinessType !== 'POINTS'
        ) {
          return null;
        }
        return (
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
            {product.labelList
              ?.slice(
                0,
                topData?.[0]?.elementType === 'LABEL' && product.sourceFromCode === 'CATA' ? 2 : 3
              )
              ?.map((n) => (
                <LabelPreview code={n.labelColorCode} value={n.labelName} />
              ))}
          </div>
        );
      default:
        return null;
    }
  }
  const sourceFrom = product.sourceFromCode || product.productSource;
  const productPath =
    path ||
    `${mallType === 'sigl' ? '/sigl' : ''}${detailPath}?productId=${product.productId}${
      sourceFrom ? `&sourceFrom=${sourceFrom}` : ''
    }`;
  return (
    <div style={style} className={classNames([styles['product-wraper'], wraperClass])}>
      <div
        style={
          +tagFlag === 1 && !hiddenTagBorder
            ? { border: `2px solid ${getCodeColor(tagColor)}` }
            : {}
        }
        className={classNames([
          'product-img',
          { 'tag-flag': +tagFlag },
          { [`tag-flag-${+tagStyle}`]: [0, 1, 2].includes(+tagStyle) },
        ])}
      >
        {+tagFlag === 1 && (
          <div className="product-img-tag">
            {+tagStyle === 1 && (
              <div className="img-tag-left">
                <img
                  alt=""
                  src={require(`../../assets/images/home/tag-title-left-${tagColor}.png`)}
                />
              </div>
            )}
            <div
              r-title
              className="img-tag-desc text-overflow"
              style={{ backgroundColor: getCodeColor(tagColor) }}
            >
              {tagName}
            </div>
            {(+tagStyle === 0 || +tagStyle === 1) && (
              <div className="img-tag-right">
                <img
                  alt=""
                  src={require(`../../assets/images/home/tag-title-right-${tagColor}.png`)}
                />
              </div>
            )}
          </div>
        )}
        {isPreview ? (
          <a>
            <Image
              value={product.imagePath}
              width={tagFlag === 1 && !hiddenTagBorder ? 194 : 200}
              height={tagFlag === 1 && !hiddenTagBorder ? 194 : 200}
              imgInfo={product} // 首页/商品搜索页
            />
          </a>
        ) : (
          <Link title={product.skuName} to={productPath}>
            <Image
              value={product.imagePath}
              width={tagFlag === 1 && !hiddenTagBorder ? 194 : 200}
              height={tagFlag === 1 && !hiddenTagBorder ? 194 : 200}
              imgInfo={product}
            />
          </Link>
        )}
      </div>
      <div className="product-price text-overflow">
        {mallType === 'sigl' ? (
          <>
            {product.agreementBusinessType === 'MEMBER' ? (
              <>
                {product?.paymentType === 'POINTS_PAYMENT' ? ( // 纯积分支付
                  <>
                    <Icon
                      type="donut_small"
                      style={{ fontSize: 12, marginTop: -1, fontWeight: 400 }}
                    />
                    <SpanTitle
                      style={{
                        display: 'inline-block',
                        maxWidth: product?.pointsTypeName ? 125 : 190,
                      }}
                    >
                      {product.pointPrice}
                    </SpanTitle>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 12 }}>{currencySymbol || ''}</span>
                    <SpanTitle
                      className="text-overflow"
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'top',
                        maxWidth: product?.pointsTypeName ? 125 : 190,
                      }}
                    >
                      {numberRender([product, 'sellPrice']) === '-'
                        ? numberRender([product, 'latestPrice'])
                        : numberRender([product, 'sellPrice'])}
                    </SpanTitle>
                  </>
                )}
                {product?.pointsTypeName && (
                  <SpanTitle
                    className="text-overflow"
                    style={{
                      float: 'right',
                      fontWeight: 'normal',
                      fontSize: 12,
                      color: '#999999',
                      display: 'inline-block',
                      width: 45,
                    }}
                  >
                    {product?.pointsTypeName}
                  </SpanTitle>
                )}
              </>
            ) : (
              <>
                {numberRender([product, 'sellPrice']) === '-'
                  ? numberRender([product, 'latestPrice'])
                  : numberRender([product, 'sellPrice'])}
                <span className="product-uom">
                  {currencySymbol || ''}
                  {uomRender(product.uomName)}
                  {/* {product.uomName ? `/${product.uomName}` : ''} */}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <span className="currencySymbol">{product?.currencySymbol || ''}</span>
            <SpanTitle
              className="text-overflow"
              style={{ display: 'inline-block', maxWidth: 150, verticalAlign: 'top' }}
            >
              {numberRender([product, 'sellPrice']) === '-'
                ? numberRender([product, 'latestPrice'])
                : numberRender([product, 'sellPrice'])}
            </SpanTitle>
            <span className="product-uom">
              {uomRender(product.uomName)}
              {/* {product.uomName ? `/${product.uomName}` : ''} */}
            </span>
          </>
        )}
      </div>
      <p className="product-name">
        {!isEmpty(topData) ? (
          <div
            className={classNames([
              'product-name-topname',
              {
                'margin-5': topData?.[0]?.elementType === 'LABEL' && product?.labelList?.length > 0,
              },
              {
                'topname-bg':
                  product[codeMapping[topData?.[0]?.elementType]] &&
                  ['SALES', 'ITEM', 'STOCK'].includes(topData?.[0]?.elementType),
              },
            ])}
          >
            {['SALES', 'ITEM', 'LABEL', 'STOCK'].includes(topData?.[0]?.elementType) &&
              getComponent('CATA')}
            {getComponent(topData?.[0]?.elementType)}
          </div>
        ) : !productCardConfig?.some((p) => p.elementType === 'SUPPLIER') ||
          isEmpty(topData?.filter((p) => p.enabledFlag === 1)) ? (
          getComponent('CATA')
        ) : null}
        {product.desc && <span className={classNames(product.classNames)}>{product.desc}</span>}
        {isPreview ? (
          <a> {product.skuName || product.productName}</a>
        ) : (
          <Link title={product.skuName || product.productName} to={productPath}>
            {product.skuName || product.productName}
          </Link>
        )}
      </p>
      <div
        className={classNames({
          'product-other-info': true,
          ishome: ['/', '/sigl', '/pub'].includes(window.location.pathname),
        })}
      >
        {CuxFn({
          name: 'ProductCard-fn-showMoreInfo',
          value: { product },
        })(function () {})()}
        {bottomData?.map((tag) => {
          if (!tag?.enabledFlag) return null;
          if (tag?.rowLength === 1) {
            halfNum++;
          } else if (tag?.rowLength === 2) {
            // 遇到整行重新计数
            halfNum = 0;
          }
          return (
            <div
              className={classNames({
                'text-overflow': true,
                'product-other-info-item': true,
                'width-half': tag?.rowLength === 1,
                'width-one-half': tag?.rowLength === 1.5,
                'width-half-half': tag?.rowLength === 0.5,
                'width-max': tag?.rowLength === 2,
                'text-right':
                  (tag?.rowLength === 1 && halfNum > 0 && halfNum % 2 === 0) ||
                  tag.elementType === 'AD',
              })}
            >
              {getComponent(tag?.elementType)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 商品骨架卡片
export function PreProductCard() {
  return (
    <div className={styles['pre-product-card']}>
      <div className="pre-product-img" />
      <div className="pre-product-name" />
      <div className="pre-product-supplier" />
    </div>
  );
}
