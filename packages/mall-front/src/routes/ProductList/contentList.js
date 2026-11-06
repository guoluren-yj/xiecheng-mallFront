import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Spin, Input } from 'hzero-ui';
import { Icon, Alert } from 'choerodon-ui';
import { NumberField, Select, DataSet, Button, Tooltip } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import qs from 'querystring';

import intl from 'utils/intl';
import { ShowAddPurchase } from 'utils/renderer';
import { getOpenCartFlag } from 'utils/configUtils';
import { DEFAULT_MAX } from 'utils/constants';
import useProductCardConfig from 'hooks/useProductCardConfig';
import {
  numberRender,
  getAccessToken,
  getUserConfigInfo,
  getStorage,
  prRequestJump,
  filterNullValueObject,
  generateUrlWithGetParam,
  getProductLimit,
  getPrecision,
  getToFixed,
  getStockNumMeaning,
  calcValidatePack,
  getMinPurchaseQuantity,
} from 'utils/utils';
import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import { queryStock, checkSaleBySagm, fetchUom, fetchUomNameAndCode } from 'services/homeService';
import Icons from 'components/Icons';
import Pagination from 'components/Pagination';
import Swal from 'components/swal';
import AddressLov from 'components/AddressLov';
import { ReceiveLov } from 'components/C7nProLov/commons';
import { addToCartService } from 'services/productListService';
import {
  fetchPurchaseQuantity,
  fetchBudgetLov,
  fetchProductLabel,
  getCentralizedInfo,
} from '@/services/productDetailService';
import { updateBudget } from 'services/cartService';
import { math } from 'choerodon-ui/dataset';
import { addNewCart, validAddress } from 'utils/addNewCart';
import CuxFn from '@/cuxTools/cuxFn';
import Product from './Product';
import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';
import style from './products.less';
import PlatFromProductList from './PlatFromProductList';
import ProductAllocation from '../CartProCopy/ProductAllocationButton'; // 网易二开新建手工商品入口
import CuxWrapper from '@/cuxTools/CuxWrapper';

const promptKey = 'mallf.productList';
let fouceEle = '';
let queryParam = {};
export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
}))(function ContentList(props) {
  const {
    hasPlatformProduct,
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
    subInvoice,
    subPurchase,
    listType,
    setState,
    fetchParams,
    dimensTemplates,
    dimensLoading,
    platProductList,
    disabled,
    currentAddress,
    setCurrentAddress,
    history,
  } = props;
  const fetchRef = useRef();
  const addressRef = useRef();
  const ReceiveLovRef = useRef();
  const productCardConfig = useProductCardConfig();
  const openCartFlag = getOpenCartFlag();
  const {
    userId,
    // visitConfig: { visitorFlag, priceFlag },
    organizationId,
    tenantId,
    purchaseOrgId,
    invoiceOrgId,
    companyId,
    levelPath,
    regionId,
    purchaseType,
    addressInfo,
    thirdRegionId,
    skuCheckFlag,
    unitId,
    budgetSwitch,
    isNewCart = false,
    manualRequestFlag,
  } = getUserConfigInfo();
  const { keyword: keyWord, catalogName, barName, bannerName, hotZoneName } = locationParams;
  // const { page, size } = pagination;
  const { content = [] } = productList;
  const { tenantNum } = getUserConfigInfo()?.userInfo;
  const { manualDimensionTemplate = {}, manualDimensionList = [] } = dimensTemplates || {};

  const isLogin = !!getAccessToken();

  const [uomList, setUomList] = useState([]); // 存储单位、供应商等信息
  const [saleList, setSaleList] = useState([]); // 存储销售价、可售状态等信息
  const [stockList, setStockList] = useState([]); // 存储库存状态等信息
  const [labelList, setLabelList] = useState([]); // 商品标签
  const [centralizeList, setCentralizeList] = useState([]); // 拼单模板信息

  const [quantityObj, setQuantityObj] = useState({});
  const [budgetList, setBudgetList] = useState([]);

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
      companyId,
      skuParamDTOS,
      ecProductCheckDto,
      queryEcPriceFlag: true,
      unitLevelPath: levelPath,
    };
    if (skuParamDTOS.length > 0) {
      const res = await checkSaleBySagm(params);
      // 埋点二开、自动比价商品记录价格处理
      CuxFn({
        name: 'search-fn-addPrice',
        value: {
          saleList: res || [],
        },
      })(() => {})();
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
              // uomName: res?.[1]?.find((p) => p.productId === m.skuId)?.unitNameAndCode,
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

  // 获取拼单
  function getSkuCentralizeTemplate() {
    if (content && content.length > 0) {
      const params = content.map((n) => ({
        productId: n.productId,
        unitId,
      }));
      getCentralizedInfo(params).then((res) => {
        if (!isEmpty(res)) {
          setCentralizeList(res);
        }
      });
    }
  }

  const asyncList = [
    getProductPrimaryData,
    getProductUom,
    fetchSaleAgreement,
    getProductLabel,
    getSkuCentralizeTemplate,
  ];

  useEffect(() => {
    if (isLogin && thirdRegionId) {
      asyncList.forEach((asyncFn) => asyncFn());
    }
  }, [productList]);

  const handleOnblur = (value, product) => {
    const mathMaxQuality = math.floor(math.div(DEFAULT_MAX, product.sellPrice));
    const { productId, uomPrecision } = product;
    if ((value && isNaN(+value)) || math.gt(value, mathMaxQuality)) {
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
  // 获取预算值集
  useEffect(() => {
    if (budgetSwitch === '1') {
      fetchBudgetLov().then((res) => {
        if (res) {
          setBudgetList(res);
        }
      });
    }
  }, [budgetSwitch]);

  /**
   * lov数据请求url
   * @param {*} lovViewConfig - lov视图配置参数
   */
  function handleUrl(lovViewConfig = {}) {
    const { lovTypeCode, queryUrl: lovQueryUrl, lovCode } = lovViewConfig;
    const newQueryUrl =
      lovTypeCode === 'URL'
        ? generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`)
        : generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`, {
            lovCode,
          });
    return newQueryUrl.indexOf('{organizationId}')
      ? newQueryUrl.replace('{organizationId}', tenantId)
      : newQueryUrl;
  }

  // 查询值集视图配置
  function fetchViewinfo(itemId) {
    const budgetData = budgetList.map((m) => {
      const { lovCode } = m;
      const url = `${HmallConfig.apiGateway}/hpfm/v1/${tenantId}/lov-view/info?viewCode=${lovCode}`;
      return new Promise((resolvea) => {
        request(url).then(async (res) => {
          if (res) {
            const { tableFields, queryFields, title, displayField, valueField } = res;
            const newvViewInfo = {
              lovRowKey: valueField,
              queryUrl: handleUrl(res),
              columns: tableFields.map((n) => ({
                ...n,
                isQuery: queryFields.map((query) => query.field).includes(n.dataIndex),
              })),
              title,
              displayField,
              valueField,
            };
            let queryParams = {};
            // 水滴筹预算科目二开
            if (tenantNum === 'SRM-SDC') {
              if (lovCode === 'SCUX.SD.BUDGET_ACCOUNT') {
                queryParams = { tenantId, itemId };
              }
              if (lovCode === 'SCUX.SD_SBUD_UNIT') {
                queryParams = { tenantId, userId };
              }
            }
            const n = await fetchLovData(queryParams, newvViewInfo, m);
            resolvea(n);
          }
        });
      });
    });
    return Promise.all(budgetData).then((r) => {
      return r;
    });
  }

  /**
   * 请求Lov数据
   * @param {string} page 分页
   */
  function fetchLovData(queryData = {}, viewInfo, budgetItem) {
    const { fieldName } = budgetItem;
    const filterNullQuery = filterNullValueObject({
      ...queryData,
    });
    const { displayField, valueField, queryUrl } = viewInfo;
    const newUrl = generateUrlWithGetParam(queryUrl, filterNullQuery);
    return new Promise((resolve) => {
      request(newUrl).then((res) => {
        if (res.content) {
          // 设置默认值为第一行数据
          const data = res.content[0] || {};
          resolve({
            [fieldName]: data[valueField],
            [`${fieldName}Meaning`]: data[displayField],
          });
        }
      });
    });
  }

  function fetchMroBudget() {
    const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cscro-budget-defaults/get`;
    return request(url, { query: { userId, companyId } });
  }

  const addToCart = async (product, fly) => {
    const {
      productId,
      maxNumber,
      minPurchaseQuantity,
      uomPrecision,
      agreementBusinessType,
    } = product;
    const isReceive = agreementBusinessType === 'RECEIVE';
    // eslint-disable-next-line no-restricted-properties
    const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
    const minVal = minPurchaseQuantity || defaultValue;
    const maxVal = maxNumber;
    const tmpQuantity =
      quantityObj[productId] === undefined
        ? isReceive
          ? 1
          : minVal || 1
        : +quantityObj[productId];
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

    if (
      !isNewCart &&
      ((!invoiceOrgId && !(subInvoice && subInvoice[0] && subInvoice[0].organizationId)) ||
        (!purchaseOrgId && !(subPurchase && subPurchase[0] && subPurchase[0].purchaseOrgId)))
    ) {
      Swal(
        `${intl
          .get('mallf.productList.view.no.organization')
          .d('请联系管理员维护采买组织或库存组织')}!`
      );
      return;
    }
    // const quantityValue = quantityObj[product.productId] || 1;
    if (
      calcValidatePack(uomPrecision, product.minPackageQuantity) &&
      !math.eq(math.mod(tmpQuantity, product.minPackageQuantity || 1), 0)
    ) {
      Swal(
        intl
          .get('mallf.productList.view.minPackageQuantity.warning', {
            value: product.minPackageQuantity,
          })
          .d(`购买数量只能是最小包装量${product.minPackageQuantity}的整数倍`)
      );
      return false;
    }
    // 水滴筹二开预算带出默认值(傻逼需求)
    let newBudget = {};
    if (tenantNum === 'SRM-SDC' && !isEmpty(budgetList)) {
      const budget = await fetchViewinfo(product.itemId);
      budget.forEach((n) => {
        newBudget = { ...newBudget, ...n };
      });
    }
    if (tenantNum === 'SRM-CSCMRO' && !isEmpty(budgetList)) {
      const data = await fetchMroBudget();
      newBudget = data || {};
    }
    const params = {
      purchaseType,
      quantity: +tmpQuantity,
      addressId: currentAddress?.addressId,
      invOrganizationId: currentAddress?.invOrganizationId || invoiceOrgId, // 老购物车加购优先取地址上的库存组织
      purOrganizationId: purchaseOrgId,
      productId: product.productId,
      productSource: product.sourceFromCode || product.sourceFrom,
      unitPrice: product.sellPrice,
      latestPrice: product.sellPrice,
      tenantId,
      companyId,
      levelPath,
      organizationId,
      ownerId: userId,
      skuType: 0,
      budget: JSON.stringify(newBudget),
      unitId,
      cartSource: 'SEARCH',
      openCartFlag: getOpenCartFlag() ? 1 : 0,
      searchUuid: state.searchUuid,
    };
    const addressFlag = validAddress({ currentAddress, addressRef, product });
    if (!addressFlag) return;
    if (isNewCart) {
      const { supplierCompanyId } = saleList?.find((s) => product.productId === s.skuId) || {};
      addNewCart({
        product,
        dimensTemplates,
        currentAddress,
        supplierCompanyId,
        tmpQuantity,
        ReceiveLovRef,
        cartSource: 'SEARCH',
        openCartFlag: getOpenCartFlag() ? 1 : 0,
        setLoading: (val) => setState({ spining: val }),
        fly,
        searchUuid: state.searchUuid,
      });
      return;
    }
    setState({ spining: true });
    addToCartService(params)
      .then((res) => {
        if (res.addType === 1) {
          fly();
          updateBudget([
            {
              ...res,
              budgetInfoList: [
                {
                  budget: res.budget,
                  quantity: +tmpQuantity,
                },
              ],
            },
          ]);
        } else if (res.addType === 2) {
          Swal(intl.get('mallf.productList.noAddress.warning').d('请设置默认收货地址'));
        } else if (res.addType === 3) {
          Swal(intl.get(`mallf.productList.model.subscribe`).d('预订'));
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
        const {
          sellPrice,
          sellPriceMeaning,
          agreementBusinessType,
          pointPrice, // 积分
          _innerMap = {},
          saleEnable,
          showSupplierName,
          uomPrecision,
          currencySymbol,
          uomName,
          saleAgreementId,
          deliveryCycle,
          supplierCompanyId,
          itemId,
          minPackageQuantity,
          minPurchaseQuantity,
          purchaseQuantityLimit,
          ladderPriceList,
          operationAuth,
          soldOutType,
        } = saleList?.find((s) => productId === s.skuId) || {}; // 获取相应价格服务销售价，物料Id，最小包装量，最小采购量，供应商名称，最大购买量
        const isReceive = agreementBusinessType === 'RECEIVE';
        const onCataStock = (isCata && skuCheckFlag) || agreementBusinessType === 'RECEIVE'; // 目录化商品开启了库存校验  领用不读该配置(小改列表页)
        const offCataStock = isCata && !skuCheckFlag && agreementBusinessType !== 'RECEIVE'; // 目录化商品关闭了库存校验
        const { skuStock, stockState, maxPurchaseQuantity } =
          stockList?.find((s) => s.skuId === thirdSkuId || (isCata && s.skuId === skuCode)) || {}; // 获取电商、目录化商品库存状态以及单次最大购买量，默认为无货，99999

        const { /* uomName, */ itemCode } = uomList?.find((u) => productId === u.productId) || {}; // 单位，
        // 标签
        const labels = labelList?.find((n) => n.productId === productId);

        // 拼单活动
        const { templateName } =
          centralizeList?.find(
            (n) => n.productId === productId && agreementBusinessType !== 'RECEIVE'
          ) || {};

        const [min, max] = getProductLimit({
          sourceFrom: sourceFromCode || sourceFrom,
          minPurchaseQuantity: getMinPurchaseQuantity({
            minPurchaseQuantity,
            isReceive,
            uomPrecision,
          }),
          maxPurchaseQuantity,
          purchaseQuantityLimit,
          ladderPriceLimit: ladderPriceList,
        });
        const stockNumMeaning = CuxFn({
          name: 'ProductList-fn-stockNumMeaning',
          value: { stockState, skuStock },
        })(() =>
          getStockNumMeaning(stockState, skuStock, {
            isReceive: agreementBusinessType === 'RECEIVE',
          })
        )();
        const newProduct = {
          currencySymbol,
          ...product,
          itemId,
          stockNumMeaning,
          skuStock,
          sellPrice,
          saleEnable,
          stockState,
          maxNumber: max,
          minPackageQuantity,
          uomPrecision,
          minPurchaseQuantity: min,
          maxPurchaseQuantity,
          purchaseQuantityLimit,
          price: sellPrice,
          supplierCompanyName: showSupplierName,
          agreementBusinessType,
          pointPrice, // 积分
          _innerMap: { sellPriceMeaning, ..._innerMap },
          saleAgreementId,
          deliveryCycle,
          operationAuth,
          soldOutType,
        };
        // 后置二开处理商品字段
        const _product = CuxFn({
          name: 'ProductList-fn-setNewProduct',
          value: { newProduct, saleList, uomList },
        })(() => newProduct)();
        const quantityValue =
          quantityObj[productId] === undefined
            ? isReceive
              ? 1
              : min ?? 1
            : quantityObj[productId];
        const inStock = stockState === 1 && skuStock !== 0;
        const noStock = stockState === 5 || (stockState === 1 && skuStock === 0);

        const hasPrice = sellPrice !== undefined && sellPrice !== null; // 价格是否存在

        const priceCompareData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
        const hasCompare = priceCompareData?.some((p) => p?.productId === product?.productId);
        const productPath = `/product-detail?productId=${productId}&sourceFrom=${
          sourceFromCode || sourceFrom
        }${searchValue ? `&keyWord=${searchValue}` : ''}&searchUuid=${state.searchUuid || ''}`;
        // 加减步距
        const step = minPackageQuantity || 1;
        return (
          <Product
            disabled={disabled || (isNewCart && isEmpty(dimensTemplates))}
            hasPlatformProduct={hasPlatformProduct}
            productCardConfig={productCardConfig}
            currencySymbol={currencySymbol}
            spining={spining}
            dispatch={props.dispatch}
            product={_product}
            setQuantityObj={setQuantityObj}
            quantityObj={quantityObj}
            status={{ inStock, noStock, saleEnable }}
            listType={listType}
            productId={productId}
            uomPrecision={uomPrecision || 0}
            hasCompare={hasCompare}
            uomName={uomName}
            labels={labels}
            templateName={templateName}
            sourceFrom={sourceFrom}
            supplierCompanyId={supplierCompanyId}
            supplierCompanyName={showSupplierName}
            itemCode={itemCode}
            imagePath={imagePath}
            hasPrice={hasPrice}
            onCataStock={onCataStock}
            offCataStock={offCataStock}
            price={sellPrice}
            productName={skuName || productName}
            productPath={productPath}
            compareEvent={() => {
              if (hasCompare) updatePriceCompareList('delete', _product);
              else updatePriceCompareList('add', _product);
            }}
            quantityValue={quantityValue}
            maxPurchaseQuantity={max}
            minPurchaseQuantity={min}
            minPackageQuantity={minPackageQuantity}
            onChange={(value) => {
              handleOnblur(value, _product);
            }}
            invalideNum={
              math.isNaN(quantityValue) ||
              math.lt(quantityValue, min) ||
              math.gt(quantityValue, max)
            }
            isCATA={isCata}
            add={
              math.gte(quantityValue, max)
                ? null
                : () => {
                    const mathMaxQuality = math.floor(math.div(DEFAULT_MAX, _product.sellPrice));
                    if (math.isNaN(+quantityValue) || math.gte(quantityValue, mathMaxQuality)) {
                      return;
                    }
                    setQuantityObj({
                      ...quantityObj,
                      [productId]: math.plus(Number(quantityValue), step),
                    });
                  }
            }
            addCart={(pct = _product, fly) => addToCart(pct, fly)}
            minus={() => {
              if (math.isNaN(+quantityValue)) return;
              const minQuantity = min || 1;
              const newQuantity = math.minus(Number(quantityValue), step);
              setQuantityObj({
                ...quantityObj,
                [productId]: math.lt(newQuantity, minQuantity) ? minQuantity : newQuantity,
              });
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
      <div
        className={classnames([
          style['result-page'],
          { [style['has-platform-content']]: hasPlatformProduct },
        ])}
      >
        <div className="content-list-left">
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
                    id="productList-filter-price-min"
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
                    id="productList-filter-price-max"
                    step={0.01}
                    min={0}
                    value={maxPrice >= minPrice ? maxPrice : ''}
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
                    placeholder={intl
                      .get('mallf.productList.view.searchInResult')
                      .d('在结果中搜索')}
                    onBlur={handleSearch}
                  />
                  <Icon type="search" className="searchIcon" />
                </div>
                <div className="sort-page-button">
                  <ShowAddPurchase>
                    <div className="not-found-sku">
                      <span className="not-found-text" r-if={!(openCartFlag && !manualRequestFlag)}>
                        {intl.get('mallf.productList.view.notFoundSku').d('找不到商品？')}
                      </span>
                      <a
                        className="not-found-create"
                        r-if={!openCartFlag}
                        onClick={() => prRequestJump()}
                      >
                        {intl
                          .get('mallf.productList.submit.purchase.application')
                          .d('手工提报采购申请')}
                      </a>
                      <a
                        className="not-found-create"
                        r-if={openCartFlag && !!manualRequestFlag && !dimensLoading}
                      >
                        <ProductAllocation
                          noFetchFlag
                          noAction
                          defaultFlag
                          product={{ manualFlag: 1 }}
                          title={intl
                            .get('mallf.productList.view.openCartApplication')
                            .d('新建手工商品')}
                          dimensionTemplates={{
                            dimensionTemplate: manualDimensionTemplate,
                            dimensionList: manualDimensionList,
                          }}
                        >
                          {intl.get('mallf.productList.view.openCartApplication').d('新建手工商品')}
                        </ProductAllocation>
                      </a>
                    </div>
                  </ShowAddPurchase>
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
                    style={{ height: 213, width: 250 }}
                  />
                </p>
                <span
                  style={{ display: 'block', margin: 'auto', maxWidth: 800, marginTop: 21 }}
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
                <ShowAddPurchase>
                  <a
                    className="to-add-purchase"
                    r-if={!openCartFlag}
                    onClick={() => prRequestJump()}
                  >
                    {intl
                      .get('mallf.productList.submit.purchase.application')
                      .d('手工提报采购申请')}
                  </a>
                  <a
                    className="to-add-purchase"
                    r-if={openCartFlag && !!manualRequestFlag && !dimensLoading}
                  >
                    <ProductAllocation
                      noFetchFlag
                      noAction
                      defaultFlag
                      product={{ manualFlag: 1 }}
                      title={intl
                        .get('mallf.productList.view.openCartApplication')
                        .d('新建手工商品')}
                      dimensionTemplates={{
                        dimensionTemplate: manualDimensionTemplate,
                        dimensionList: manualDimensionList,
                      }}
                    >
                      <span style={{ color: '#fff' }}>
                        {intl.get('mallf.productList.view.openCartApplication').d('新建手工商品')}
                      </span>
                    </ProductAllocation>
                  </a>
                </ShowAddPurchase>
              </div>
            </div>
          ) : (
            <div className="sort-content">
              <CuxWrapper
                path="productList/contentList/header"
                value={{ content, locationParams }}
              />
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
        </div>
        <div r-if={hasPlatformProduct} className="content-list-right">
          <PlatFromProductList platProductList={platProductList} />
        </div>
      </div>
      <AddressLov
        mode="button"
        className="display-none"
        clearButton={false}
        onRef={(ref) => {
          addressRef.current = ref;
        }}
        lovPara={{ companyId, userId }}
        onChange={(address) => setCurrentAddress(address)}
      />
      <ReceiveLov
        onChange={(data) => {
          const { product, tmpQuantity, fly } = ReceiveLovRef.current;
          const { supplierCompanyId } = saleList?.find((s) => product.productId === s.skuId) || {};
          addNewCart({
            product,
            dimensTemplates,
            currentAddress,
            supplierCompanyId,
            tmpQuantity,
            ReceiveLovRef,
            fly,
            cartSource: 'SEARCH',
            openCartFlag: getOpenCartFlag() ? 1 : 0,
            setLoading: (val) => setState({ spining: val }),
            currentWarehouse: {
              warehouseId: data.inventoryId,
              warehouseName: data.inventoryName,
              warehouseAddress: data.address,
            },
          });
        }}
        onRef={ReceiveLovRef}
        mode="button"
        className="display-none"
      />
    </Spin>
  );
});
