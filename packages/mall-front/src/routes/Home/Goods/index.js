/**
 * goods - 首页商品展示
 * @date: 2019-09-03
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useRef } from 'react';
import { isEmpty, isNil } from 'lodash';

import {
  getUserConfigInfo,
  getProductLinkParams,
  getStockNumMeaning,
  getCookie,
  setCookie,
  setStorage,
  getStorage,
  removeStorage,
  getAllCookies,
  getOnlyInStock,
} from 'utils/utils';
import {
  // fetchUomNameAndCode,
  fetchUom,
  queryStock,
  fetchBarList,
  checkSaleBySagm,
  fetchBarBySearch,
} from 'services/homeService';
import { fetchProductLabel } from '@/services/productDetailService';
import Swal from 'components/swal';
import intl from 'utils/intl';
import useProductCardConfig from 'hooks/useProductCardConfig';
import LeftNav from './LeftNav';
import News from './News';

let isBarUpdateIds = []; // 记录已经请求过搜索接口的自定义栏 customId
let isProductUpdateBarIds = []; // 记录已经请求过库存以及单位接口的自定义栏 customId_productId
let productList = []; // 记录增加的自定义栏商品
let productStocks = []; // 记录查询到的电商商品库存状态
let productSellPrices = []; // 记录查询到的商品价格、可售状态、上下架状态
let itemCodeList = []; // 记录查询到的商品价格、可售状态、上下架状态
let labelList = []; // 记录标签
// const uomNameList = []; // 记录查询到的商品价格、可售状态、上下架状态
export default function Goods() {
  const [bars, setBars] = useState([]);
  const [count, setCount] = useState(0);
  const barProducts = useRef([]);
  const {
    organizationId,
    levelPath,
    regionId,
    companyId,
    addressInfo,
    thirdRegionId,
    custWebConfig,
    tenantId,
  } = getUserConfigInfo();
  const customBarShow = custWebConfig?.customBarShow || 'HIDE';

  const productCardConfig = useProductCardConfig();

  useEffect(() => {
    fetchBars();
    return () => {
      isBarUpdateIds = []; // 记录已经请求过搜索接口的自定义栏 customId
      isProductUpdateBarIds = []; // 记录已经请求过库存以及单位接口的自定义栏 customId_productId
      productList = []; // 记录增加的自定义栏商品
      productStocks = []; // 记录查询到的电商商品库存状态
      productSellPrices = []; // 记录查询到的商品价格、可售状态、上下架状态
      itemCodeList = []; // 记录查询到的商品价格、可售状态、上下架状态
      labelList = [];
    };
  }, []);

  useEffect(() => {
    const updateProducts = productList.filter(
      (f) => !isProductUpdateBarIds.includes(f.barProductId)
    );
    isProductUpdateBarIds = isProductUpdateBarIds.concat(updateProducts.map((m) => m.barProductId));
    if (updateProducts.length > 0) {
      getSalePrice(updateProducts);
      getProductStock(updateProducts);
      getProductUomName(updateProducts);
      getProductLabel(updateProducts);
      // getProductUomNameAndCode(updateProducts);
    }
  }, [productList?.length]);

  useEffect(() => {
    handleScroll();
    document.body.addEventListener('scroll', handleScroll);
    return () => {
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, [bars, count]);

  function handleScroll() {
    bars.forEach((f) => {
      const { customId, customType, stockAvailableEnabled } = f;
      const ele = document.querySelector(`#customId${customId}`);
      const isUpdateStatus = isBarUpdateIds.includes(customId);
      if (ele) {
        const rect = ele.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        // 在视窗内同时并没有发起过请求
        if (inView && !isUpdateStatus && customType !== 'CHANNEL') {
          isBarUpdateIds.push(customId);
          handleUpdateBar(customId, customType, stockAvailableEnabled, f);
        }
      }
    });
  }

  async function handleUpdateBar(customBarId, customType, stockAvailableEnabled, bar) {
    const { customTagLineList = [], customId } = bar;
    const { productGroup, productGroupId } = customTagLineList?.[0] || {}; // 商品组信息
    const {
      productGroupAssignList = [],
      groupType,
      groupTypeName,
      includeNoStockFlag,
      orderType,
      objectVersionNumber,
    } = productGroup || {}; // 商品组行信息
    const params = {
      customTagCacheKey: customBarId || `T${organizationId}`,
      offset: 0,
      regionId,
      onlyInStock: getOnlyInStock(includeNoStockFlag),
      ...addressInfo,
      customId,
    };

    const newParams = getProductLinkParams({
      param: params,
      orderType,
      groupType,
      groupTypeName,
      productGroupId,
      productGroupAssignList,
    });
    const cacheKey = `custom_${tenantId}_${customId}`;
    const hashKey = getCookie(cacheKey) || null;
    const cacheKeyList = [];
    for (const key in getAllCookies()) {
      if (key.startsWith(`custom_${tenantId}`)) {
        cacheKeyList.push(key);
      }
    }
    for (const key in window.localStorage) {
      if (key.startsWith(`custom_${tenantId}`) && !cacheKeyList.includes(key)) {
        removeStorage(key);
      }
    }
    // cookie超时过期清除缓存
    if (isNil(hashKey)) {
      removeStorage(cacheKey);
    }
    const hashParam = {
      recommendListId: productGroupId,
      recommendListVersion: objectVersionNumber,
      hashKey,
    };
    if (customType === 4) return;
    asyncUpdateBarStatus(customBarId, customType, true);
    if (!addressInfo?.address) return;
    const res = await fetchBarBySearch(newParams, hashParam);
    const { hashKey: newkey, checkResult, searchResult = [] } = res || {};
    let result = searchResult;
    if (checkResult === 1) {
      result = getStorage(cacheKey) || [];
    } else {
      // 清除失效缓存
      removeStorage(cacheKey);
      // 缓存新自定义栏数据
      setStorage(cacheKey, result);
      setCookie(cacheKey, newkey, {
        path: '/',
        maxAge: isEmpty(result) ? 60 * 10 : 60 * 60 * 8, // 有值8小时失效，空10分钟失效
      });
    }
    asyncUpdateBarStatus(customBarId, customType, false, result);
  }

  // 自定义栏请求搜索接口商品
  function asyncUpdateBarStatus(customId, customType, status, content = []) {
    let isNewRecord = true;
    const newBarProducts = barProducts.current.map((record) => {
      const isCurrent = record.customId === customId;
      if (isCurrent) {
        isNewRecord = false;
      }
      return isCurrent ? { ...record, update: status, products: content } : record;
    });
    if (isNewRecord) {
      newBarProducts.push({ customId, customType, update: status, products: content });
    }
    barProducts.current = newBarProducts;
    if (customType === 1 || customType === 3) {
      const _products = content
        ?.filter((f) => f)
        ?.slice(0, 10)
        ?.map((m) => ({ ...m, barProductId: `${customId}_${m.productId}` }));
      productList = productList.concat(_products);
    } else if (customType === 2) {
      const _products = content
        ?.filter((f) => f)
        ?.slice(0, 8)
        ?.map((m) => ({ ...m, barProductId: `${customId}_${m.productId}` }));
      productList = productList.concat(_products);
    }
    setCount((c) => c + 1);
  }

  // 获取单位
  // function getProductUomNameAndCode(updateProducts) {
  //   const productIds = updateProducts.map((c) => c?.productId);
  //   fetchUomNameAndCode(productIds).then((res) => {
  //     let isUpdate = false;
  //     res.forEach((f) => {
  //       const isFind = uomNameList.some((s) => s.productId === f.productId);
  //       if (!isFind) {
  //         isUpdate = true;
  //         uomNameList.push(f);
  //       }
  //     });
  //     if (isUpdate) setCount((c) => c + 1);
  //   });
  // }

  // 获取物料
  function getProductUomName(updateProducts) {
    const productDTOS = updateProducts.map((c) => ({
      productId: c?.productId,
      sourceFrom: c?.sourceFromCode,
    }));
    const params = {
      productDTOS,
      levelPath,
      companyId,
      regionId,
    };
    fetchUom(params).then((res) => {
      if (res) {
        const { result = [], resultMessage, success } = res;
        if (!success && resultMessage) {
          Swal(resultMessage);
          return;
        }
        let isUpdate = false;
        (result || []).forEach((f) => {
          const isFind = itemCodeList.some((s) => s.skuId === f.skuId);
          if (!isFind) {
            isUpdate = true;
            itemCodeList.push(f);
          }
        });
        if (isUpdate) setCount((c) => c + 1);
      }
    });
  }

  // 查询库存
  async function getProductStock(updateProducts) {
    // const requestProducts = updateProducts.filter(n => n?.sourceFromCode !== 'CATA');
    const batchSkuIds = updateProducts.map((g) => ({
      skuId: g.sourceFromCode === 'CATA' ? g.skuCode : g.thirdSkuId,
      supplierCode: g.sourceFromCode,
      categoryCode: g.categoryCode,
    }));
    const params = {
      ...addressInfo,
      tenantId: organizationId,
      batchSkuIds,
    };
    if (thirdRegionId && batchSkuIds.length > 0) {
      const res = await queryStock(params);
      if (res) {
        if (res.success) {
          const { result = [] } = res;
          if (result) {
            let isUpdate = false;
            result.forEach((f) => {
              const isFind = productStocks.some((s) => s.skuId === f?.skuId);
              if (!isFind) {
                isUpdate = true;
                productStocks.push(f);
              }
            });
            if (isUpdate) setCount((c) => c + 1);
          }
        } else {
          Swal(res.resultMsg);
        }
      }
    }
  }

  // 获取商品标签
  async function getProductLabel(updateProducts) {
    const productIds = updateProducts?.map((p) => p.productId);
    if (productIds?.length > 0) {
      fetchProductLabel(productIds).then((res) => {
        if (!isEmpty(res)) {
          isUpdate = true;
          let isUpdate = false;
          res.forEach((f) => {
            const isFind = labelList.some((s) => s.productId === f.productId);
            if (!isFind) {
              isUpdate = true;
              labelList.push(f);
            }
          });
          if (isUpdate) setCount((c) => c + 1);
        }
      });
    }
  }

  // 查询价格
  async function getSalePrice(updateProducts) {
    // 查询价格服务可售参数
    const skuParamDTOS = updateProducts.map((m) => ({
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
      let isUpdate = false;
      res.forEach((f) => {
        const isFind = productSellPrices.some((s) => s.skuId === f.skuId);
        if (!isFind) {
          isUpdate = true;
          productSellPrices.push(f);
        }
      });
      if (isUpdate) setCount((c) => c + 1);
    }
  }

  // 获取首页商品
  async function fetchBars() {
    const res = await fetchBarList();
    let result = res || [];
    if (isEmpty(res)) {
      result = [
        {
          customName: intl.get('mallf.home.view.product.recommented').d('商品推荐'),
          customType: 1,
          location: '1',
          customTagLineList: [
            {
              jumpPage: 0,
              productGroup: {
                groupType: 3,
                productGroupAssignList: [
                  {
                    groupType: 3,
                    salesRank: 10,
                  },
                ],
              },
            },
          ],
        },
      ];
    }
    setBars(result);
  }

  // 渲染商品状态标签
  // function getProductDesc({ sourceFromCode, skuStock, stockState, shelfFlag }) {
  //   const inStock = stockState === 1 && skuStock !== 0;
  //   const noStock = stockState === 5 || (stockState === 1 && skuStock === 0);
  //   const subStock = [2, 3, 4, 6].includes(stockState);
  //   const stockDesc = inStock
  //     ? intl.get(`mallf.home.model.inStock`).d('有货')
  //     : noStock
  //     ? intl.get(`mallf.home.model.noStock`).d('无货')
  //     : subStock
  //     ? intl.get(`mallf.home.model.subscribe`).d('预订')
  //     : '';

  //   if (shelfFlag !== 1) {
  //     return {
  //       desc: intl.get('mallf.home.model.unshelf').d('下架'),
  //       classNames: ['stock-label', 'stock-no'],
  //     };
  //   }
  //   if (sourceFromCode === 'CATA' && !skuCheckFlag) {
  //     // return {
  //     //   desc: intl.get(`mallf.productList.model.inStock`).d('有货'),
  //     //   classNames: ['stock-label', 'stock-in'],
  //     // };
  //   }
  //   const classNames = {
  //     'stock-label': !!stockDesc,
  //     'stock-in': inStock,
  //     'stock-no': noStock,
  //     'stock-subscribe': subStock,
  //   };
  //   return { desc: inStock ? null : stockDesc, classNames };
  // }

  return (
    <div id="home-anchor-container" className="container">
      {bars.map((item) => {
        const { products = [], update = false } =
          barProducts.current.find((f) => f.customId === item.customId) || {};
        const pricesProducts = products.map((m) => {
          const {
            paymentType,
            agreementBusinessType,
            pointPrice,
            sellPrice,
            sellPriceMeaning,
            shelfFlag,
            showSupplierName,
            _innerMap = {},
            currencySymbol,
            uomName,
            pointsTypeName,
            deliveryCycle,
          } = productSellPrices.find((f) => f.skuId === m.productId) || {};
          const { itemCode } = itemCodeList.find((f) => f.skuId === m.productId) || {};
          const { productLabelDTOList = [] } =
            labelList?.find((p) => p.productId === m.productId) || {};
          // const { unitNameAndCode: uomName } =
          //   uomNameList.find((f) => f.productId === m.productId) || {};
          const { skuStock, stockState } =
            productStocks.find(
              (f) =>
                f.skuId === m.thirdSkuId || (m.sourceFromCode === 'CATA' && f.skuId === m.skuCode)
            ) || {};
          const stockNumMeaning = getStockNumMeaning(stockState, skuStock, {
            isReceive: agreementBusinessType === 'RECEIVE',
          });
          return {
            ...m,
            sellPrice,
            shelfFlag,
            uomName,
            itemCode: m.itemCode || itemCode,
            paymentType,
            agreementBusinessType,
            pointPrice,
            supplierCompanyName: showSupplierName,
            _innerMap: { sellPriceMeaning, ..._innerMap },
            currencySymbol,
            pointsTypeName,
            labelList: productLabelDTOList,
            stockNumMeaning,
            deliveryCycle,
          };
        });
        return (
          <News
            productCardConfig={productCardConfig}
            {...item}
            products={pricesProducts}
            update={update}
            isBarUpdateIds={isBarUpdateIds}
            customBarShow={customBarShow}
          />
        );
      })}
      <LeftNav
        products={bars}
        barProducts={barProducts.current}
        customBarShow={customBarShow}
        isBarUpdateIds={isBarUpdateIds}
      />
    </div>
  );
}
