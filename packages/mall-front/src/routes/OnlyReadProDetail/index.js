import React, { useState, useEffect, useRef } from 'react';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
import Loading from 'components/loading';
import { getAccessToken, getUserConfigInfo, getNANId } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_MAX } from 'utils/constants';
import styles from './index.less';
import ProductImg from './productImg';
import ProductInfo from './productInfo';
import ProductDesc from './productDesc';
import 'swiper/dist/css/swiper.min.css';
import {
  queryAddress,
  getProductDetail,
  getProductSku,
  fetchPurchaseQuantity,
} from '../../services/productDetailService';
import ProductParam from './productParam';

function ProductDetail(props) {
  const [loading, setLoading] = useState(true);
  const [saleLoading, setSaleLoading] = useState(false);
  const catalogItems = useRef([]); // 商品分类
  const productName = useRef(''); // 商品名称
  const [imgList, setImgList] = useState([]); // 图片列表
  const [productData, setProductData] = useState({}); // 商品信息
  const [similarData, setSimilarData] = useState([]); // sku信息
  const [itemInfo, setItemInfo] = useState({}); // sku信息
  const { sourceFrom, productId, count } = qs.parse(props.location.search.substr(1));
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
    companyId,
    invoiceOrgId,
    // organizationId,
    levelPath,
    // purchaseType,
    regionId,
    addressInfo,
  } = getUserConfigInfo();

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  // 初始化查询地址，可根据默认地址去查商品等信息
  async function fetchDefaultAddress(isInit = true, isUpdate = false) {
    if (getAccessToken()) {
      if (isInit) setLoading(true);
      const res = await queryAddress({
        addressType: 'RECEIVER',
        companyId,
        enabledFlag: 1,
        userId,
        defaultFlag: 1,
      });
      let _currentAddress = {};
      if (res) {
        const {
          addressId: _addressId,
          fullAddress,
          invOrganizationId,
          regionIdList = [],
          regionCodeList = [],
        } = res?.content?.[0] || {};
        _currentAddress = {
          regionIdList,
          regionCodeList,
          invOrganizationId,
          addressId: _addressId,
          addressName: fullAddress,
          regionId: regionIdList?.[1],
          countyCode: regionCodeList?.[2],
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
    Promise.all([
      getProductSku({ sourceFrom, productId, regionId: _currentAddress?.regionId || regionId }),
      getProductDetail({
        sourceFrom,
        productId,
        levelPath,
        invOrganizationId: invoiceOrgId,
        regionId: _currentAddress?.regionId || regionId,
        countyCode: _currentAddress?.countyCode || addressInfo.countyId,
        addressId: _currentAddress._currentAddress,
      }),
      fetchPurchaseQuantity({ ecPlatformCode: sourceFrom }),
    ])
      .then((result) => {
        const similar = result[0] || []; // sku
        setSimilarData(
          similar.map((p) => ({ dim: p.dim, saleName: p.saleName, saleAttrList: p.saleAttr }))
        );
        const detailData = result[1] || {}; // 商品信息
        setItemInfo({ itemCode: detailData.itemCode, itemName: detailData.itemName });
        if (Object.keys(detailData).length === 0) {
          props.history.push({
            pathname: `/exception`,
            state: { message: intl.get('mallf.productDetail.view.productNotExit').d('商品不存在') },
          });
          return false;
        }
        // 电商商品获取单次购买最大购买量
        const { purchaseQuantity } = result[2] ? result[2][0] || {} : {};
        const maxPurchaseQuantity =
          purchaseQuantity || (sourceFrom === 'CATA' ? DEFAULT_MAX : 99999);
        catalogItems.current = detailData.catalogList;
        productName.current = detailData.ecProductName || detailData.cataProductName;
        setImgList(detailData.ecProductImageList || detailData.productImageList || []);
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

  // 商品信息更新接口
  function fetchDetailInfo(_currentAddress) {
    setSaleLoading(true);
    getProductDetail({
      sourceFrom,
      productId,
      levelPath,
      invOrganizationId: invoiceOrgId,
      regionId: _currentAddress?.regionId || regionId,
      countyCode: _currentAddress?.countyCode || addressInfo.countyId,
      addressId: _currentAddress.addressId,
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

  const [stockEnough, setStockEnough] = useState(false);

  return (
    <>
      <div className={styles['productDetail-page']} style={{ marginTop: 50 }}>
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
                  fetchDefaultAddress={() => fetchDefaultAddress(false, true)}
                  productId={getNANId(productId)}
                  fetchSaleStatus={fetchDetailInfo}
                  setItemInfo={setItemInfo}
                  count={count}
                />
              </div>
              <div className="info-right">
                <ProductParam itemInfo={itemInfo} productData={productData} />
              </div>
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
          </div>
        )}
      </div>
    </>
  );
}

export default formatterCollections({ code: ['mallf.productDetail', 'mallf.priceCompare'] })(
  ProductDetail
);
