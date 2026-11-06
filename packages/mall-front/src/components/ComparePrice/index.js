import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { Button, Tooltip } from 'choerodon-ui/pro';
import Swiper from 'swiper';
import qs from 'qs';
import { addNewCareParams, validAddress } from 'utils/addNewCart';

import { SpanTitle, validCompareLimit } from 'utils/renderer';
import { checkSaleBySagm } from 'services/homeService';
import { fetchAddPriceCompare } from 'services/productListService';
import {
  getStorage,
  setStorage,
  numberRender,
  // filterNullGetUrl,
  getUserConfigInfo,
  getCacheAddress,
} from 'utils/utils';
import intl from 'utils/intl';
import { getUserCustomDimension, getOpenCartFlag } from 'utils/configUtils';
import Image from 'components/Image';
import Link from 'components/Link';
import AddressLov from 'components/AddressLov';
import compareNoData from '@/assets/images/icon-price-compare-nodata.svg';
import { getCurrentOrganizationId } from '@/utils/utils';

import EmptySvg from './EmptySvg';
import styles from './index.less';

let deleteIndex;
let compareSwiper;
function ComparePrice(props) {
  const {
    updatePriceCompareList = (e) => e,
    pageTitle,
    dimensTemplates,
    currentAddress,
    setCurrentAddress = (e) => e,
  } = props;
  const {
    userId,
    organizationId,
    levelPath,
    regionId,
    companyId,
    addressInfo,
    invoiceOrgId,
    purchaseOrgId,
    unitId,
    defaultAddress,
    compareFlag,
  } = getUserConfigInfo();
  const storageKey = `${userId}_price_compare`;
  const { data = [], visible } = getStorage(storageKey) || {};
  // const [, setUpdate] = useState(0);
  const addressRef = useRef();

  // 实时更新价格
  useEffect(() => {
    getSalePrice(data);
  }, [visible]);

  // 初始化实例轮播
  useEffect(() => {
    compareSwiper = new Swiper('#compare-product-block', {
      prevButton: '.compare-product-prev',
      nextButton: '.compare-product-next',
      slidesPerView: 4,
      slidesPerGroup: 4,
      width: 1040,
      height: 140,
      spaceBetween: 0,
    });

    return () => {
      if (compareSwiper) {
        compareSwiper.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (compareSwiper) {
      compareSwiper.update();
      if (typeof deleteIndex === 'number') {
        const slideIndex = data.length >= deleteIndex ? deleteIndex : data.length - 1;
        compareSwiper.slideTo(slideIndex);
      } else {
        compareSwiper.slideTo(0);
      }
      deleteIndex = null;
    }
    // setUpdate(c => c + 1);
  }, [data.length]);

  // 查询价格
  async function getSalePrice(updateProducts) {
    // 查询价格服务可售参数
    const skuParamDTOS = updateProducts.map((m) => ({
      quantity: 1,
      skuId: m.productId,
      sourceFrom: m.sourceFrom,
    }));
    const ecProductCheckDto = {
      tenantId: organizationId,
      ...addressInfo,
    };
    const params = {
      companyId,
      regionId,
      skuParamDTOS,
      ecProductCheckDto,
      queryEcPriceFlag: true,
      unitLevelPath: levelPath,
    };
    if (skuParamDTOS.length > 0) {
      const res = await checkSaleBySagm(params);
      const newData = data?.map((p) => {
        const findProduct = res?.find((i) => i.skuId === p.productId);
        if (findProduct) {
          return { ...p, priceMeaning: numberRender([findProduct, 'sellPrice']) };
        } else {
          return p;
        }
      });
      updatePriceCompareList('update', {}, newData);
    }
  }

  // 删除事件
  function handleDelete(item, index) {
    updatePriceCompareList('delete', item);
    deleteIndex = index;
  }

  function handleCompare(path, key) {
    const {
      location: { pathname, search },
    } = props;
    setStorage(`${userId}_${key}`, data);
    props.history.push({
      pathname: path,
      // search: _search,
      state: {
        breadcrumbs: [
          {
            backPath: `${pathname}${search}`,
            text: pageTitle || intl.get('mallf.common.view.productDetail').d('商品详情'),
          },
        ],
      },
    });
  }

  function renderBlock(item, index) {
    return item.type === 'white-block' ? (
      <div className="swiper-slide white-block">
        <div className="white-block-plus">
          {/* <Icons type="plus" /> */}
          <img src={compareNoData} alt="" />
        </div>
        <p>{intl.get('mallf.common.view.continueAddProductCompare').d('继续添加商品进行对比')}</p>
      </div>
    ) : (
      <div className="swiper-slide product-block">
        <Icon
          onClick={() => handleDelete(item, index)}
          className="compare-delete-icon"
          type="close"
        />
        <div className="product-info">
          <Link to={`/product-detail?productId=${item.productId}&sourceFrom=${item.sourceFrom}`}>
            <Image value={item.imagePath} width={60} height={60} />
          </Link>
          <div className="product-param">
            {/* 商品详情-比价价格 */}
            <p className="product-price text-overflow">
              <span className="currencySymbol">{item?.currencySymbol}</span>
              <SpanTitle>{numberRender([item, 'price'])}</SpanTitle>
            </p>
            <Link to={`/product-detail?productId=${item.productId}&sourceFrom=${item.sourceFrom}`}>
              <p className="product-name">{item.productName}</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 生成比价单
  async function handlePriceCompare() {
    const { isNewCart } = getUserConfigInfo();
    const customDimensionMap = getUserCustomDimension();
    const list = data || [];
    const primaryProduct = list?.[0] || {};
    const cacheAddress = getCacheAddress();
    const newAddress = isEmpty(currentAddress)
      ? isEmpty(defaultAddress)
        ? cacheAddress
        : defaultAddress
      : currentAddress;
    const productCompare = {
      userId,
      regionId: newAddress.regionId || regionId,
      addressId: newAddress.addressId,
      unitId,
      companyId,
      levelPath,
      ...primaryProduct,
      tenantId: organizationId,
      productCompareAssignList: list.map((n) => {
        const { deliveryCycle, ...other } = n;
        return other;
      }),
    };
    const params = {
      productCompare, // 比价单参数
      shoppingCart: {}, // 老加入购物车参数
      cart: {}, // 新加入购物车参数
      isNewCartFlag: !!isNewCart, // 是否新购物车 true是 false否
      customDimensionMap,
    };
    const addressFlag = validAddress({ currentAddress: newAddress, addressRef, product: list[0] });
    if (!addressFlag) return;
    if (isNewCart) {
      const paramsdata = addNewCareParams({
        product: list[0],
        dimensTemplates,
        currentAddress: newAddress,
        supplierCompanyId: list[0].supplierCompanyId,
        tmpQuantity: 1,
        cartSource: 'COMPARE',
        openCartFlag: getOpenCartFlag() ? 1 : 0,
      });
      if (!paramsdata) return;
      params.cart = paramsdata;
    } else {
      params.shoppingCart = {
        addressId: newAddress.addressId,
        tenantId: getCurrentOrganizationId(),
        unitId,
        companyId,
        levelPath,
        skuType: 0,
        quantity: 1,
        organizationId,
        ownerId: userId,
        invOrganizationId: invoiceOrgId,
        purOrganizationId: purchaseOrgId,
        productId: primaryProduct.productId,
        productSource: primaryProduct.sourceFrom,
        unitPrice: primaryProduct.price,
        latestPrice: primaryProduct.price,
        purchaseType: 'COMPANY',
        cartSource: 'COMPARE',
        openCartFlag: getOpenCartFlag() ? 1 : 0,
      };
    }
    await fetchAddPriceCompare(params);
    const query = {
      productId: primaryProduct.productId,
      regionId: newAddress.regionId || regionId,
      addressId: newAddress.addressId,
      levelPath,
    };
    props.history.push(`/price-compare?${qs.stringify(query)}`);
  }

  const validCompareMsg = validCompareLimit(data || []);

  return (
    <div
      id="mall-compare"
      className={styles['compare-price-wrapper']}
      style={{ width: document.querySelector('.gb-wrapper')?.offsetWidth }}
    >
      <div className="compare-price-container">
        <div className="compare-price-header">
          <p>
            {intl.get('mallf.common.view.productCompare').d('商品对比')}（{data.length}）
          </p>
          <a onClick={() => updatePriceCompareList('close')}>
            {intl.get('mallf.common.model.hide').d('隐藏')}
          </a>
        </div>
        <div className="compare-price-content">
          <div id="compare-product-block" className="swiper-container swiper">
            <div className="swiper-wrapper">{data.map(renderBlock)}</div>
            {/* 插件需要获取dom节点，所以用display:none隐藏 */}
            <div
              className="compare-product-prev"
              style={{ display: data.length > 4 ? 'flex' : 'none' }}
            >
              <Icon type="keyboard_arrow_left" />
            </div>
            <div
              className="compare-product-next"
              style={{ display: data.length > 4 ? 'flex' : 'none' }}
            >
              <Icon type="keyboard_arrow_right" />
            </div>
          </div>
          <div r-if={data.length < 4} className="compare-product-empty">
            <div className="compare-product-empty-container">
              <EmptySvg />
              <p>{intl.get('mallf.common.view.compareProductEmpty').d('请选择商品进行对比')}</p>
            </div>
          </div>
          <div r-if={data.length > 0} className="compare-price-options">
            <Button
              onClick={() => handleCompare('/products-compare', 'attr_compare')}
              color="primary"
              disabled={data.length < 1}
              className="compare-price-option-compare"
              loading={!data?.every((i) => !!i.productSkuAttrDTOS)}
            >
              {intl.get('mallf.common.model.compare').d('商品比价')}
            </Button>
            <Button
              color="primary"
              funcType="link"
              className="compare-price-clear"
              onClick={() => {
                updatePriceCompareList('deleteAll');
                setStorage(`${userId}_attr_compare`, null);
              }}
            >
              {intl.get('mallf.common.model.clearCompare').d('清空对比')}
            </Button>
            <Tooltip title={validCompareMsg}>
              <Button
                r-if={compareFlag !== 2}
                color="primary"
                funcType="link"
                style={{ height: 24, marginLeft: 0 }}
                disabled={validCompareMsg}
                onClick={() => handlePriceCompare()}
              >
                <div className="text-overflow compare-price-create">
                  <span>{intl.get('mallf.common.model.createCompareOrder').d('生成比价单')}</span>
                  <Icon r-if={validCompareMsg} type="help" />
                </div>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <AddressLov
        mode="button"
        className="address-lov"
        clearButton={false}
        onRef={(ref) => {
          addressRef.current = ref;
        }}
        lovPara={{ companyId, userId }}
        onChange={(address) => setCurrentAddress(address)}
      />
    </div>
  );
}

export default connect(({ global }) => ({
  language: global.language,
}))(withRouter(ComparePrice));
