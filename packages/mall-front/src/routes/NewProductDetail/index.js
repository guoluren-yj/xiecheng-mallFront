import React, { useState, useEffect, useRef } from 'react';
import qs from 'qs';
import { isEmpty, compose } from 'lodash';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import Loading from 'components/loading';
import BreadCrumbs from 'components/BreadCrumbs';
import PriceCompare from 'components/ComparePrice';
import {
  getAccessToken,
  getUserConfigInfo,
  getStorage,
  setStorage,
  timestampToTime,
  getNANId,
  priceNumberRender,
  getCacheAddress,
} from 'utils/utils';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import intl from 'utils/intl';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import formatterCollections from 'utils/intl/formatterCollections';
import { ShowCompare } from 'utils/renderer';
import styles from './index.less';
import ProductImg from './productImg';
import ProductInfo from './productInfo';
import ProductDesc from './productDesc';
import 'swiper/dist/css/swiper.min.css';
import {
  queryAddress,
  getNewProductDetail,
  fetchPurchaseQuantity,
  fetchProductLabel,
} from '../../services/productDetailService';
import SimilarProduct from './similarProduct';
import ProductParam from './productParam';
import BackTop from './BackTop';
import CuxFn from '@/cuxTools/cuxFn';

export const code1 = 'MALL.PRODUCT.DETAIL.PARAMS.INFO';
export const code2 = 'MALL.PRODUCT.DETAIL.RECEIVE.PARAMS.INFO';
export const code3 = 'MALL.PRODUCT.DETAIL.BASE.INFO';

// 请求商品标签
const useLabelList = (productId) => {
  const [{ loading, labelList }, setState] = useState({
    loading: false,
    labelList: [],
  }); // 商品标签
  useEffect(() => {
    if (productId) {
      setState((prev) => ({ ...prev, loading: true }));
      fetchProductLabel([productId])
        .then((res) => {
          const { productLabelDTOList = [] } = res?.[0] || {};
          setState((prev) => ({ ...prev, labelList: productLabelDTOList }));
        })
        .finally(() => {
          setState((prev) => ({ ...prev, loading: false }));
        });
    }
  }, [productId]);
  return [labelList, loading];
};

function ProductDetail(props) {
  const [loading, setLoading] = useState(true);
  const [saleLoading, setSaleLoading] = useState(false);
  const catalogItems = useRef([]); // 商品分类
  const productName = useRef(''); // 商品名称
  const [imgList, setImgList] = useState([]); // 图片列表
  const [productData, setProductData] = useState({}); // 商品信息
  const [similarData, setSimilarData] = useState([]); // sku信息
  const [similarList, setSimilarList] = useState([]); // sku组合列表信息 // 新加的
  // eslint-disable-next-line no-unused-vars
  const [itemInfo, setItemInfo] = useState({}); // sku信息
  const { sourceFrom: oldSourceFrom, productId } = qs.parse(props.location.search.substr(1));
  // 判断处理url多个sourceFrom字段，端侧出现传数组情况
  const sourceFrom = Array.isArray(oldSourceFrom) ? oldSourceFrom?.[0] : oldSourceFrom;
  const [cartLoading, setCartLoading] = useState(false);
  const [priceCompareControl, setPriceCompareControl] = useState({
    warning: false,
    update: false,
  });
  const [priceCompareActiveKey, setPriceCompareActiveKey] = useState('1');
  const [currentAddress, setCurrentAddress] = useState({
    addressId: undefined, // 地址id
    regionId: undefined, // 二级区域id
    countyCode: '', // 三级区域code
    addressName: '', // 全部地址信息
    regionIdList: [],
    regionCodeList: [],
    invOrganizationId: undefined,
  });
  const {
    companyId,
    userId,
    // invoiceOrgId,
    organizationId,
    levelPath,
    purchaseType,
    regionId,
    isNewCart,
  } = getUserConfigInfo();

  const [labelList, labelLoading] = useLabelList(productId);
  const dimensTemplates = useDimensTemplates();

  useEffect(() => {
    const { pathname, search } = window.location || {};
    if (sourceFrom === 'CATA' && pathname === '/product-detail') {
      props.history.replace(`/cata-product-detail${search}`);
      return;
    }
    if (isEmpty(dimensTemplates) && isNewCart) return;
    fetchDefaultAddress();
  }, [productId, sourceFrom, dimensTemplates]);

  // 初始化查询地址，可根据默认地址去查商品等信息
  async function fetchDefaultAddress(isInit = true, isUpdate = false) {
    if (getAccessToken() && companyId) {
      if (isInit) setLoading(true);
      let res = {};
      let _currentAddress = {};
      res = await queryAddress({
        addressType: 'RECEIVER',
        companyId,
        enabledFlag: 1,
        userId,
        defaultFlag: 1,
      });
      const {
        addressId: _addressId,
        invOrganizationId,
        regionIdList = [],
        regionCodeList = [],
        inventoryCode,
        inventoryId,
        inventoryName,
        ...others
      } = res?.content?.[0] || getCacheAddress();
      getDvaApp()._store.dispatch({
        type: 'global/update',
        payload: {
          defaultAddress: res?.content?.[0] || {},
        },
      });
      _currentAddress = {
        ...others,
        regionIdList,
        regionCodeList,
        invOrganizationId,
        addressId: _addressId,
        countyCode: regionCodeList?.[2],
        inventoryCode,
        inventoryId,
        inventoryName,
      };
      setCurrentAddress(_currentAddress);
      const fn = isUpdate ? fetchDetailInfo : initProductData;
      if (productId) {
        fn(_currentAddress);
      }
    }
  }

  // 初始商品信息
  function initProductData(_currentAddress) {
    Promise.all([
      getNewProductDetail({
        sourceFrom,
        productId,
        levelPath,
        addressId: _currentAddress.addressId,
        regionId: _currentAddress?.regionIdList?.[1] || regionId,
        customizeUnitCode: `${code1},${code2},${code3}`,
      }),
      fetchPurchaseQuantity({ ecPlatformCode: sourceFrom }),
    ])
      .then((result) => {
        const detailData = result[0] || {}; // 商品信息
        const { similarResult: similar, receiveFlag } = detailData; // sku
        setSimilarList(similar?.skuDimList || []);
        setSimilarData(
          similar?.dimList?.map((p) => ({
            dim: p.dim,
            saleName: p.saleName,
            saleAttrList: p.saleAttr,
          })) || []
        );
        setItemInfo({ itemCode: detailData.itemCode, itemName: detailData.itemName });
        if (isEmpty(detailData)) {
          props.history.push({
            pathname: `/exception`,
            state: { message: intl.get('mallf.productDetail.view.productNotExit').d('商品不存在') },
          });
          return false;
        }
        // 电商商品获取单次购买最大购买量
        const { purchaseQuantity } = result[1] ? result[1][0] || {} : {};
        const maxPurchaseQuantity = purchaseQuantity;
        saveProductDetail(detailData); // 记录浏览记录
        catalogItems.current = detailData.catalogList;
        productName.current = detailData.ecProductName || detailData.cataProductName;
        setImgList(detailData.ecProductImageList || detailData.productImageList || []);
        // 增加是否是领用商品判断
        setProductData({ ...detailData, maxPurchaseQuantity, receiveFlag });
        // 后置处理商品数据
        console.log(2323232, setProductData);
        CuxFn({
          name: 'productDetail-fn-setNewProductData',
          value: { setProductData },
        })(() => {})();
      })
      .catch((err) => {
        props.history.push({
          pathname: `/exception`,
          state: { message: err.message },
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 地址变更
  function handleUpdateAddress(_currentAddress = {}) {
    setCurrentAddress(_currentAddress);
    fetchDetailInfo(_currentAddress);
  }

  // 商品信息更新接口
  function fetchDetailInfo(_currentAddress) {
    setSaleLoading(true);
    getNewProductDetail({
      sourceFrom,
      productId,
      levelPath,
      addressId: _currentAddress.addressId,
      regionId: _currentAddress?.regionIdList?.[1] || regionId,
      customizeUnitCode: `${code1},${code2},${code3}`,
    })
      .then((res) => {
        if (res) {
          setProductData({ ...productData, ...res });
        }
      })
      .catch((err) => {
        props.history.push({
          pathname: `/exception`,
          state: { message: err.message },
        });
      })
      .finally(() => {
        setSaleLoading(false);
      });
  }

  /**
   * 浏览记录
   * @param {params}} data 商品数据
   */
  function saveProductDetail(data) {
    if (!data.ecProductId && !data.productId) {
      return false;
    }
    if (!userId) {
      return false;
    }
    const productList = getStorage(`${userId}_${purchaseType}_product_histroy`) || {};
    const nowDate = timestampToTime(true);
    let image = '';
    if (data.productImageList) {
      const tmpData = data.productImageList.find((tmp) => tmp.primaryFlag === 1);
      if (tmpData) {
        image = tmpData.imagePath;
      }
    }
    if (productList[nowDate]) {
      // 去重
      productList[nowDate].forEach((item, key) => {
        if (item.productId === (data.ecProductId || data.productId)) {
          productList[nowDate].splice(key, 1);
        }
      });
      productList[nowDate].unshift({
        platform: sourceFrom || 'CATA',
        platformName: data.showSupplierName,
        price: priceNumberRender(data.taxIncludedPrice, data.defaultPrecision),
        imagePath: image,
        productId: data.ecProductId || data.productId,
        productName: data.skuName,
        itemCode: data.itemCode,
        uomName: data.uomName,
        saveTime: new Date().getTime(),
        currencySymbol: data?.currencySymbol,
        receiveFlag: data.receiveFlag,
      });
    } else {
      productList[nowDate] = [
        {
          platform: sourceFrom || 'CATA',
          imagePath: image,
          price: priceNumberRender(data.taxIncludedPrice, data.defaultPrecision),
          platformName: data.showSupplierName,
          productId: data.ecProductId || data.productId,
          productName: data.skuName,
          itemCode: data.itemCode,
          uomName: data.uomName,
          saveTime: new Date().getTime(),
          currencySymbol: data?.currencySymbol,
          receiveFlag: data.receiveFlag,
        },
      ];
    }
    setStorage(`${userId}_${purchaseType}_product_histroy`, productList);
  }
  const [stockEnough, setStockEnough] = useState(false);

  /**
   * 比价篮方法
   */
  function updatePriceCompareList(type, item = {}, list = []) {
    const priceCompareObj = getStorage(`${userId}_price_compare`) || {};
    const tmpPriceCompareObj = { ...priceCompareObj };
    const tmpList = tmpPriceCompareObj.data || [];
    switch (type) {
      case 'display': {
        setStorage('priceCompareVisible', true);
        setStorage(`${userId}_price_compare`, {
          ...priceCompareObj,
          visible: true,
        });
        break;
      }
      case 'close': {
        setStorage(`${userId}_price_compare`, {
          ...priceCompareObj,
          visible: false,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'add': {
        setStorage(`${userId}_price_compare`, {
          ...tmpPriceCompareObj,
          visible: true,
        });
        if (tmpList.find((tmp) => tmp.productId === item.productId)) {
          setPriceCompareControl({
            ...priceCompareControl,
            update: !priceCompareControl.update,
          });
        } else {
          setStorage(`${userId}_price_compare`, {
            data: [
              {
                sourceFrom,
                price: productData.taxIncludedPrice,
                imagePath: productData.productImageList?.[0]?.imagePath,
                productId: productData.productId,
                productNum: productData.skuCode,
                productName: productData.skuName,
                similarData,
                productSkuAttrDTOS: productData.productSkuAttrDTOS,
                supplierCompanyName: productData.showSupplierName,
                checked: false,
                deleteFlag: 0,
                type: 1,
                currencySymbol: productData.currencySymbol,
                deliveryCycle: productData.deliveryCycle,
                labelList,
              },
              ...tmpList,
            ],
            visible: true,
          });
          setPriceCompareControl({
            ...priceCompareControl,
            update: !priceCompareControl.update,
          });
        }
        break;
      }
      case 'delete': {
        const newTmpList = tmpList.filter((tmp) => tmp.productId !== item.productId);
        setStorage(`${userId}_price_compare`, {
          data: newTmpList,
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'deleteAll': {
        setStorage(`${userId}_price_compare`, {
          data: [],
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      case 'update': {
        setStorage(`${userId}_price_compare`, {
          data: list,
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        break;
      }
      default:
        break;
    }
  }

  function onTabChange(key) {
    setPriceCompareActiveKey(key);
  }

  return (
    <>
      <div style={{ background: '#fff', marginTop: 9 }}>
        <BreadCrumbs
          className="breadCrumbs"
          value={{
            catalogItems: catalogItems.current,
            pageTitle: productName.current,
          }}
        />
      </div>
      <div className={styles['productDetail-page']}>
        {loading ? (
          <div style={{ paddingTop: 50 }}>
            <Loading />
          </div>
        ) : (
          <div className="product-detail-content container">
            <div className="product-detail-wrapper">
              <div className="info-left">
                <ProductImg
                  updatePriceCompareList={updatePriceCompareList}
                  imagePath={productData.imagePath}
                  productImgList={imgList}
                  productData={productData}
                  sourceFrom={sourceFrom}
                  setPriceCompareActiveKey={setPriceCompareActiveKey}
                  labelLoading={labelLoading}
                  labelList={labelList}
                />
              </div>
              <div className="info-center" id="info-center">
                <ProductInfo
                  custDisplay={props.customizeDisplay}
                  setCartLoading={setCartLoading}
                  saleLoading={saleLoading}
                  setProductData={setProductData}
                  similarData={similarData}
                  productData={productData}
                  sourceFrom={sourceFrom || productData.sourceFrom}
                  setStockEnough={setStockEnough}
                  currentAddress={currentAddress}
                  setCurrentAddress={setCurrentAddress}
                  updateAddress={handleUpdateAddress}
                  fetchDefaultAddress={() => fetchDefaultAddress(false, true)}
                  productId={getNANId(productId)}
                  fetchSaleStatus={fetchDetailInfo}
                  setItemInfo={setItemInfo}
                  dimensTemplates={dimensTemplates}
                  labelList={labelList}
                />
              </div>
              <div className="info-right">
                <ProductParam
                  itemInfo={itemInfo}
                  productData={productData}
                  custDisplay={props.customizeDisplay}
                />
              </div>
            </div>
            <div className="info-right" r-if={!productData?.receiveFlag}>
              {getAccessToken() && (
                <SimilarProduct
                  priceCompareControl={priceCompareControl}
                  setPriceCompareControl={setPriceCompareControl}
                  itemId={productData?.itemId}
                  productId={productId}
                  sourceFrom={sourceFrom}
                  organizationId={organizationId}
                  dimensTemplates={dimensTemplates}
                  similarData={similarData}
                  similarList={similarList}
                  currentAddress={currentAddress}
                  productData={productData}
                />
              )}
            </div>
            <div className="product-desc-wrapper">
              {userId && <div className="desc-left" />}
              <div className="desc-right">
                <ProductDesc
                  imgList={imgList}
                  sourceFrom={sourceFrom}
                  stockEnough={stockEnough}
                  cartLoading={cartLoading}
                  productId={getNANId(productId)}
                  productData={productData}
                />
              </div>
            </div>
            <BackTop />
          </div>
        )}
      </div>
      {getStorage(`${userId}_price_compare`)?.visible && getAccessToken() && !loading && (
        <ShowCompare>
          <PriceCompare
            warning={priceCompareControl.warning}
            updatePriceCompareList={updatePriceCompareList}
            priceTabVisible
            productId={getNANId(productId)}
            onTabChange={onTabChange}
            priceCompareActiveKey={priceCompareActiveKey}
            currentAddress={currentAddress}
            setCurrentAddress={setCurrentAddress}
            primaryProduct={productData}
            dimensTemplates={dimensTemplates}
          />
        </ShowCompare>
      )}
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['mallf.productDetail', 'mallf.priceCompare', 'mallf.addressManage'],
  }),
  c7nCustomize({
    unitCode: [code1, code2, code3],
  })
)(ProductDetail);
