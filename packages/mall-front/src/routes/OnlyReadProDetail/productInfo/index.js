import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';

import Swiper from 'swiper';
import { SupplierComponent } from 'utils/renderer';
import useRequest from '@/hooks/useRequest';
import Link from 'components/Link';
import Swal from 'components/swal';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { HmallOptions } from 'utils/options';
import { getAccessToken, getUserConfigInfo, numberRender } from 'utils/utils';

import {
  queryStock,
  // getProductDetail,
  getSameProductList,
  queryGift,
  queryExtensionIns,
  fetchBudgetLov,
} from 'services/productDetailService';
import RangePrice from './rangePrice';

import Spec from './spec';
import Price from './price';
import styles from './index.less';
import BudgetInfo from './BudgetInfo';
import ChangeAddressModal from './ChangeAddressModal';

// let timer;
export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
}))(
  withRouter(function ProductInfo(props) {
    const {
      userId,
      // companyId,
      // ouId,
      organizationId,
      // purchaseType,
      // invoiceOrgId,
      // invoiceOrgName,
      // purchaseOrgId: initPurOrgId,
      // purchaseOrgName,
      visitConfig: { visitorFlag, priceFlag },
      addressInfo,
      // skuCheckFlag,
    } = getUserConfigInfo();
    const {
      similarData,
      sourceFrom,
      productId,
      productData,
      setCartLoading,
      currentAddress = {},
      count,
      // setItemInfo,
    } = props;
    // const onCataStock = sourceFrom === 'CATA' && skuCheckFlag; // 目录化商品开启了库存校验
    // const offCataStock = sourceFrom === 'CATA' && !skuCheckFlag; // 目录化商品关闭了库存校验
    const { resData: belongTypeList } = useRequest({
      url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
      query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
    });
    // const [update, setUpdate] = useState(false);
    // const [configFlag, setConfigFlag] = useState(false);
    // const [invOrganizationName, setInvOrganizationName] = useState(invoiceOrgName);
    // const [purchaseOrganName, setPurchaseOrganName] = useState(purchaseOrgName);
    // const [stockNumber, setStockNumber] = useState(undefined);
    // const [stockState, setStockState] = useState(undefined);
    const [deliveryPay, setDeliveryPay] = useState(undefined);
    // const [addCartLoading, setAddCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState('');
    // const [visible, setVisible] = useState(false);
    const [Initvisible, setInitvisible] = useState(false);
    const [sameProduct, setSameProduct] = useState([]);
    const [giftInfo, setGiftInfo] = useState({});
    const [lowestPrice, setLowestPrice] = useState();
    // const [JDServicesList, setJDServicesList] = useState([]);
    // const [selectedJDServicesList, setSelectedJDServicesList] = useState([]);
    // const [JDServicesIndex, setJDServicesIndex] = useState(-1);
    // const [serviceLoading, setServiceLoading] = useState(false);
    const [budgetList, setBudgetList] = useState([]);
    // const [fetchBudgetLoading, setFetchBudgetLoading] = useState(true);
    // const [subInvoice, SetSubInvoice] = useState(undefined);
    // const [subPurchase, SetSubPurchase] = useState(undefined);
    // const [budget, setBudget] = useState({});

    const {
      // itemCode, // 物料编码
      agreementPrice, // 协议价
      minPurchaseQuantity, // 最小采购量
      // shelfFlag, // 上下架状态
      // suppliershelfFlag, // 供应商上下架状态
      // shelfStatus, // 平台级上下架状态
      checkSaleResult: ecProductCheckVO,
      ladderEnableFlag,
      productLadderPrices,
      skuName, // 商品名称
      price, // 新的价格字段
      // showSupplierName: supplierCompanyName, // 供应商公司名称
      skuCode, // 商品编号
      // lockStatus, // 解锁状态
      thirdSkuId,
      // maxPurchaseQuantity, // 电商单次购买最大购买量
      // unShelfReasonMessage, // 下架原因说明
      productSkuAttrDTOS = [],
      // stockQuantity = null,
      // minPackageQuantity = 1, // 最小包装量
      // agreementLineId, // 协议行id
      // benchmarkPrice, // 基准价
      // itemCategoryId, // 物料分类id
      // itemCode,
      // itemName,
      // skuRefType,
      // taxRate,
      // uomName,
      // catalogId,
    } = productData;
    const marketingUnit = productSkuAttrDTOS?.filter((item) => item.attrCode === '000000000005');

    // const [materielCode, setMaterielCode] = useState(itemCode); // 物料编码
    const comOrPerson = !!Number(sessionStorage.getItem('comOrPersonRule')); // 1为个人，0为公司
    useEffect(() => {
      getSameProductList({ productId })
        .then((res) => {
          setSameProduct(res);
          let tmpLow;
          if (res) {
            res.forEach((item) => {
              if (!tmpLow && tmpLow !== 0) {
                tmpLow = item.agreementPrice;
              } else if (item.agreementPrice < tmpLow) {
                tmpLow = item.agreementPrice;
              }
            });
            setLowestPrice(tmpLow);
          }
        })
        .finally(() => {
          // eslint-disable-next-line no-new
          new Swiper('#same-images', {
            prevButton: '.same-images-prev',
            nextButton: '.same-images-next',
            slidesPerView: 5,
            slidesPerGroup: 5,
            width: 490,
            spaceBetween: 0,
          });
        });
    }, []);

    // 地址信息变动带来的联动
    useEffect(() => {
      giftQuery();
      fetchEcService();
      stockQuery(currentAddress.addressId);
    }, [currentAddress.addressId]);

    // 更新数据
    useEffect(() => {
      const initQuantity = minPurchaseQuantity || 1;
      setQuantity(initQuantity);
      // if (ladderEnableFlag === 1) setMinProductNumber(productLadderPrices[0].ladderFrom );
      let currentUnit = agreementPrice !== 0 ? agreementPrice || price : 0;
      // if (sourceFrom !== 'CATA' && ladderEnableFlag === 1) {
      if (ladderEnableFlag === 1 && productLadderPrices.length > 0) {
        productLadderPrices.forEach((item) => {
          const { ladderFrom, ladderTo, taxPrice } = item;
          if (initQuantity >= ladderFrom && initQuantity < ladderTo) {
            currentUnit = taxPrice;
          }
        });
      }
      setCurrentPrice(currentUnit);
    }, [productData]);

    // useEffect(() => {
    //   if (quantity > MaxProductNumber || quantity < MinProductNumber) {
    //     timer = setTimeout(() => {
    //       if (quantity > MaxProductNumber) {
    //         setQuantity(MaxProductNumber);
    //       }
    //       if (quantity < MinProductNumber) {
    //         setQuantity(MinProductNumber);
    //       }
    //       updatePrice();
    //     }, 500);
    //   }
    //   updatePrice();
    // }, [quantity]);

    // 获取预算值集
    useEffect(() => {
      fetchBudgetLov()
        .then((res) => {
          if (res) {
            setBudgetList(res);
          }
        })
        .finally(() => {});
    }, []);

    const showSameProduct = (cPrice) => {
      return sameProduct.map((item) => (
        <div className="swiper-slide">
          <div className="content-slide">
            <Link to={`/product-detail?productId=${item.id}&sourceFrom=${item.sourceFrom}`}>
              <div className="same-price">
                {lowestPrice === item.agreementPrice && lowestPrice <= cPrice ? (
                  <div className="same-price-low">
                    {numberRender(item.agreementPrice, 2)}
                    <div className="same-price-low-after">
                      {intl.get(`mallf.productDetail.model.productDetail.lowest`).d('最低')}
                    </div>
                  </div>
                ) : (
                  <div>{numberRender(item.agreementPrice, 2)}</div>
                )}
              </div>
              <div className="diff-company">{item.showSupplierName}</div>
              <div className="add-compare">
                {intl.get(`mallf.productDetail.view.addComapr`).d(`加入比价`)}
              </div>
            </Link>
          </div>
        </div>
      ));
    };

    function openTable() {
      setInitvisible(!Initvisible);
    }

    // 查询赠品
    const giftQuery = () => {
      const { addressId, regionCodeList = [], addressName } = currentAddress;
      const addressPara = addressId
        ? {
            provinceId: regionCodeList?.[0],
            cityId: regionCodeList?.[1],
            countyId: regionCodeList?.[2],
            address: addressName,
          }
        : addressInfo;
      const params = {
        ...addressPara,
        tenantId: organizationId,
        skuId: thirdSkuId,
        supplierCode: sourceFrom,
      };
      if (sourceFrom !== 'CATA') {
        queryGift(params).then((res) => {
          setGiftInfo(res);
        });
      }
    };

    function fetchEcService() {
      const { addressId, regionCodeList = [], addressName } = currentAddress;
      const params = addressId
        ? {
            provinceId: regionCodeList?.[0],
            cityId: regionCodeList?.[1],
            countyId: regionCodeList?.[2],
            address: addressName,
          }
        : addressInfo;
      if (sourceFrom !== 'CATA') {
        // setServiceLoading(true);
        queryExtensionIns({
          ...params,
          tenantId: organizationId,
          supplierCode: sourceFrom,
          skuId: thirdSkuId,
        })
          .then((res) => {
            if (!res.success) {
              Swal(res.resultMsg);
            }
          })
          .finally(() => {});
      }
    }

    /**
     * 查询商品库存
     * @param {Number} addressId - 地址 id
     */
    const stockQuery = (addressId) => {
      // if (ecPlatform && addressId) {
      if (addressId) {
        setCartLoading(true);
        const queryParams = { addressId, platformCode: sourceFrom };
        Promise.all([queryStock(queryParams, [sourceFrom === 'CATA' ? skuCode : thirdSkuId])])
          .then((res) => {
            // const stockData = res[0] || [];
            const payData = res[1] || {};
            // setStockNumber(offCataStock ? 999999999 : stockData[0]?.skuStock);
            // setStockState(offCataStock ? 1 : stockData[0]?.stockState);
            if (!payData.code) {
              setDeliveryPay(payData.result);
            }
          })
          .finally(() => {
            setCartLoading(false);
          });
      }
    };

    // 电商、目录化库存信息展示
    // function renderCurrentStockInfo() {
    //   const noStock = stockState === 5 || (stockNumber === 0 && stockState === 1);
    //   const inStock = stockState === 1 && stockNumber === -1;
    //   let currentStock = 1;
    //   if (noStock) {
    //     currentStock = 0;
    //   } else if (inStock) {
    //     currentStock = 1;
    //   } else if (stockState === 1 && stockNumber > 0 && stockNumber <= 50) {
    //     currentStock = 7;
    //   } else {
    //     currentStock = stockState;
    //   }

    //   const descMapping = {
    //     0: intl
    //       .get(`mallf.productDetail.model.noStockByAddress`)
    //       .d('该收货地址所需购买的商品暂无库存'),
    //     1: intl.get('mallf.productDetail.model.inStockOne').d('有货 现货-下单立即发货'),
    //     2: intl.get('mallf.productDetail.model.inStockTwo').d('有货 在途-预计2~6天到达本仓库'),
    //     3: intl.get('mallf.productDetail.model.inStockThree').d('有货 可配货-下单后从有货仓库配货'),
    //     4: intl.get('mallf.common.model.subscribe').d('预订'),
    //     6: intl.get('mallf.productDetail.model.noStockAndSubscribe').d('无货开预定'),
    //     7: intl
    //       .get('mallf.productDetail.model.stockMinZeroMax50', {
    //         value: stockNumber,
    //       })
    //       .d(`仅剩${stockNumber}件`),
    //   };

    //   return descMapping[currentStock];
    // }
    // 商品品牌+商品广义分类+商品型号+商品关键属性信息
    // const name = ecProductName || cataProductName;
    if (skuName) document.title = skuName;
    // const productNum = ecProductNum || cataProductNum;
    const priceProps = {
      currentPrice,
      sourceFrom,
      marketingUnit,
      prePrice: price,
      productId,
      hasPrice: typeof agreementPrice === 'number',
    };
    const addressColumns = [
      {
        title: intl.get(`mallf.productDetail.model.type`).d('类型'),
        align: 'left',
        width: 100,
        dataIndex: 'belongTypeMeaning',
        queryDataIndex: 'belongType',
        isQuery: true,
        isSelect: true,
        queryData: belongTypeList,
      },
      {
        title: intl.get(`mallf.productDetail.view.contact`).d('联系人'),
        align: 'left',
        width: 100,
        dataIndex: 'contactName',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.productDetail.view.tel`).d('电话'),
        align: 'left',
        width: 120,
        dataIndex: 'mobile',
      },
      {
        title: intl.get(`mallf.productDetail.view.email`).d('邮箱'),
        align: 'left',
        width: 200,
        dataIndex: 'email',
      },
      {
        title: intl.get(`mallf.productDetail.model.addressDetail`).d('详细地址'),
        align: 'left',
        width: 250,
        // isQuery: true,
        dataIndex: 'fullAddress',
      },
      {
        title: intl.get(`mallf.productDetail.model.inventoryOrg`).d('库存组织'),
        align: 'left',
        width: 180,
        // isQuery: true,
        dataIndex: 'invOrganizationName',
      },
    ];
    const { ecPlatFromName } = HmallOptions();
    const showLadderPrices = !!ladderEnableFlag && productLadderPrices.length > 0;
    // 水滴筹预算维度默认值遍历过渡对象
    // let transitBudgetObj = {};
    // const setBudgetCallBack = useCallback(data => {
    //   transitBudgetObj = { ...transitBudgetObj, ...data };
    //   setBudget(transitBudgetObj);
    // }, []);

    const ChangeAddressModalProps = { Initvisible, addressColumns, openTable };
    const budgetInfoProps = {
      budgetList,
      productData,
    };
    return (
      <div className={styles['product-detail-content']}>
        <div className="product-title">
          <p className="p-name">
            <SupplierComponent>
              {sourceFrom !== 'CATA' && (
                <span className="platform-jd">{ecPlatFromName[sourceFrom]}</span>
              )}
            </SupplierComponent>
            {skuName}
          </p>
        </div>
        {!(!userId && visitorFlag && !priceFlag) ? (
          <>
            <Price {...{ ...priceProps, showSameProduct, sameProduct, showLadderPrices }} />
            {showLadderPrices && (
              <RangePrice
                {...priceProps}
                productLadderPrices={productLadderPrices}
                setQuantity={setQuantity}
                quantity={quantity}
              />
            )}
          </>
        ) : null}
        {/* {materielCode && (
        <Spin key={loading} spinning={loading} size="small">
          <div className="product-attr">
            <div className="p-label">{intl.get(`mallf.common.view.item.code`).d('物料编码')}</div>
            <div className="p-content">
              <span>{materielCode}</span>
            </div>
          </div>
        </Spin>
      )} */}
        {(getAccessToken() || userId) && (
          <div className="product-config-link">
            <div className="product-attr">
              <div className="p-label " style={{ verticalAlign: 'top' }}>
                {intl.get(`mallf.productDetail.view.receive.info`).d('收货信息')}
              </div>
              <div className="p-content">
                <span style={{ marginRight: '20px', display: 'inline-block', width: '200px' }}>
                  {currentAddress.addressName ||
                    (comOrPerson
                      ? intl.get('mallf.productDetail.model.add.receive.info').d('请添加收货信息')
                      : intl
                          .get('mallf.productDetail.model.noAddress.warning')
                          .d('请维护公司地址'))}
                </span>
                <ChangeAddressModal {...ChangeAddressModalProps} />
              </div>
            </div>
          </div>
        )}
        {/* 取消cata对spec的控制 */}
        <div className="product-attr" style={{ paddingBottom: similarData.length > 0 ? 5 : 0 }}>
          <Spec data={similarData} sourceFrom={sourceFrom} productId={productId} />
        </div>
        {!!giftInfo.result && (
          <React.Fragment>
            <div className="product-gift">
              <div className="product-attr">
                <div className="p-label">{intl.get(`mallf.productDetail.view.gift`).d('赠品')}</div>
                <div className="p-content">
                  {giftInfo.result?.giftVOList.map((item) => {
                    return (
                      item.giftType === 2 && (
                        <div className="gift-item">
                          <a title={item.skuName}>
                            <img alt="" src={item.imagePath} className="gift-img" />
                          </a>
                          <em className="gift-number">{`× ${item.num}`}</em>
                        </div>
                      )
                    );
                  })}
                  <div className="gift-limit">{`（${giftInfo.result?.giftDesc}）`}</div>
                </div>
              </div>
            </div>
            <div className="product-gift">
              <div className="product-attr">
                <div className="p-label">
                  {intl.get(`mallf.productDetail.view.attachment`).d('附件')}
                </div>
                <div className="p-content">
                  {giftInfo.result?.giftVOList.map((item) => {
                    return (
                      item.giftType === 1 && (
                        <div className="gift-item-attachment">
                          <a title={item.skuName}>{item.skuName}</a>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
        <BudgetInfo {...budgetInfoProps} />
        {marketingUnit?.[0]?.description && (
          <div className="product-attr">
            <div className="p-label">{intl.get('mallf.productDetail.view.uom').d('单位')}</div>
            <div className="p-content">
              <span>{marketingUnit?.[0]?.description}</span>
            </div>
          </div>
        )}
        <div className="product-attr">
          <div className="p-label">{intl.get('mallf.productDetail.view.num').d('数量')}</div>
          <div className="p-content">
            <span>{count || 1}</span>
          </div>
        </div>
        {/* <div className="product-attr">
          <div className="stock">
            <div className="stock-info">
              {currentAddress.addressId && (
                <span key={currentAddress.addressId} className="product-stock">
                  {(ecProductCheckVO &&
                    !ecProductCheckVO.saleState &&
                    (sourceFrom !== 'CATA' || onCataStock)) ||
                  lockStatus !== 1 ? (
                    <span>
                      *
                      {lockStatus !== 1
                        ? intl.get(`mallf.productDetail.view.lockedProduct`).d('该商品被锁定')
                        : intl
                            .get(`mallf.productDetail.view.commodityNoSale`)
                            .d('该商品暂时不可售')}
                    </span>
                  ) : stockNumber === undefined ? (
                    intl.get(`mallf.productDetail.view.stockQueryIng`).d('库存查询中')
                  ) : (
                    <React.Fragment>
                      {[shelfFlag, shelfStatus, suppliershelfFlag].some(flag => flag !== 1) ? (
                        <span>
                          *
                          {unShelfReasonMessage ||
                            intl.get(`mallf.productDetail.view.commodityShelf`).d('该商品已下架')}
                        </span>
                      ) : (
                        <span>
                          *
                          {offCataStock
                            ? stockQuantity
                              ? `${intl
                                  .get('mallf.common.model.currentStock')
                                  .d('当前库存')}${stockQuantity}`
                              : intl.get('mallf.common.model.inStock').d('有货')
                            : renderCurrentStockInfo()}
                        </span>
                      )}
                    </React.Fragment>
                  )}
                </span>
              )}
            </div>
          </div>
        </div> */}
        {ecProductCheckVO && (!!ecProductCheckVO.is7ToReturn || deliveryPay !== undefined) && (
          <div className="product-service">
            {!!ecProductCheckVO.is7ToReturn && (
              <div className="product-attr">
                <div className="p-label" style={{ top: '1px' }}>
                  {intl.get(`mallf.common.view.tips`).d('温馨提示')}
                </div>
                <div className="p-content">
                  <Icons
                    type="tianwuliyoutuihuo"
                    className="primary-color"
                    style={{ marginRight: '5px' }}
                  />
                  <span className="p-content-desc">
                    {intl.get(`mallf.productDetail.view.is7ToReturn`).d('支持 7 天无理由退货')}
                  </span>
                  {deliveryPay !== undefined ? (
                    deliveryPay ? (
                      <span
                        style={{
                          marginTop: '8px',
                          marginLeft: '20px',
                        }}
                      >
                        <Icons type="zhichihuodaofukuan" className="primary-color" />{' '}
                        <span className="p-content-desc">
                          {intl
                            .get(`mallf.productDetail.view.supportPayGoods`)
                            .d('该商品支持货到付款')}
                        </span>
                      </span>
                    ) : (
                      <span
                        style={{
                          color: '#E85050',
                          marginTop: '8px',
                          marginLeft: '20px',
                        }}
                      >
                        <Icons type="buzhichihuodaofukuan" />{' '}
                        <span className="p-content-desc">
                          {intl
                            .get(`mallf.productDetail.view.noSupportPayGoods`)
                            .d('该商品不支持货到付款')}
                        </span>
                      </span>
                    )
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  })
);
