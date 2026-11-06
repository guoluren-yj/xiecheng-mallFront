import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Spin, Input } from 'hzero-ui';
import { Icon, Alert } from 'choerodon-ui';
import { NumberField, Select, DataSet, Button, Tooltip } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import qs from 'querystring';

import intl from 'utils/intl';
import {
  numberRender,
  getAccessToken,
  getUserConfigInfo,
  getStorage,
  getProductLimit,
  getPrecision,
  getToFixed,
  getStockNumMeaning,
  calcValidatePack,
} from 'utils/utils';
import { queryStock, checkSaleBySagm, fetchUom, fetchUomNameAndCode } from 'services/homeService';
import Icons from 'components/Icons';
import Pagination from 'components/Pagination';
// import { Pagination } from 'choerodon-ui/pro';
// import Link from 'components/Link';
import Swal from 'components/swal';
import AddressModal from '@/routes/MyMall/AddressList/AddressModal';
import { addToCartService } from '@/services/cartService';
import {
  fetchPurchaseQuantity,
  fetchProductLabel,
  // addCollect,
  // getProductDetail,
} from 'services/productDetailService';
import useProductCardConfig from 'hooks/useProductCardConfig';
import { math } from 'choerodon-ui/dataset';
import Product from './Product';
import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';
import style from './products.less';

const promptKey = 'mallf.productList';
let fouceEle = '';
let queryParam = {};
export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
}))(function ContentList(props) {
  const {
    state = {},
    fetchProductList,
    productList,
    locationParams,
    spining,
    minPrice,
    maxPrice,
    conditionType,
    order,
    onChangeState,
    updatePriceCompareList,
    pagination,
    totalElements,
    changePage,
    changeProduct,
    onlyInStock,
    listType,
    setState,
    fetchParams,
    history,
  } = props;
  const {
    userId,
    // visitConfig: { visitorFlag, priceFlag },
    organizationId,
    // tenantId,
    // purchaseOrgId,
    // invoiceOrgId,
    companyId,
    levelPath,
    regionId,
    // purchaseType,
    addressInfo,
    thirdRegionId,
    skuCheckFlag,
    // unitId,
  } = getUserConfigInfo();
  const productCardConfig = useProductCardConfig();
  const { keyword: keyWord, catalogName, barName, bannerName, hotZoneName } = locationParams;
  // const { page, size } = pagination;
  const { content = [] } = productList;
  const fetchRef = useRef();
  const isLogin = !!getAccessToken();

  const [uomList, setUomList] = useState([]); // 存储单位、供应商等信息
  const [saleList, setSaleList] = useState([]); // 存储销售价、可售状态等信息
  const [stockList, setStockList] = useState([]); // 存储库存状态等信息
  const [labelList, setLabelList] = useState([]); // 商品标签

  const [quantityObj, setQuantityObj] = useState({});
  const [addressVisible, setAddressVisible] = useState(false);

  const stockRef = useRef(null);
  const stockDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'onlyInStock',
          type: 'string',
          required: true,
          lookupCode: 'SMAL.PRODUCT_FILTER_TYPE',
          defaultValue: onlyInStock.current,
        },
      ],
      events: {
        update: ({ value }) => {
          changeProduct(+value);
        },
      },
    });
  }, [onlyInStock, changeProduct]);
  const renderPopupContent = useCallback((reactNode) => {
    const { dataSet, setPopup } = reactNode || {};
    return dataSet?.records?.map((record, index) => (
      <div className={style['products-popup-content']}>
        <Button
          funcType="flat"
          className={
            +onlyInStock.current === +record.get('value')
              ? 'products-popup-content-active products-popup-btn'
              : 'products-popup-btn'
          }
          onClick={() => {
            stockDs.current.set('onlyInStock', +record.get('value'));
            setPopup(false);
          }}
        >
          <span>{record.get('meaning')}</span>
          <Tooltip
            title={record.get('description')}
            placement={
              index === 0 ? 'top' : index < dataSet?.records?.length - 1 ? 'right' : 'bottom'
            }
          >
            <Icon type="help" />
          </Tooltip>
        </Button>
      </div>
    ));
  }, []);
  const adjustWidth = (value) => {
    if (stockRef?.current && stockRef.current.element && stockRef.current.element.value !== value) {
      const tempElement = document.createElement('span');
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.innerHTML = value;
      document.body.appendChild(tempElement);

      stockRef.current.element.style.width = `${tempElement.offsetWidth + 38}px`;

      document.body.removeChild(tempElement);
    }
  };
  const priceOnChange = (value, type) => {
    if (isNaN(+value) || +value <= 0) {
      onChangeState({
        [`${type}Price`]: 0,
      });
    } else {
      onChangeState({
        [`${type}Price`]: value,
      });
    }
  };
  // 价格变化数字处理 最低价和最高价之间对比
  // const priceOnBlur = (value, type) => {
  //   console.log(value, type);
  //   onChangeState({
  //     [`${type}Price`]: value,
  //   });
  // };
  // 价格区间提交及清楚操作
  const sortPriceSearch = (type, price) => {
    const params = { needContinue: false };
    if (type === 'min') {
      if (maxPrice && maxPrice < Number(price)) {
        params.maxPrice = '';
        params.minPrice = Number(price) || '';
      } else {
        params.minPrice = Number(price) || '';
        params.maxPrice = maxPrice;
      }
    }
    if (type === 'max') {
      if (minPrice && minPrice > Number(price)) {
        params.maxPrice = '';
        params.minPrice = minPrice;
      } else {
        params.maxPrice = Number(price) || '';
        params.minPrice = minPrice;
      }
    }
    const deleteKeys = [];
    setState(params);
    queryParam = {
      ...fetchParams,
      ...params,
    };
    clearTimeout(fetchRef.current);
    fetchRef.current = setTimeout(() => {
      if (fouceEle === type) {
        fetchProductList(queryParam, deleteKeys, false, true);
        fouceEle = '';
        queryParam = {};
      }
    }, 100);
  };

  // 价格服务可售接口
  const fetchSaleAgreement = async () => {
    // 查询价格服务可售参数
    const skuParamDTOS = content.map((m) => ({
      quantity: 1,
      skuId: m.productId,
      sourceFrom: m.sourceFromCode,
    }));
    const ecProductCheckDto = {
      tenantId: organizationId,
      ...addressInfo,
    };
    const params = {
      regionId,
      skuParamDTOS,
      ecProductCheckDto,
      queryEcPriceFlag: true,
      unitLevelPath: levelPath,
      channel: 'PERSONAL',
    };
    if (skuParamDTOS.length > 0) {
      const res = await checkSaleBySagm(params);
      // 加上是否可售属性
      setSaleList(res || []);
    }
  };

  // 获取电商、目录化的库存、最大采购量
  const getProductPrimaryData = async () => {
    const batchSkuIds = content.map((g) => ({
      skuId: g.sourceFromCode === 'CATA' ? g.skuCode : g.thirdSkuId,
      supplierCode: g.sourceFromCode || g.sourceFrom,
      categoryCode: g.categoryCode,
    }));
    const params = {
      batchSkuIds,
      tenantId: organizationId,
      ...addressInfo,
    };
    if (batchSkuIds.length > 0) {
      const res = await Promise.all([fetchPurchaseQuantity(), queryStock(params)]);
      // 电商、目录化商品获取单次购买最大购买量
      const quantityList = res[0] || [];
      const filterEcPlatformList = quantityList.map((n) => ({
        ...n,
        maxPurchaseQuantity: n.purchaseQuantity || 99999,
      }));
      if (res[1].success) {
        const { result = [] } = res[1];
        if (result) {
          const newList = result.map((n) => {
            const [{ purchaseQuantity } = {}] = filterEcPlatformList;
            return { ...n, maxPurchaseQuantity: purchaseQuantity || 99999 };
          });
          setStockList(newList);
        }
      } else {
        Swal(res[1].resultMsg);
      }
    }
  };

  // 获取单位,供应商
  const getProductUom = () => {
    if (content && content.length > 0) {
      const productDTOS = content.map((c) => ({
        productId: c?.productId,
        sourceFrom: c?.sourceFromCode || c?.sourceFrom,
      }));
      const params = {
        productDTOS,
        levelPath,
        companyId,
        regionId,
      };
      Promise.all([fetchUom(params), fetchUomNameAndCode(content.map((c) => c.productId))]).then(
        (res) => {
          if (res) {
            const { result = [], resultMessage, success } = res[0];
            if (!success && resultMessage) {
              Swal(resultMessage);
              return;
            }
            const uom = result.map((m) => ({
              ...m,
              productId: m.skuId,
              itemCode: m.itemCode,
              uomName: res?.[1]?.find((p) => p.productId === m.skuId)?.unitNameAndCode,
            }));
            setUomList(uom);
          }
        }
      );
    }
  };

  // 获取商品标签
  function getProductLabel() {
    if (content && content.length > 0) {
      const productIds = content.map((n) => n.productId);
      fetchProductLabel(productIds).then((res) => {
        if (!isEmpty(res)) {
          setLabelList(res);
        }
      });
    }
  }

  // // 查询商品列表收藏状态
  // function fetchFavorite() {
  //   const newProducts = content.map(i => ({
  //     ...i,
  //     companyId,
  //     productSource: (i?.sourceFromCode || i?.sourceFrom) === 'CATA' ? 'CATA' : 'EC',
  //     tenantId,
  //     purchaseType,
  //   }));
  //   if (newProducts.length > 0) {
  //     fetchProductFavorite(newProducts).then(res => {
  //       if (res) {
  //         setFavoriteList(res);
  //       }
  //     });
  //   }
  // }

  const asyncList = [getProductPrimaryData, getProductUom, fetchSaleAgreement, getProductLabel];

  useEffect(() => {
    if (isLogin && thirdRegionId) {
      asyncList.forEach((asyncFn) => asyncFn());
    }
  }, [productList]);

  const handleOnblur = (value, product) => {
    const { productId, uomPrecision } = product;
    if (value && isNaN(+value)) {
      return false;
    }
    setQuantityObj({
      ...quantityObj,
      [productId]: uomPrecision
        ? getToFixed(value, uomPrecision)
        : isNaN(value) || !value
        ? value
        : parseInt(value, 10),
    });
  };

  const addToCart = async (product, fly) => {
    const { productId, maxNumber, minPurchaseQuantity, uomPrecision } = product;
    // eslint-disable-next-line no-restricted-properties
    const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
    const minVal = minPurchaseQuantity || defaultValue;
    const maxVal = maxNumber;
    const tmpQuantity =
      quantityObj[productId] === undefined ? minVal || 1 : +quantityObj[productId];
    if (isNaN(tmpQuantity) || tmpQuantity < minVal) {
      setQuantityObj({
        ...quantityObj,
        [productId]: Math.max(minVal, 1),
      });
      return;
    } else if (tmpQuantity > maxVal) {
      setQuantityObj({
        ...quantityObj,
        [productId]: maxVal,
      });
      return;
    }

    // if (
    //   (!invoiceOrgId && !(subInvoice && subInvoice[0] && subInvoice[0].organizationId)) ||
    //   (!purchaseOrgId && !(subPurchase && subPurchase[0] && subPurchase[0].purchaseOrgId))
    // ) {
    //   Swal(
    //     `${intl.get('mallf.common.view.no.organization').d('请联系管理员维护采买组织或库存组织')}!`
    //   );
    //   return;
    // }
    // const quantityValue = quantityObj[product.productId] || 1;
    if (
      calcValidatePack(uomPrecision, product.minPackageQuantity) &&
      !math.eq(math.mod(tmpQuantity, product.minPackageQuantity || 1), 0)
    ) {
      Swal(
        intl
          .get('mallf.common.view.minPackageQuantity.warning', {
            value: product.minPackageQuantity,
          })
          .d(`购买数量只能是最小包装量${product.minPackageQuantity}的整数倍`)
      );
      return false;
    }
    const params = {
      productSource: product.sourceFromCode || product.sourceFrom,
      ownerId: userId,
      productId,
      quantity: +tmpQuantity,
      cartSource: 'SEARCH',
      searchUuid: state.searchUuid,
    };
    setState({ spining: true });
    addToCartService(params)
      .then((res) => {
        if (res) {
          fly();
        }
      })
      .finally(() => {
        setState({ spining: false });
      });
  };

  const getSort = (type) => {
    let currentOrder = 'asc';
    switch (type) {
      case 'all':
        onChangeState({
          conditionType: 'all',
          order: 'asc',
        });
        fetchProductList(
          {
            ...fetchParams,
            needContinue: false,
          },
          ['priceOrder', 'salesSort'],
          false,
          true
        );
        break;
      case 'price':
        currentOrder = type === conditionType ? (order === 'asc' ? 'desc' : 'asc') : 'asc';
        onChangeState({
          conditionType: 'price',
          order: currentOrder,
        });
        fetchProductList(
          { ...fetchParams, priceOrder: currentOrder, needContinue: false },
          ['salesSort'],
          false,
          true
        );
        break;
      case 'sales':
        currentOrder = type === conditionType ? (order === 'asc' ? 'desc' : 'asc') : 'desc';
        onChangeState({
          conditionType: 'sales',
          order: currentOrder,
        });
        fetchProductList(
          { ...fetchParams, salesSort: currentOrder, needContinue: false },
          ['priceOrder'],
          false,
          true
        );
        break;
      default:
        onChangeState({
          conditionType: '',
          order: currentOrder,
        });
        fetchProductList({ ...fetchParams }, ['priceOrder', 'salesSort'], false, true);
        break;
    }
  };

  // function handleCollect(item) {
  //   const { sourceFromCode, sourceFrom } = item;
  //   const productSource = (sourceFromCode || sourceFrom) === 'CATA' ? 'CATA' : 'EC';
  //   addCollect({ productSource, productId: item.ecProductId || item.productId }).then(() => {
  //     const newList = favoriteList.map(i => {
  //       if (i.productId === (item.ecProductId || item.productId)) {
  //         return { ...i, favoriteFlag: 1 };
  //       } else {
  //         return i;
  //       }
  //     });
  //     setFavoriteList(newList);
  //   });
  // }

  // const filterPrice = (prices = []) => {
  //   return prices.filter(f => typeof f === 'number')[0] || 0;
  // };

  const getProductDetailCOM = () => {
    const { keyWord: currentSearchKeyword = '' } = locationParams;
    const searchValue = currentSearchKeyword === 'undefined' ? '' : currentSearchKeyword;
    // const getUniqueValue = p => p.recordId || `${p.sourceFromCode || p.sourceFrom}${p.productId}`;
    return (
      content &&
      content.map((product) => {
        const {
          skuName,
          imagePath,
          productId,
          skuCode,
          thirdSkuId,
          sourceFrom,
          productName,
          sourceFromCode,
        } = product;
        const isCata = (sourceFromCode || sourceFrom) === 'CATA';
        const onCataStock = isCata && skuCheckFlag; // 目录化商品开启了库存校验
        const offCataStock = isCata && !skuCheckFlag; // 目录化商品关闭了库存校验
        const {
          sellPrice,
          sellPriceMeaning,
          agreementBusinessType,
          pointPrice, // 积分
          _innerMap = {},
          saleEnable,
          showSupplierName,
          uomPrecision,
          paymentType,
          currencySymbol,
          pointsTypeName,
          operationAuth,
          soldOutType,
        } = saleList.find((s) => productId === s.skuId) || {}; // 获取相应价格服务销售价
        const { skuStock, stockState, maxPurchaseQuantity } =
          stockList.find((s) => s.skuId === thirdSkuId || (isCata && s.skuId === skuCode)) || {}; // 获取电商、目录化商品库存状态以及单次最大购买量，默认为无货，99999

        const { uomName, itemCode } = uomList.find((u) => productId === u.productId) || {}; // 单位，
        const { itemId, minPackageQuantity, minPurchaseQuantity, purchaseQuantityLimit } =
          saleList.find((s) => productId === s.skuId) || {}; // 获取相应物料Id，最小包装量，最小采购量，供应商名称，最大购买量
        const labels = labelList?.find((n) => n.productId === productId);

        const [min, max] = getProductLimit({
          sourceFrom: sourceFromCode || sourceFrom,
          minPurchaseQuantity,
          maxPurchaseQuantity,
          purchaseQuantityLimit,
        });
        const stockNumMeaning = getStockNumMeaning(stockState, skuStock, {
          isReceive: agreementBusinessType === 'RECEIVE',
        });
        const _product = {
          currencySymbol,
          ...product,
          stockNumMeaning,
          itemId,
          uomName,
          skuStock,
          sellPrice,
          saleEnable,
          stockState,
          maxNumber: max,
          minPackageQuantity,
          uomPrecision,
          minPurchaseQuantity,
          maxPurchaseQuantity,
          purchaseQuantityLimit,
          price: sellPrice,
          supplierCompanyName: showSupplierName,
          agreementBusinessType,
          pointPrice, // 积分
          pointsTypeName,
          paymentType,
          _innerMap: { sellPriceMeaning, ..._innerMap },
          operationAuth,
          soldOutType,
        };
        const quantityValue =
          quantityObj[productId] === undefined ? min ?? 1 : quantityObj[productId];
        const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
        const inStock = stockState === 1 && skuStock !== 0;
        const noStock = stockState === 5 || (stockState === 1 && skuStock === 0);
        const subStock = [2, 3, 4, 6].includes(stockState);
        const stockDesc = offCataStock
          ? intl.get(`mallf.common.model.addToCart`).d('加入购物车')
          : inStock
          ? intl.get(`mallf.common.model.addToCart`).d('加入购物车')
          : noStock
          ? intl.get(`mallf.common.model.noStock`).d('无货')
          : subStock
          ? intl.get(`mallf.common.model.nowsubscribe`).d('立即预订')
          : '';

        const hasPrice = sellPrice !== undefined && sellPrice !== null; // 价格是否存在

        const priceCompareData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
        const hasCompare = priceCompareData?.some((p) => p?.productId === product?.productId);
        return (
          <Product
            productCardConfig={productCardConfig}
            currencySymbol={currencySymbol}
            spining={spining}
            dispatch={props.dispatch}
            product={_product}
            setQuantityObj={setQuantityObj}
            quantityObj={quantityObj}
            status={{ inStock, noStock, subStock, saleEnable }}
            listType={listType}
            productId={productId}
            uomPrecision={uomPrecision || 0}
            hasCompare={hasCompare}
            uomName={uomName}
            labels={labels}
            sourceFrom={sourceFrom}
            supplierCompanyName={showSupplierName}
            itemCode={itemCode}
            imagePath={imagePath}
            hasPrice={hasPrice}
            onCataStock={onCataStock}
            offCataStock={offCataStock}
            price={sellPrice}
            productName={skuName || productName}
            productPath={`/sigl/product-detail?productId=${productId}&sourceFrom=${
              sourceFromCode || sourceFrom
            }${searchValue ? `&keyWord=${searchValue}` : ''}&searchUuid=${state.searchUuid || ''}`}
            compareEvent={() => {
              if (hasCompare) updatePriceCompareList('delete', _product);
              else updatePriceCompareList('add', _product);
            }}
            defaultQuantity={defaultValue}
            quantityValue={quantityValue}
            maxPurchaseQuantity={max}
            minPurchaseQuantity={min}
            onChange={(value) => {
              handleOnblur(value, _product);
            }}
            invalideNum={isNaN(quantityValue) || quantityValue < min || quantityValue > max}
            stockDesc={stockDesc}
            isCATA={isCata}
            add={
              quantityValue >= max
                ? null
                : () => {
                    if (isNaN(+quantityValue)) return;
                    setQuantityObj({
                      ...quantityObj,
                      [productId]: quantityValue
                        ? math.plus(Number(quantityValue), defaultValue)
                        : 1 + defaultValue,
                    });
                  }
            }
            addCart={(pct = _product, fly) => addToCart(pct, fly)}
            minus={() => {
              if (isNaN(+quantityValue)) return;
              if (quantityValue > defaultValue) {
                setQuantityObj({
                  ...quantityObj,
                  [productId]: math.minus(Number(quantityValue), defaultValue),
                });
              }
            }}
          />
        );
      })
    );
  };

  const handleSearch = (e) => {
    fetchProductList(
      {
        ...fetchParams,
        termKeyword: e.target.value,
        needContinue: false,
      },
      [],
      false,
      true
    );
  };
  const renderRecommended = () => (
    <div className="recommended-tip">
      {intl.get('mallf.productList.view.recommendedTip').d('你是否想要搜索')}：
      {state.recommendedWords?.map((w) => (
        <span
          className="recommended-word"
          onClick={() => {
            const search = qs.parse(window.location.search.substring(1)) || {};
            const searchParams = {
              ...search,
              keyword: w,
            };
            history.push(`${location.pathname}?${qs.stringify(searchParams)}`);
            history.push('/refresh');
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );

  return (
    <Spin spinning={spining}>
      <div className={style['result-page']}>
        <div className="sort-box">
          {locationParams.listType === 'sale' ? (
            <div className="sort-condition">
              <div
                id="sort-sales"
                className="sort-btn select-border"
                style={{
                  border: '1px solid #e8e8e8',
                  borderLeft: 'none',
                }}
              >
                <span id="salesVolume" className="primary-hover-color">
                  {intl.get(`${promptKey}.view.productList.salesVolume`).d('销量')}
                </span>
                <Icons size={12} type="icon_arrow_down" />
              </div>
            </div>
          ) : (
            <div className="sort-condition">
              <div
                id="sort-default"
                className={`sort-btn ${conditionType === 'all' ? ' select-border' : ''}`}
                onClick={() => {
                  getSort('all');
                }}
              >
                <span id="Comprehensive">
                  {intl.get(`${promptKey}.view.productList.comprehensive`).d('综合')}
                </span>
              </div>
              <div
                id="sort-sales"
                className={`sort-btn ${conditionType === 'sales' ? ' select-border' : ''}`}
                onClick={() => {
                  getSort('sales');
                }}
              >
                <span id="salesVolume" className="primary-hover-color">
                  {intl.get(`${promptKey}.view.productList.salesVolume`).d('销量')}
                </span>
                <Icons
                  size={12}
                  type={
                    conditionType === 'sales'
                      ? order === 'asc'
                        ? 'icon_arrow_up'
                        : 'icon_arrow_down'
                      : 'sort-default'
                  }
                />
              </div>
              <div
                id="sort-price"
                className={`sort-btn ${conditionType === 'price' ? ' select-border' : ''}`}
                onClick={() => {
                  getSort('price');
                }}
              >
                <span id="price" className="primary-hover-color">
                  {intl.get(`${promptKey}.view.productList.price`).d('价格')}
                </span>
                <Icons
                  size={12}
                  type={
                    conditionType === 'price'
                      ? order === 'asc'
                        ? 'icon_arrow_up'
                        : 'icon_arrow_down'
                      : 'sort-default'
                  }
                />
              </div>
              <div className="sort-price-search">
                <NumberField
                  step={0.01}
                  value={minPrice > 0 ? minPrice : ''}
                  min={0}
                  onChange={(e) => priceOnChange(e, 'min')}
                  onFocus={() => {
                    fouceEle = 'min';
                  }}
                  onBlur={(e) => sortPriceSearch('min', e.target.value)}
                  renderer={({ value }) => (value ? numberRender(value) : null)}
                />
                <span className="price-line">-</span>
                <NumberField
                  step={0.01}
                  min={0}
                  value={maxPrice > minPrice ? maxPrice : ''}
                  onChange={(e) => priceOnChange(e, 'max')}
                  onFocus={() => {
                    fouceEle = 'max';
                  }}
                  onBlur={(e) => sortPriceSearch('max', e.target.value)}
                  renderer={({ value }) => (value ? numberRender(value) : null)}
                />
                {/* <a onClick={() => sortPriceSearch('sure')}>
                <span id="Confirm">
                  {intl.get(`${promptKey}.model.productList.confirm`).d('确定')}
                </span>
              </a>
              <a onClick={() => sortPriceSearch('clear')}>
                <span id="Empty">{intl.get(`${promptKey}.model.productList.empty`).d('清空')}</span>
              </a> */}
              </div>
              <div className="searchBar">
                <Input
                  className="searchInput"
                  placeholder={intl.get('mallf.common.view.searchInResult').d('在结果中搜索')}
                  onBlur={handleSearch}
                />
                <Icon type="search" className="searchIcon" />
              </div>
              <div className="sort-page-button">
                <Select
                  dataSet={stockDs}
                  clearButton={false}
                  name="onlyInStock"
                  className="sort-page-select"
                  renderer={({ text }) => {
                    adjustWidth(text);
                    return <span>{text}</span>;
                  }}
                  ref={stockRef}
                  popupContent={renderPopupContent}
                />
              </div>
            </div>
          )}
          <div className="sort-change-list-type">
            <Icon
              type="view_module"
              style={{ fontSize: 20, marginRight: 10 }}
              onClick={() => setState({ listType: 'block' })}
              className={classnames({
                active: listType === 'block',
              })}
            />
            <Icon
              type="view_list"
              onClick={() => setState({ listType: 'line' })}
              style={{ fontSize: 20 }}
              className={classnames({
                active: listType === 'line',
              })}
            />
          </div>
        </div>
        {content?.length === 0 ? (
          <div className="empty-wrap recommended-alert">
            <Alert
              r-if={state.recommendedWords && state.recommendedWords.length}
              message={renderRecommended()}
              type="warning"
              iconType="error"
              showIcon
              closable
            />
            <div className="empty-msg">
              <p>
                <img
                  alt=""
                  src={emptyImg}
                  className="no-data-svg"
                  style={{ width: 136, height: 116 }}
                />
              </p>
              <span
                style={{ display: 'inline-block', marginTop: 21 }}
                id="nofind"
                title={keyWord || catalogName || barName || bannerName || hotZoneName}
              >
                {intl
                  .get(`${promptKey}.view.productList.goShopping`, {
                    value: keyWord || catalogName || barName || bannerName || hotZoneName,
                  })
                  .d(
                    `还没有找到与 "${
                      keyWord || catalogName || barName || bannerName || hotZoneName
                    }" 相关的商品`
                  )}
              </span>
            </div>
          </div>
        ) : (
          <div className="sort-content">
            {getProductDetailCOM()}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row-reverse',
              }}
            >
              <Pagination
                style={{ width: 'auto', marginLeft: '20px' }}
                scrollTop={300}
                number={pagination.page}
                size={20}
                totalElements={totalElements}
                onForward={(p) => {
                  changePage(p);
                }}
              />
              <div r-if={totalElements > 19}>
                {intl.get('mallf.productList.view.pageSize').d('每页行数')}：20
              </div>
            </div>
          </div>
        )}
        <div className="result-footer" />
        {addressVisible && (
          <AddressModal visible={addressVisible} onCancel={() => setAddressVisible(false)} />
        )}
        {addressVisible && (
          <AddressModal
            setDefault
            initAddress={{}}
            visible={addressVisible}
            onCancel={() => setAddressVisible(false)}
            setVisible={setAddressVisible}
            onSuccess={(e) => e}
          />
        )}
      </div>
    </Spin>
  );
});
