import React, { useState, useEffect, useRef } from 'react';
import qs from 'qs';
import { BackTop } from 'choerodon-ui';

import Loading from 'components/loading';
import BreadCrumbs from 'components/BreadCrumbs';
import {
  getAccessToken,
  getUserConfigInfo,
  getStorage,
  setStorage,
  timestampToTime,
  getNANId,
  priceNumberRender,
} from 'utils/utils';
import intl from 'utils/intl';
// import { HmallOptions } from 'utils/options';
import 'swiper/dist/css/swiper.min.css';
import useScroll from 'hooks/useScroll';
import { getProductDetail } from '@/services/productDetailService';
import { getAddressList } from '@/services/cartService';
import SimilarProduct from './similarProduct';
import ProductParam from './productParam';
import styles from './index.less';
import ProductImg from './productImg';
import ProductInfo from './productInfo';
import ProductDesc from './productDesc';
// import PriceCompare from './priceCompare';

export default function ProductDetail(props) {
  const { scrollBottom } = useScroll();

  const [loading, setLoading] = useState(true);
  const [saleLoading, setSaleLoading] = useState(false);
  const catalogItems = useRef([]); // 商品分类
  const productName = useRef(''); // 商品名称
  const [imgList, setImgList] = useState([]); // 图片列表
  const [productData, setProductData] = useState({}); // 商品信息
  const [similarData, setSimilarData] = useState([]); // sku信息
  const [itemInfo, setItemInfo] = useState({}); // sku信息
  const { sourceFrom, productId } = qs.parse(props.location.search.substr(1));
  const [cartLoading, setCartLoading] = useState(false);
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
    userId,
    organizationId,
    regionId,
    constants: { footerPaddingBottom },
  } = getUserConfigInfo();

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  // 初始化查询地址，可根据默认地址去查商品等信息
  async function fetchDefaultAddress(isInit = true, isUpdate = false) {
    if (getAccessToken()) {
      if (isInit) setLoading(true);
      const res = await getAddressList({ page: 0, size: 0 });
      let _currentAddress = {};
      if (res) {
        const {
          addressId: _addressId,
          fullAddress,
          invOrganizationId,
          regionIdList = [],
          regionCodeList = [],
          inventoryCode,
          inventoryId,
          inventoryName,
        } =
          res?.content.find((n) => !!n.currentFlag) ||
          res?.content.find((n) => !!n.defaultFlag) ||
          {};
        _currentAddress = {
          regionIdList,
          regionCodeList,
          invOrganizationId,
          addressId: _addressId,
          addressName: fullAddress,
          regionId: regionIdList?.[1],
          countyCode: regionCodeList?.[2],
          inventoryCode,
          inventoryId,
          inventoryName,
        };
        setCurrentAddress(_currentAddress);
      }
      const fn = isUpdate ? fetchDetailInfo : initProductData;
      if (productId) {
        fn(_currentAddress);
      }
    }
  }

  // 初始商品信息
  function initProductData(_currentAddress) {
    getProductDetail({
      productId,
      regionId: _currentAddress?.regionId || regionId,
      addressId: _currentAddress?.addressId,
    })
      .then((result) => {
        const similar = result.similarSkuList || []; // sku
        setSimilarData(
          similar.map((p) => ({ dim: p.dim, saleName: p.saleName, saleAttrList: p.saleAttr }))
        );
        const detailData = result || {}; // 商品信息
        setItemInfo({ itemCode: detailData.itemCode, itemName: detailData.itemName });
        if (Object.keys(detailData).length === 0) {
          props.history.push({
            pathname: `/exception`,
            state: { message: intl.get('mallf.productDetail.view.productNotExit').d('商品不存在') },
          });
          return false;
        }
        // 最大购买量
        const maxPurchaseQuantity = result.purchaseQuantityLimit;
        saveProductDetail(detailData); // 记录浏览记录
        catalogItems.current = detailData.catalogList;
        productName.current = detailData.ecProductName || detailData.cataProductName;
        setImgList(detailData.skuImageList || []);
        setProductData({ ...detailData, maxPurchaseQuantity });
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
    getProductDetail({
      productId,
      regionId: _currentAddress?.regionId || regionId,
      addressId: _currentAddress?.addressId,
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
    if (!data.ecProductId && !data.skuId) {
      return false;
    }
    if (!userId) {
      return false;
    }
    const productList = getStorage(`${userId}_sigl_product_histroy`) || {};
    const nowDate = timestampToTime(true);
    let image = '';
    if (data.skuImageList) {
      const tmpData = data.skuImageList.find((tmp) => tmp.primaryFlag === 1);
      if (tmpData) {
        image = tmpData.mediaPath;
      }
    }
    if (productList[nowDate]) {
      // 去重
      productList[nowDate].forEach((item, key) => {
        if (item.productId === (data.ecProductId || data.skuId)) {
          productList[nowDate].splice(key, 1);
        }
      });
      // const options = HmallOptions();
      productList[nowDate].unshift({
        platform: sourceFrom || 'CATA',
        platformName: data.showSupplierCompanyName,
        price: priceNumberRender(
          data.agreementPrice !== 0 ? data.agreementPrice || data.price : 0,
          data.defaultPrecision
        ),
        imagePath: image,
        productId: data.ecProductId || data.skuId,
        productName: data.skuName,
        itemCode: data.itemCode,
        uomName: data.uomName,
        saveTime: new Date().getTime(),
        paymentType: data.paymentType,
        pointPrice: data.pointPrice || undefined,
        latestPrice: data.latestPrice || undefined,
        currencySymbol: data?.currencySymbol,
        pointsTypeName: data?.pointsTypeName,
      });
    } else {
      // const options = HmallOptions();
      productList[nowDate] = [
        {
          platform: sourceFrom || 'CATA',
          imagePath: image,
          price: priceNumberRender(
            data.agreementPrice !== 0 ? data.agreementPrice || data.price : 0,
            data.defaultPrecision
          ),
          platformName: data.showSupplierCompanyName,
          productId: data.ecProductId || data.skuId,
          productName: data.skuName,
          itemCode: data.itemCode,
          uomName: data.uomName,
          saveTime: new Date().getTime(),
          currencySymbol: data?.currencySymbol,
          paymentType: data.paymentType,
          pointPrice: data.pointPrice || undefined,
          latestPrice: data.latestPrice || undefined,
          pointsTypeName: data?.pointsTypeName,
        },
      ];
    }
    setStorage(`${userId}_sigl_product_histroy`, productList);
  }
  const [stockEnough, setStockEnough] = useState(false);

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
                  imagePath={productData.imagePath}
                  productImgList={imgList}
                  productData={productData}
                  sourceFrom={sourceFrom}
                />
              </div>
              <div className="info-center" id="info-center">
                <ProductInfo
                  setCartLoading={setCartLoading}
                  saleLoading={saleLoading}
                  setProductData={similarData}
                  similarData={similarData}
                  productData={productData}
                  sourceFrom={sourceFrom}
                  setStockEnough={setStockEnough}
                  currentAddress={currentAddress}
                  updateAddress={handleUpdateAddress}
                  fetchDefaultAddress={() => fetchDefaultAddress(false, true)}
                  productId={getNANId(productId)}
                  fetchSaleStatus={fetchDetailInfo}
                  setItemInfo={setItemInfo}
                />
              </div>
              <div className="info-right">
                <ProductParam itemInfo={itemInfo} productData={productData} />
              </div>
            </div>
            <div className="info-right">
              {getAccessToken() && (
                <SimilarProduct
                  productId={productId}
                  sourceFrom={sourceFrom}
                  organizationId={organizationId}
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
            <BackTop
              style={{
                right: (window.innerWidth - 1190 - 50 - 80) / 2,
                bottom:
                  scrollBottom - footerPaddingBottom + 82 > 0
                    ? 82
                    : 82 - (scrollBottom - footerPaddingBottom + 82),
              }}
              visibilityHeight={1.5 * window.innerHeight}
              target={() => document.body}
            />
          </div>
        )}
      </div>
    </>
  );
}
