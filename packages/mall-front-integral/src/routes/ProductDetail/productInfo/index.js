import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Spin, Icon } from 'choerodon-ui';
import { NumberField } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import qs from 'qs';

import Swal from 'components/swal';
import LabelPreview from 'components/LabelPreview';
import intl from 'utils/intl';
import Fly from 'utils/flyCart';
import {
  getUserConfigInfo,
  getProductLimit,
  getPrecision,
  getToFixed,
  priceNumberRender,
  numberRender,
  getCurrentLanguage,
  calcValidatePack,
} from 'utils/utils';
import { getNumberLocalized } from 'utils/numberRender';
import { accessIsLogin } from 'services/api';
import { addCartService, buyNowService } from '@/services/productDetailService';
import { getPriceColor } from 'mall-front/lib/utils/utils';
import { math } from 'choerodon-ui/dataset';
import DropSelect from '@/components/DropSelect';
import CuxWrapper from 'mall-front/lib/cuxTools/CuxWrapper';
import { SupplierComponent } from 'utils/renderer';

import Counter from './Counter';
import Spec from './spec';
import BuyNow from './BuyNow';
import AddressInfo from './AddressInfo';
import RangePrice from './rangePrice';
import styles from './index.less';
import SaleQuality from './SaleQuality';

let timer;
export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
}))(
  withRouter(function ProductInfo(props) {
    const {
      userId,
      hideFieldList = [],
      skuCheckFlag,
      // levelPath,
      // unitId,
    } = getUserConfigInfo();
    const {
      similarData,
      sourceFrom,
      productId,
      productData,
      setCartLoading,
      saleLoading,
      fetchDefaultAddress,
      // handleAddCompare,
      currentAddress = {},
      updateAddress = (e) => e,
      // history,
      // setItemInfo,
      dispatch,
    } = props;
    const {
      // id,
      // itemCode, // 物料编码
      supplierCompanyId, // 供应商
      agreementPrice, // 协议价
      minPurchaseQuantity, // 最小采购量
      purchaseQuantityLimit, // 目录化最大购买量
      // shelfFlag, // 上下架状态
      // suppliershelfFlag, // 供应商上下架状态
      // shelfStatus, // 平台级上下架状态
      checkSaleResult: ecProductCheckVO,
      ladderPriceFlag: ladderEnableFlag,
      skuName, // 商品名称
      latestPrice: price = 0, // 新的价格字段
      // supplierCompanyName, // 供应商公司名称
      // lockStatus, // 解锁状态
      maxPurchaseQuantity, // 电商单次购买最大购买量
      errorMessage, // 下架原因说明
      productSkuAttrList: productSkuAttrDTOS = [],
      // stockQuantity = null,
      minPackageQuantity = 1, // 最小包装量
      // agreementLineId, // 协议行id
      // benchmarkPrice, // 基准价
      // itemCategoryId, // 物料分类id
      // itemCode,
      // itemName,
      // skuRefType,
      // taxRate,
      // uomName,
      // catalogId,
      ladderPriceFlag,
      // ladderPriceList,
      // ladderPriceList: productLadderPrices, // 未含税阶梯价
      uomPrecision,
      skuTitle,
      defaultPrecision,
      customFlag,
      agreementBusinessType, // 积分类型
      postageRule, // 运费规则
      installRule, // 安装费规则
      // pointPrice, // 积分价格
      deliveryType, // 配送方式
      saleQuantity: productSaleQuantity, // 销量
      supplyTagDesc, // 供应商标签
      skuLabelList: labelList,
      // exchangeRate = 1,
      // sameSkuList: sameProduct, // 同类商品
      marketPrice,
      invalidFlag, // 商品可售状态
      skuStock: stockNumber, // 库存量
      stockState,
      proxySupplierCompanyId,
      proxyInvOrganizationId,
      proxyPurOrganizationId,
      paymentType, // 支付类型
      currencySymbol, // 币种
      // pointsLimit, // 积分限制
      // pointsTypeId,
      // pointsTypeName,
      pointsTypeList = [],
      estimatedDeliveryDate,
      operationAuth,
    } = productData;
    // const onCataStock = sourceFrom === 'CATA' && skuCheckFlag; // 目录化商品开启了库存校验
    const offCataStock = sourceFrom === 'CATA' && !skuCheckFlag; // 目录化商品关闭了库存校验
    const [update, setUpdate] = useState(false);
    const [addCartLoading, setAddCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [MinProductNumber, setMinProductNumber] = useState(1);
    const [MaxProductNumber, setMaxProductNumber] = useState(1);
    const [currentPrice, setCurrentPrice] = useState('');
    const [currentPointPrice, setCurrentPointPrice] = useState('');
    const [Initvisible, setInitvisible] = useState(false);
    const [integral, setIntegral] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [_, setSecondCompare] = useState(0);
    const [
      {
        pointPrice,
        exchangeRate = 1,
        pointsTypeId,
        pointsLimit,
        pointsTypeName,
        ladderPriceList,
        ladderPriceList: productLadderPrices,
      },
      setPointData,
    ] = useState({}); // 积分数据

    const defaultValue = uomPrecision && !customFlag ? getPrecision(uomPrecision) : 1;
    const marketingUnit = productSkuAttrDTOS?.filter((item) => item.attrCode === '000000000005');

    // 更新积分数据
    useEffect(() => {
      setPointData({
        pointsLimit: productData?.pointsLimit,
        pointPrice: productData?.pointPrice,
        exchangeRate: productData?.exchangeRate,
        pointsTypeId: productData?.pointsTypeId,
        pointsTypeName: productData?.pointsTypeName,
        ladderPriceList: productData?.ladderPriceList,
      });
    }, [productData?.pointsTypeId]);

    // 更新数据
    useEffect(() => {
      // const initQuantity = minPurchaseQuantity || 1;
      const [min, max] = getProductLimit({
        sourceFrom,
        minPurchaseQuantity,
        maxPurchaseQuantity,
        purchaseQuantityLimit,
        ladderPriceLimit: productLadderPrices,
      });
      setQuantity(min);
      setMinProductNumber(min);
      setMaxProductNumber(max);
      let currentUnit = agreementPrice !== 0 ? agreementPrice || price : 0;
      let currentPoint = pointPrice;
      if (ladderEnableFlag === 1 && productLadderPrices?.length > 0) {
        productLadderPrices.forEach((item) => {
          const { ladderFrom, ladderTo, salePrice } = item;
          if (min >= ladderFrom && min < ladderTo) {
            currentUnit = salePrice;
            currentPoint = item.pointPrice;
          }
        });
      }
      setCurrentPrice(currentUnit);
      setCurrentPointPrice(currentPoint);
    }, [productData, productLadderPrices, productLadderPrices?.length]);

    useEffect(() => {
      if (quantity && (quantity > MaxProductNumber || quantity < MinProductNumber)) {
        if (!uomPrecision) {
          timer = setTimeout(() => {
            if (quantity > MaxProductNumber) {
              setQuantity(MaxProductNumber);
            }
            if (quantity < MinProductNumber) {
              setQuantity(MinProductNumber);
            }
            updatePrice();
          }, 1000);
        }
      }
      updatePrice();
    }, [quantity, update]);

    // 超出最大值设置为最大值
    useEffect(() => {
      const max = diff();
      if (math.gt(integral, max)) {
        if (pointsLimit > 0) {
          setSecondCompare(Math.floor(pointsLimit / quantity));
          setIntegral(max);
        } else {
          setIntegral(max);
        }
      }
    }, [pointsLimit, currentPrice, exchangeRate, quantity, integral]);

    function openTable() {
      setInitvisible(!Initvisible);
    }

    function updatePrice() {
      if (ladderEnableFlag === 1 && ladderPriceList?.length > 0) {
        if (
          ladderPriceList[ladderPriceList.length - 1]?.ladderTo !== null &&
          quantity >= ladderPriceList[ladderPriceList.length - 1]?.ladderTo
        ) {
          setQuantity(ladderPriceList[ladderPriceList.length - 1]?.ladderTo - 1);
          setCurrentPrice(ladderPriceList[ladderPriceList.length - 1].salePrice);
          setCurrentPointPrice(ladderPriceList[ladderPriceList.length - 1].pointPrice);
        } else {
          ladderPriceList.forEach((item) => {
            const { ladderFrom, ladderTo, salePrice } = item;
            if (
              !ladderTo ? quantity >= ladderFrom : quantity >= ladderFrom && quantity < ladderTo
            ) {
              setCurrentPrice(salePrice);
              setCurrentPointPrice(item.pointPrice);
            }
          });
        }
      }
    }

    function chooseAddress(values) {
      const {
        addressId,
        fullAddress: addressName,
        regionIdList = [],
        regionCodeList = [],
        invOrganizationId: _invId,
        inventoryCode,
        inventoryId,
        inventoryName,
      } = values || {};
      const _currentAddress = {
        addressId,
        addressName,
        regionIdList,
        regionCodeList,
        invOrganizationId: _invId,
        regionId: regionIdList?.[1],
        countyCode: regionCodeList?.[2],
        inventoryCode,
        inventoryId,
        inventoryName,
      };
      if (currentAddress?.addressId === addressId) {
        setInitvisible(false);
      } else {
        updateAddress(_currentAddress); // 地址变更后操作
        // setStockNumber(undefined);
        setInitvisible(false);
      }
    }

    function minus() {
      let num = math.minus(Number(quantity), defaultValue);
      num = num < MinProductNumber ? MinProductNumber : num;
      setQuantity(num);
    }

    function add() {
      let num = math.plus(Number(quantity), defaultValue);
      num = num >= MaxProductNumber ? MaxProductNumber : num;
      setQuantity(num);
    }

    function changeVal(e) {
      let val = e.target.value;
      clearTimeout(timer);
      if (val && isNaN(val)) {
        return false;
      }
      if (uomPrecision) {
        setQuantity(getToFixed(val, uomPrecision));
      } else if (!isNaN(val) && val > 0) {
        if (val.length > 10) {
          val = 999999999;
          setUpdate((prev) => !prev);
        }
        setQuantity(+val > MaxProductNumber ? MaxProductNumber : +val);
      } else if (val === '') {
        setQuantity('');
      }
    }

    function checkVal(e) {
      const val = e.target.value;
      if (val === '' || isNaN(+val)) {
        setQuantity(minPurchaseQuantity);
      }
    }

    function validateToCart(type = 'addCart') {
      if (quantity === '' || isNaN(+quantity)) {
        setQuantity(minPurchaseQuantity);
        return;
      }
      if (quantity > MaxProductNumber) {
        Swal(
          intl
            .get('mallf.productDetail.view.maxProductNumber.warning', {
              value: MaxProductNumber,
            })
            .d(`最大采购量为${MaxProductNumber}`)
        );
        return;
      } else if (quantity < MinProductNumber) {
        Swal(
          intl
            .get('mallf.productDetail.view.minProductNumber.warning', {
              value: MinProductNumber,
            })
            .d(`最小采购量为${MinProductNumber}`)
        );
        return;
      }
      // 加入购物车之前sku校验
      const isAdd = []; // 存储每一个规格是否选择
      const specRow = document.querySelectorAll('.spec-row') || []; // 获取每一个规格的行dom
      for (let i = 0; i < specRow.length; i++) {
        // 循环遍历
        if (
          specRow[i].querySelector('.product-active') &&
          !specRow[i].querySelector('.product-active.product-disable')
        ) {
          isAdd.push(true);
          specRow[i].classList.remove('active');
        } else {
          specRow[i].classList.add('active');
          isAdd.push(false);
        }
      }
      if (
        calcValidatePack(uomPrecision, minPackageQuantity) &&
        !math.eq(math.mod(quantity, minPackageQuantity || 1), 0)
      ) {
        Swal(
          intl
            .get('mallf.common.view.minPackageQuantity.warning', {
              value: minPackageQuantity,
            })
            .d(`购买数量只能是最小包装量${minPackageQuantity}的整数倍`)
        );
        return;
      }
      if (!isAdd.includes(false)) {
        // 每一行都有选择才能加入购物车
        addOrBuyNowCart(type);
      }
    }

    function addOrBuyNowCart(type) {
      const { addressId } = currentAddress;
      if (!userId) {
        accessIsLogin();
        return;
      }
      // 校验地址和库存组织是否选择
      if (!addCartLoading || addressId) {
        const params = {
          addressId,
          proxySupplierCompanyId,
          proxyInvOrganizationId,
          proxyPurOrganizationId,
          productSource: sourceFrom,
          ownerId: userId,
          productId,
          quantity,
          supplierCompanyId,
          hybridPoint: integral,
          cartSource: 'DETAIL',
          searchUuid: qs.parse(props.location.search.substr(1))?.searchUuid,
          pointsTypeId,
        };
        setAddCartLoading(true);
        setCartLoading(true);
        if (type === 'buyNow') {
          buyNowService(params)
            .then((resp) => {
              if (resp) {
                props.history.push({
                  pathname: '/sigl/before-order',
                  data: { orderData: resp },
                });
              }
            })
            .finally(() => {
              setAddCartLoading(false);
              setCartLoading(false);
            });
        } else {
          addCartService(params)
            .then(() => {
              const fly = new Fly({
                startEle: document.querySelector(`#product-detail-add`),
                endEle: document.querySelector('#miniCart'),
                imgUrl: productData?.productImageList?.find((p) => p.type === 'IMAGE')?.imagePath,
              });
              fly.init();
              dispatch({
                type: 'global/update',
                payload: { showMiniCart: true },
              });
            })
            .finally(() => {
              setAddCartLoading(false);
              setCartLoading(false);
            });
        }
      } else if (!addressId) {
        Swal(intl.get(`mallf.productDetail.view.chooseAddress`).d('请选择地址'));
      }
    }

    const diff = () => {
      const origin = Math.ceil(currentPrice * exchangeRate);
      const current = Math.floor(pointsLimit / quantity);
      if (isEmpty(current) && !pointsLimit > 0) {
        return origin;
      } else {
        return origin > current ? current : origin;
      }
    };

    // 电商、目录化库存信息展示
    function renderCurrentStockInfo() {
      if (operationAuth === 'VIEW') {
        return intl
          .get(`mallf.common.view.operationAuthView`)
          .d('当前商品采买权限仅浏览，请联系管理员操作');
      }
      let currentStock = 1;
      let stockMessage = '';
      if (stockState === 1) {
        if (stockNumber > 0) {
          currentStock = 7;
        }
      } else if (stockState === 5) {
        currentStock = sourceFrom === 'CATA' ? 5 : 9;
      } else {
        currentStock = stockState;
      }
      switch (currentStock) {
        case 1:
        case 2:
        case 3:
          stockMessage = intl.get('mallf.productDetail.model.inStock1').d('有货');
          break;
        case 4:
        case 6:
          stockMessage = intl.get('mallf.productDetail.model.currentStock4').d('预售中');
          break;
        case 5:
          stockMessage = intl
            .get('mallf.common.view.cataStockState5')
            .d('该商品无货，请联系商城管理员');
          break;
        case 7:
          stockMessage = intl
            .get('mallf.productDetail.model.currentStock7', {
              value: getNumberLocalized(stockNumber),
            })
            .d(`剩余${getNumberLocalized(stockNumber)}`);
          break;
        case 8:
          stockMessage = intl.get('mallf.common.model.currentStock8').d('剩余10000+');
          break;
        case 9:
          stockMessage = intl
            .get('mallf.common.view.ecStockState5')
            .d('该商品针对当前区域无货，需要供应商补货，请联系商城管理员');
          break;
        default:
          break;
      }
      const descSuffix =
        [1, 7, 8].includes(currentStock) && estimatedDeliveryDate
          ? `，${estimatedDeliveryDate}`
          : '';
      return `${stockMessage}${descSuffix}`;
    }

    // 商品品牌+商品广义分类+商品型号+商品关键属性信息
    // const name = ecProductName || cataProductName;
    if (skuName) document.title = skuName;

    const ChangeAddressModalProps = { Initvisible, chooseAddress, openTable };
    const addCartDisabled = useMemo(() => {
      return (
        !(offCataStock ? false : stockState === 5 || (stockState === 1 && stockNumber === 0)) &&
        !!invalidFlag &&
        operationAuth !== 'VIEW'
      );
    }, [offCataStock, stockState, stockNumber, invalidFlag, operationAuth]);
    const buyNowProps = {
      hideFieldList,
      addCartLoading,
      saleLoading,
      validateToCart,
      invalidFlag: addCartDisabled,
    };
    const priceProps = {
      currentPrice,
      sourceFrom,
      marketingUnit,
      prePrice: marketPrice,
      productId,
      hasPrice: typeof agreementPrice === 'number',
      paymentType,
      defaultPrecision,
      pointPrice,
      setCurrentPointPrice,
      currencySymbol,
    };

    const helpnfo = () => {
      return (
        <>
          <div className="point-range">
            {intl.get(`mallf.productDetail.point.range`).d('积分可调整范围为0-')}
            {diff()}
          </div>
          <div className="range-tips">
            {intl
              .get('mallf.productDetail.range.tips')
              .d('请输入整数积分值，输入积分后自动更新现金价格')}
          </div>
        </>
      );
    };

    const showLadderPrices = ladderPriceFlag && ladderPriceList?.length > 0;
    const integralPrice = math.minus(currentPrice || 0, math.div(integral || 0, exchangeRate || 1));

    return (
      <div className={styles['product-detail-content']}>
        <div className="product-title">
          <div style={{ flex: 1 }}>
            <p className="p-name" title={skuName}>
              <SupplierComponent>
                {sourceFrom !== 'CATA' && supplyTagDesc && (
                  <span className="platform-jd">{supplyTagDesc}</span>
                )}
              </SupplierComponent>
              {skuName}
            </p>
            <p className="p-small-name">{skuTitle || ''}</p>
          </div>
          <SaleQuality productSaleQuantity={productSaleQuantity} />
        </div>
        {!!showLadderPrices && (
          <RangePrice
            {...priceProps}
            productLadderPrices={ladderPriceList}
            setQuantity={setQuantity}
            quantity={quantity}
            currencySymbol={currencySymbol}
          />
        )}
        {paymentType !== 'POINTS_PAYMENT' && (
          <div className="product-price">
            <div className="product-attr">
              {!showLadderPrices && (
                <>
                  <div
                    className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
                    title={intl.get(`mallf.common.view.sigl.vipPrice`).d('会员专享')}
                  >
                    {intl.get(`mallf.common.view.sigl.vipPrice`).d('会员专享')}
                  </div>
                  <div className="p-content">
                    <span className="p-price">
                      <span style={{ fontSize: 14 }}>{currencySymbol || ''}</span>
                      {priceNumberRender(price, defaultPrecision) || '-'}
                    </span>
                    {!isNil(marketPrice) && (
                      <span className="p-jd-price">
                        <span className="currencySymbol">{currencySymbol || ''}</span>
                        {priceNumberRender(marketPrice, defaultPrecision)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {paymentType === 'HYBRID_PAYMENT' && (
          <div>
            <div className="product-attr">
              <div
                style={{ lineHeight: '27px' }}
                className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
                title={intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}
              >
                {intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}
              </div>
              <div className="p-content point-deduction">
                <div style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 110, display: 'inline-block' }}>
                    <NumberField
                      style={{ height: 28 }}
                      prefix={
                        <Icon
                          style={{ color: '#191919', fontSize: 14, margin: '2px 0 0 8px' }}
                          type="donut_small"
                        />
                      }
                      label={intl.get('mallf.common.view.sigl.name').d('积分')}
                      step={1}
                      min={0}
                      max={diff()}
                      value={integral}
                      onChange={(e) => {
                        // 原上限逻辑 积分价格/积分汇率，向上取整
                        // const originCompare = Math.ceil(currentPrice * exchangeRate);
                        // 新增上限逻辑 pointsLimit/数量,
                        if (pointsLimit > 0) {
                          setSecondCompare(Math.floor(pointsLimit / quantity));
                          // 取两者种的最小值进行计算
                          // const currentPlan =
                          //   originCompare > secondCompare ? secondCompare : originCompare;
                          setIntegral(e);
                        } else {
                          setIntegral(e);
                        }
                      }}
                      help={helpnfo()}
                      showHelp="tooltip"
                      placement="topLeft"
                    />
                  </div>
                  <span
                    style={{ fontSize: 16, color: '#191919', margin: '0 5px', fontWeight: 600 }}
                  >
                    +
                  </span>
                  <span className="currencySymbol">{currencySymbol}</span>
                  {`${integralPrice > 0 ? priceNumberRender(integralPrice, defaultPrecision) : 0}`}
                  <DropSelect
                    r-if={pointsTypeName}
                    defaultValue={pointsTypeId}
                    defaultText={pointsTypeName}
                    optionsData={pointsTypeList}
                    textField="pointsTypeName"
                    valueField="pointsTypeId"
                    onChange={(value, item) => {
                      setPointData({
                        pointsLimit: item?.pointsLimit,
                        pointPrice: item?.pointPrice,
                        exchangeRate: item?.exchangeRate,
                        pointsTypeId: item?.pointsTypeId,
                        pointsTypeName: item?.pointsTypeName,
                        ladderPriceList: item?.ladderPriceList,
                      });
                    }}
                    style={{ marginLeft: 10 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {paymentType === 'POINTS_PAYMENT' && (
          <div>
            <div className="product-attr">
              <div
                className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
                title={intl.get('mallf.common.view.sigl.name').d('积分')}
              >
                {intl.get('mallf.common.view.sigl.name').d('积分')}
              </div>
              <div className="p-content" style={{ display: 'flex', alignItems: 'center' }}>
                <Icon style={{ color: getPriceColor(), fontSize: 14 }} type="donut_small" />
                <span className="price-color" style={{ fontSize: 22 }}>
                  {numberRender(showLadderPrices ? currentPointPrice : pointPrice)}
                </span>
                <CuxWrapper
                  path="sigl/productDetail/productInfo/marketPrice"
                  value={{ data: productData }}
                />
                <DropSelect
                  r-if={pointsTypeName}
                  defaultValue={pointsTypeId}
                  defaultText={pointsTypeName}
                  optionsData={pointsTypeList}
                  textField="pointsTypeName"
                  valueField="pointsTypeId"
                  onChange={(value, item) => {
                    setPointData({
                      pointsLimit: item?.pointsLimit,
                      pointPrice: item?.pointPrice,
                      exchangeRate: item?.exchangeRate,
                      pointsTypeId: item?.pointsTypeId,
                      pointsTypeName: item?.pointsTypeName,
                      ladderPriceList: item?.ladderPriceList,
                    });
                  }}
                  style={{ marginLeft: 10 }}
                />
              </div>
            </div>
          </div>
        )}
        {(!isEmpty(labelList) || agreementBusinessType === 'POINTS' || deliveryType === 1) && (
          <div>
            <div className="product-attr">
              <div
                className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
                title={intl.get(`mallf.common.view.label`).d('标签')}
              >
                {intl.get(`mallf.common.view.label`).d('标签')}
              </div>
              <div className="p-content">
                {/* {deliveryType === 1 && <LabelPreview code="JDSEND" />} */}
                {agreementBusinessType === 'POINTS' && (
                  <LabelPreview
                    cursor="grab"
                    code="E"
                    value={intl.get('mallf.common.view.sigl.product').d('积分商品')}
                  />
                )}
                {labelList?.map((n) => (
                  <LabelPreview
                    maxWidth="max-content"
                    cursor="grab"
                    code={n.labelColorCode}
                    value={n.labelName}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <AddressInfo
          fetchDefaultAddress={fetchDefaultAddress}
          dispatch={dispatch}
          openTable={openTable}
          currentAddress={currentAddress}
          ChangeAddressModalProps={ChangeAddressModalProps}
        />
        {/* 取消cata对spec的控制 */}
        <div className="product-attr" style={{ paddingBottom: similarData.length > 0 ? 5 : 0 }}>
          {/* {sourceFrom !== 'CATA' && ( */}
          <Spec data={similarData} sourceFrom={sourceFrom} productId={productId} />
          {/* )} */}
        </div>
        {/* {marketingUnit?.[0]?.description && (
          <div className="product-attr">
            <div className="p-label" title={intl.get('mallf.common.view.uom').d('单位')}>
              {intl.get('mallf.common.view.uom').d('单位')}
            </div>
            <div className="p-content">
              <span>{marketingUnit?.[0]?.description}</span>
            </div>
          </div>
        )} */}
        {postageRule && (
          <div className="product-attr">
            <div
              className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
              title={intl.get('mallf.common.view.rule').d('运费规则')}
            >
              {intl.get('mallf.common.view.rule').d('运费规则')}
            </div>
            <div className="p-content">
              <span>{postageRule}</span>
            </div>
          </div>
        )}
        <div r-if={installRule} className="product-attr">
          <div
            className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
            title={intl.get('mallf.productDetail.view.install.rule').d('安装费规则')}
          >
            {intl.get('mallf.productDetail.common.view.install.rule').d('安装费规则')}
          </div>
          <div className="p-content">
            <span>{installRule}</span>
          </div>
        </div>
        <div className="product-attr">
          <div className="p-label add-quantity p-label-count" style={{ verticalAlign: 'top' }}>
            <Counter
              id="add_icon"
              maxBtnClass={quantity >= MaxProductNumber ? 'disable-button' : ''}
              minBtnClass={quantity <= MinProductNumber ? 'disable-button' : ''}
              changeVal={(event) => changeVal(event)}
              minus={minus}
              add={add}
              minCountMsg={
                MinProductNumber > 1
                  ? intl
                      .get('mallf.common.model.minPurchaseNumber', { value: MinProductNumber })
                      .d(`最小购买量为${MinProductNumber}`)
                  : null
              }
              maxCountMsg={intl
                .get('mallf.common.model.maxPurchaseNumbers', { value: MaxProductNumber })
                .d(`最大购买量为${MaxProductNumber}`)}
              value={quantity}
              onBlur={(e) => {
                if (!uomPrecision) {
                  checkVal(e);
                }
              }}
            />
          </div>
          <div className="stock">
            <div className="addSpin">
              <Spin
                key={addCartLoading}
                className="product-add-spin"
                spinning={addCartLoading || saleLoading}
                size="small"
              >
                {!addCartDisabled ? (
                  <button type="button" id="product-add" className="off">
                    {intl.get(`mallf.common.model.addCart`).d('加入购物车')}
                  </button>
                ) : (
                  <div id="product-detail-add">
                    <button
                      type="button"
                      id="product-add"
                      className="product-add"
                      onClick={() => {
                        validateToCart();
                      }}
                    >
                      {intl.get(`mallf.common.model.addCart`).d('加入购物车')}
                    </button>
                  </div>
                )}
              </Spin>
              <BuyNow {...buyNowProps} />
            </div>
            <div className="stock-info">
              {currentAddress.addressId ? (
                <span key={currentAddress.addressId} className="product-stock">
                  {ecProductCheckVO && !ecProductCheckVO.saleState && sourceFrom !== 'CATA' ? (
                    <span>
                      *{intl.get(`mallf.productDetail.view.commodityNoSale`).d('该商品暂时不可售')}
                    </span>
                  ) : stockNumber === undefined ? (
                    intl.get(`mallf.productDetail.view.stockQueryIng`).d('库存查询中')
                  ) : (
                    <React.Fragment>
                      {!invalidFlag ? (
                        <span>
                          *
                          {errorMessage ||
                            intl.get(`mallf.productDetail.view.commodityShelf`).d('该商品已下架')}
                        </span>
                      ) : (
                        <span>*{renderCurrentStockInfo()}</span>
                      )}
                    </React.Fragment>
                  )}
                </span>
              ) : (
                <span className="address-warn">
                  <Icon
                    type="exclamation-circle"
                    size={12}
                    style={{ marginRight: '6px', color: '#FCA000' }}
                  />
                  {intl
                    .get('mallf.common.view.productAddressWarn')
                    .d('暂无收货地址，请先维护收货地址')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  })
);
