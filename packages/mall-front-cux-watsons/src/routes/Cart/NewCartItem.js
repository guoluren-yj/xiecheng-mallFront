import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox, Icon, Button, Spin } from 'hzero-ui';
import { Tooltip, InputNumber } from 'choerodon-ui';
import { debounce, isEmpty } from 'lodash';
import classNames from 'classnames';

import Link from 'components/Link';
import Image from 'components/Image';
import SwalAlert from 'components/swal';
import Icons from 'components/Icons';
import LabelPreview from 'components/LabelPreview';
import intl from 'utils/intl';
import {
  getUserConfigInfo,
  getStockConfig,
  numberRender,
  convertImg,
  getProductLimit,
  getPrecision,
  getToFixed,
} from 'utils/utils';
import {
  collectProductService,
  handleChangePrice,
  handleDeleteCompare,
  queryLowerProduct,
  addCompareCart,
  fetchGift,
  // deleteCompare,
} from 'services/cartService';

import style from './cartItem.less';
import CostAllocation from './CostAllocation';

const labelWidthMap = {
  1: 250,
  2: 122,
  3: 80,
};

function CartItem(props) {
  const { organizationId, skuCheckFlag } = getUserConfigInfo();
  const symbol = '';
  /** 新增的多语言 */
  const pieces = intl.get(`mallf.cart.model.cart.pieces`).d('件');
  // 选择的货币类型
  const {
    updateCart,
    deleteCart,
    updateCheck,
    item,
    updateNumber,
    rule = true,
    fetchProduct,
    item: {
      productSource,
      ladderPrices,
      minPurchaseQuantity,
      maxPurchaseQuantity,
      purchaseQuantityLimit,
      uomPrecision,
    },
    editBudget,
    labels = {},
    setQualityChange,
  } = props;

  const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;

  const [minLimit, maxLimit] = getProductLimit({
    sourceFrom: productSource,
    minPurchaseQuantity,
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    ladderPriceLimit: ladderPrices,
  });

  const { purchaseType } = getUserConfigInfo();
  const [morePrice, setMorePrice] = useState(false);
  const [update, setUpdate] = useState(false);
  // 图片usrl跳转
  const HandleImgUrl = (code, url) => {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  };
  const [lowFlag, setLowFlag] = useState(false);
  const [priceChangeFlag, setPriceChangeFlag] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [lowerProduct, setLowerProduct] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  // const comOrPerson = !!Number(sessionStorage.getItem('comOrPersonRule')); // 1为个人，0为公司

  useEffect(() => {
    if (item.priceChange === 1 && item.lowerFlag === 1) {
      setPriceChangeFlag(true);
    } else if (item.priceChange === 1) {
      setPriceChangeFlag(true);
    } else if (item.lowerFlag === 1) {
      setLowFlag(true);
    }
  }, [item.lowerFlag, item.priceChange]);

  useEffect(() => {
    document.body.addEventListener('click', handleCloseCompare, false);
    return () => {
      document.body.removeEventListener('click', handleCloseCompare, false);
    };
  }, []);

  const handleCloseCompare = (e) => {
    const element = document.querySelector('.compare-product');
    if (element && !element.contains(e.target)) {
      setCompareVisible(false);
    }
  };

  // 选择事件
  const handleOnClick = (val) => {
    const changeItem = {
      ...item,
      checked: val,
    };
    updateCheck(changeItem);
  };
  /**
   * 单条收藏商品
   */
  const handleCollect = () => {
    // if (item.productSource !== 'CATA') {
    //   item.productSource = 'EC';
    // }
    const collectProduct = [
      {
        companyId: item.companyId,
        productId: item.productId,
        productSource: item.productSource,
        purchaseType,
        tenantId: item.tenantId,
      },
    ];
    if (item.collectFlag === 1) {
      return;
    }
    collectProductService(collectProduct).then(
      SwalAlert(intl.get(`mallf.cart.view.cart.hasCollected`).d('已加入收藏'))
    );
  };

  /**
   * 单条删除商品
   */
  const handleDelete = () => {
    SwalAlert(intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？'), true).then(
      (res) => {
        // const { dispatch } = props;
        if (res.value) {
          deleteCart([item]);
        }
        // dispatch({
        //   type: 'global/update',
        //   payload: { showMiniCart: true },
        // });
      }
    );
  };

  function updateComparePrice(params) {
    handleChangePrice({ ...params, regionId: params.secondRegionId }).then(() => {
      setPriceChangeFlag(false);
      if (item.lowerFlag === 1) {
        setLowFlag(true);
      }
    });
  }

  function handleChangeProduct(id) {
    setCompareVisible(true);
    setCompareLoading(true);
    const params = { productId: id, levelPath: item.levelPath, regionId: item.secondRegionId };
    queryLowerProduct(params)
      .then((res) => {
        const newData = res.map((i) => ({
          ...i,
          checked: false,
        }));
        setLowerProduct(newData);
      })
      .finally(() => {
        setCompareLoading(false);
      });
  }

  function handleCompareVisible() {
    setCompareVisible(false);
  }

  function handleCompareChange(index, val) {
    const data = [...lowerProduct];
    data[index].checked = val;
    setLowerProduct(data);
  }

  function handleCompareAddCart() {
    const addData = lowerProduct.filter((i) => i.checked === true);
    addCompareCart({ item, addData }).then(() => {
      fetchProduct();
      setLowFlag(false);
      setCompareVisible(false);
    });
  }

  function deleteCompareList(id) {
    SwalAlert(
      intl.get(`mallf.cart.model.confirm.deleteCompareProduct`).d('确认删除比价单？'),
      true
    ).then((res) => {
      if (res.value) {
        handleDeleteCompare({
          productId: id,
          levelPath: item.levelPath,
          regionId: item.secondRegionId,
        }).then(() => {
          fetchProduct();
          SwalAlert(intl.get(`mallf.cart.model.success.deleteCompareProduct`).d('比价单删除成功'));
        });
      }
    });
  }

  /**
   * 京东服务费用
   */
  const handleDeleteService = (i) => {
    const msg =
      i.skuType === 2
        ? intl.get(`mallf.cart.model.confirm.deleteProductGift`).d('确认删除该赠品？')
        : intl.get(`mallf.cart.model.confirm.deleteProductService`).d('确认删除该服务？');
    SwalAlert(msg, true).then((res) => {
      if (res.value) {
        deleteCart([i]);
      }
    });
  };

  const renderStoreInfo = () => {
    if (item.allocationInfoList?.length > 0) {
      return (
        <Tooltip
          title={intl
            .get('mallf.common.view.prodcut.allocationWarn')
            .d('已进行了费用分配，如果有数量变更，请在费用分配上调整')}
        >
          <div className="allocation-warn">
            {intl
              .get('mallf.common.view.prodcut.allocationWarn')
              .d('已进行了费用分配，如果有数量变更，请在费用分配上调整')}
          </div>
        </Tooltip>
      );
    }
    if (item.stockFlag === 0) {
      return <span id="outOfStock">{intl.get(`mallf.common.model.noStock`).d('无货')}</span>;
    } else if (item.stockFlag === 4) {
      return (
        <span style={{ color: '#aaa' }}>{intl.get('mallf.common.model.subscribe').d('预订')}</span>
      );
    } else if (item.stockNum === -1 || item.productSource === 'CATA') {
      return (
        <span style={{ color: '#aaa', whiteSpace: 'nowrap' }}>
          <span id="inStock">
            {(minLimit > 1 || (item.productSource === 'CATA' && item.stockQuantity)) && (
              <Tooltip
                title={
                  minLimit > 1 && item.productSource === 'CATA' && item.stockQuantity
                    ? intl
                        .get(`mallf.common.model.minPurchaseNumber`, {
                          value: minLimit,
                        })
                        .d(`最小购买量为${minLimit}`)
                    : null
                }
              >
                <Icon type="exclamation-circle" style={{ color: '#FCA000', marginRight: 6 }} />
              </Tooltip>
            )}
            {item.productSource === 'CATA' && item.stockQuantity ? (
              <>
                {intl.get('mallf.common.model.currentStock').d('当前库存')}
                {item.stockQuantity}
              </>
            ) : (
              <>
                {minLimit > 1
                  ? intl
                      .get(`mallf.common.model.minPurchaseNumber`, {
                        value: minLimit,
                      })
                      .d(`最小购买量为${minLimit}`)
                  : null}
              </>
            )}
          </span>
        </span>
      );
    } else if (item.stockNum === -2) {
      return <span id="outOfStock">{item.stockStateDesc || ''}</span>;
    } else {
      return (
        <span id="margin">
          {item.stockNum > 0 &&
            item.stockNum < 50 &&
            intl
              .get(`mallf.cart.view.remainStock`, {
                value: item.stockNum,
              })
              .d(`仅剩余${item.stockNum}件`)}
        </span>
      );
    }
  };

  // 更改数量预处理
  const updateQuantity = (num, isCheck = false) => {
    const { seSkuList, regionLevelPath, fullAddress, thirdSkuId, budgetInfoList = [] } = item;
    const giftList = (seSkuList || []).filter((s) => s.skuType === 2);
    if (productSource !== 'CATA' && giftList.length > 0) {
      const params = {
        provinceId: regionLevelPath?.split('.')?.[0],
        cityId: regionLevelPath?.split('.')?.[1],
        countyId: regionLevelPath?.split('.')?.[2],
        address: fullAddress,
        tenantId: organizationId,
        supplierCode: productSource,
        skuId: thirdSkuId,
      };
      fetchGift(params).then((res) => {
        if (res.success) {
          const { result = {} } = res;
          if (seSkuList) {
            for (let i = 0; i < seSkuList.length; i++) {
              seSkuList[i].quantity = num;
              seSkuList[i].minNum = result?.minNum;
              seSkuList[i].maxNum = result?.maxNum;
            }
          }
          updateCart({
            ...item,
            budget: budgetInfoList[0] && budgetInfoList[0]?.budget, // 预算维度信息
            seSkuList,
            quantity: num,
            checked: isCheck,
          });
        } else {
          SwalAlert(res.resultMsg);
        }
      });
    } else {
      if (seSkuList) {
        for (let i = 0; i < seSkuList.length; i++) {
          seSkuList[i].quantity = num;
        }
      }
      const newLine = {
        ...item,
        newBudgetInfoList: budgetInfoList.map((n) => ({ ...n, quantity: num })),
        seSkuList,
        quantity: num,
      };
      updateCart({
        ...newLine,
        checked: !getStockConfig(newLine) && isCheck,
      });
    }
  };

  // 改变数量框
  const changeVal = debounce((value) => {
    const tmpQuantity = value;
    const { seSkuList, minPackageQuantity = 1 } = item;
    // 禁止输入小于最小采购量
    if (value < minLimit) {
      updateNumber(item);
      return;
    }
    // 购买量大于最小采购量时才判断最小包装量
    if (!uomPrecision && value % (minPackageQuantity || 1) !== 0 && value >= minLimit) {
      SwalAlert(
        intl
          .get('mallf.common.view.minPackageQuantity.warning', {
            value: minPackageQuantity,
          })
          .d(`购买数量只能是最小包装量${minPackageQuantity}的整数倍`)
      );
      return;
    }
    if (seSkuList) {
      for (let i = 0; i < seSkuList.length; i++) {
        seSkuList[i].quantity = tmpQuantity;
      }
    }

    if (!isNaN(tmpQuantity) && tmpQuantity > 999999999) {
      updateNumber({
        ...item,
        seSkuList,
        quantity: 999999999,
      });
      updateQuantity(tmpQuantity, true);
      return;
    }

    if (!isNaN(value) && value >= minLimit) {
      if (item.productSource === 'CATA') {
        updateNumber({
          ...item,
          seSkuList,
          quantity: tmpQuantity,
        });
        updateQuantity(tmpQuantity, true);
      } else if (value <= maxLimit) {
        updateNumber({
          ...item,
          seSkuList,
          quantity: tmpQuantity,
        });
        updateQuantity(tmpQuantity, true);
      }
    }
  }, 500);

  // const handleOnblur = event => {
  //   let tmpQuantity = +event.target.value;
  //   if (isNaN(tmpQuantity)) {
  //     tmpQuantity = minLimit;
  //   }
  //   if (tmpQuantity > maxLimit) {
  //     SwalAlert(intl.get(`mallf.cart.view.cart.tooManyNumber`).d('超出最大数目'));
  //     tmpQuantity = maxLimit;
  //   }
  //   updateQuantity(tmpQuantity);
  // };

  function handleMouseEnter() {
    setMorePrice(true);
  }
  function handleMouseLeave() {
    setMorePrice(false);
  }

  const showLadderPrices = useMemo(() => {
    if (ladderPrices) {
      return (
        <div
          style={{ position: 'relative', fontSize: '12px', color: '#888' }}
          onMouseEnter={() => handleMouseEnter()}
          onMouseLeave={() => handleMouseLeave()}
        >
          {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
          <Icons type="question" size="11" style={{ paddingLeft: 6 }} />
          {morePrice && (
            <div className="ladderPrice">
              {/* <div className='fixed-top' /> */}
              <div className="ladderPrice-content">
                {ladderPrices.map((tmp) =>
                  tmp.ladderTo ? (
                    <div
                      className={`ladderPrice-item ${
                        numberRender(tmp.taxPrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div className="ladderPrice-number">
                        {tmp.ladderFrom}-{tmp.ladderTo}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price">
                        {symbol}
                        {numberRender(tmp.taxPrice)}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`ladderPrice-item ${
                        numberRender(tmp.taxPrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div className="ladderPrice-number">
                        {`>=${tmp.ladderFrom}`}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price">
                        {symbol}
                        {numberRender(tmp.taxPrice)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return <></>;
    }
  }, [ladderPrices, morePrice]);

  const { shelf } = props;
  const { productLabelDTOList = [] } = labels; // 商品标签
  const labelList =
    productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;

  const labelMaxWidth = labelWidthMap[labelList?.length] || 80;

  // const cartSpinning = typeof item.totalPrice !== 'number' || !item.fullAddress;

  return (
    // <Spin spinning={cartSpinning}>
    <div id={item.cartId} className={style['cart-body-container']} key={item.cartId}>
      <ul
        className={classNames({
          'cart-body-wrapper': true,
          'cart-body-valid': !shelf,
          'cart-body-again': item.againFlag,
        })}
      >
        <li className="cart-body-check">
          <span
            className={`h-checkbox ${item.checked ? 'checked' : ''} `}
            style={shelf ? {} : { visibility: 'hidden' }}
          >
            <Checkbox
              checked={item.checked}
              disabled={
                item.purchaseFlag === 0 ||
                item.stockFlag === 0 ||
                item.saleState === 0 ||
                getStockConfig(item)
              }
              onChange={(e) => {
                handleOnClick(e.target.checked);
              }}
            />
          </span>
        </li>
        <li className="cart-body-img">
          <Link to={`/product-detail?productId=${item.productId}&sourceFrom=${item.productSource}`}>
            <Image
              value={HandleImgUrl(item.productSource, item.imagePath)}
              width={72}
              height={72}
            />
          </Link>
        </li>
        <li className="cart-body-detail">
          <Link to={`/product-detail?productId=${item.productId}&sourceFrom=${item.productSource}`}>
            <div className="cart-body-name" title={`${item.productName}`}>
              {item.productName}
            </div>
          </Link>
          <div className="item-company center-content">
            {item.showSupplierName && (
              <div className="product-company text-overflow">
                {item.productSource === 'CATA' && (
                  <span className="product-platform">
                    {intl.get('mallf.common.view.common.CATA').d('目录化')}
                  </span>
                )}
                <Tooltip placement="bottom" title={`供应商 : ${item.showSupplierName}`}>
                  {item.showSupplierName}
                </Tooltip>
              </div>
            )}
            {item.itemCode && (
              <div className="product-item text-overflow">
                <Tooltip placement="bottom" title={`物料编码 : ${item.itemCode}`}>
                  {item.itemCode}
                </Tooltip>
              </div>
            )}
          </div>
          {!isEmpty(labelList) && (
            <div className="product-label center-content">
              {labelList.map((n) => (
                <LabelPreview
                  cursor="grab"
                  code={n.labelColorCode}
                  value={n.labelName}
                  maxWidth={labelMaxWidth}
                />
              ))}
            </div>
          )}
        </li>
        <li className="cart-body-delivery">
          {(!isEmpty(item.allocationInfoList) && item.allocationInfoList[0]?.deliveryTypeMeaning) ||
            item.deliveryTypeMeaning ||
            '-'}
        </li>
        {/* <li className="cart-body-unit">{item.currencyCode}</li> */}
        <li className="cart-body-price">
          <div>
            {/* {item.shelfFlag === 1 && item.invalidFlag !== 0
                ? numberRender(item.latestPrice)
                : numberRender(item.unitPrice)} */}
            {item.latestPriceMeaning || item.latestPrice}
            {item.uomName ? `/${item.uomName}` : ''}
          </div>
          <div>
            {!!item.diffPrice && shelf && (
              <React.Fragment>
                {item.diffPrice > 0 ? (
                  <span className="diffPrice-up">
                    <Icons
                      type="prise_rise"
                      size="10"
                      style={{ color: '#d0521e', marginRight: '8px' }}
                    />
                    {`${numberRender(item.diffPrice)}`}
                  </span>
                ) : (
                  <span name="prise_down">
                    <Icons
                      type="prise_down"
                      size="10"
                      style={{ color: '#5CAE2A', marginRight: '8px' }}
                    />
                    {`${numberRender(Math.abs(item.diffPrice))}`}
                  </span>
                )}
              </React.Fragment>
            )}
          </div>
          {!!ladderPrices && showLadderPrices}
        </li>
        <li className="cart-body-count">
          <div style={{ position: 'relative' }}>
            <InputNumber
              style={{ width: '100px' }}
              min={minLimit}
              max={item.productSource === 'CATA' ? 999999999 : maxLimit}
              value={item.quantity}
              onChange={(v) => {
                // 总金额不能大于9个9
                if (!isNaN(v) && (v * item.latestPrice < 999999999 || item.latestPrice === '***')) {
                  setQualityChange(true);
                  item.quantity = getToFixed(v, uomPrecision) || minLimit;
                  setUpdate(!update);
                }
              }}
              step={defaultValue}
              onBlur={() => {
                changeVal(item.quantity);
              }}
              precision={uomPrecision || 0}
              disabled={
                (item.productSource === 'CATA' && skuCheckFlag && item.stockQuantity <= 0) ||
                !shelf ||
                item.allocationInfoList?.length > 0
              }
              formatter={(value) => {
                if (!isNaN(+value) && String(value)?.endsWith('0')) {
                  return +value;
                } else {
                  return value;
                }
              }}
            />
            {item.shipperFlag === 1 && (
              <span
                className="text-overflow"
                style={{
                  position: 'absolute',
                  left: 110,
                  top: 9,
                }}
              >
                {item.shipper}
              </span>
            )}
          </div>
          {/* 定制品 */}
          {item.shipperFlag === 1 && item.totalCqNum && shelf && (
            <div className="store-info">
              <span>{intl.get('mallf.common.view.customNumber').d('定制品数量')}：</span>
              {item?.totalCqNum}
              {item?.uomName}
            </div>
          )}
          {item.errorMessage ? (
            <span className="cart-error-message">{item.errorMessage}</span>
          ) : (
            <>
              {!item.fullAddress ? (
                <span className="cart-error-message">
                  {intl.get(`mallf.common.model.pleaseChoose.addressInfo`).d('请选择地址信息')}
                </span>
              ) : (
                <div className="store-info">{renderStoreInfo(item)}</div>
              )}
            </>
          )}
        </li>
        <li className="cart-body-all-price">
          {item.totalPriceMeaning || item.totalPrice}
          <p>{item.currencyCode}</p>
          {item.hasProductCompare === 1 && (
            <div className="compare-content">
              <div className={`to-compare ${compareVisible ? 'to-compare-btn' : ''}`}>
                <Link
                  style={{ marginRight: -10 }}
                  className="cart-compare"
                  to={`/price-compare?productId=${item.productId}&addressId=${item.addressId}&regionId=${item.secondRegionId}&levelPath=${item.levelPath}`}
                >
                  {intl.get(`mallf.common.model.compareOrder`).d(`比价单`)}
                  &nbsp;&nbsp;
                </Link>
                {lowFlag && shelf && (
                  <div className="compare-remind">
                    <Icon
                      type="exclamation-circle"
                      className="compare-tips"
                      onClick={() => handleChangeProduct(item.productId)}
                    />
                    {!compareVisible && (
                      <div className="compare-message">
                        {intl
                          .get(`mallf.cart.view.existLowerPrice`)
                          .d('比价单内有价格更低的商品，可点击更换')}
                      </div>
                    )}
                  </div>
                )}
                {priceChangeFlag && shelf && (
                  <div className="compare-remind">
                    {/* <Icons type="gengxin1" className="compare-tips" /> */}
                    <Icon
                      type="sync"
                      className="compare-tips"
                      onClick={() => updateComparePrice(item)}
                    />
                    <div className="compare-message">
                      {intl
                        .get(`mallf.cart.view.existNewPrice`)
                        .d('商品价格已更新，点击更新比价单')}
                    </div>
                  </div>
                )}
                {!rule && !compareVisible && shelf && (
                  <div className="delete-compare" onClick={() => deleteCompareList(item.productId)}>
                    {intl.get(`mallf.common.button.delete`).d('删除')}
                  </div>
                )}
              </div>
              {compareVisible && shelf && (
                <div className="compare-product">
                  <Spin spinning={compareLoading}>
                    <ul>
                      {lowerProduct.map((i, index) => (
                        <li>
                          <Checkbox
                            checked={i.checked}
                            onChange={(e) => handleCompareChange(index, e.target.checked)}
                          />
                          <Link
                            to={`/product-detail?productId=${i.productId}&sourceFrom=${i.sourceFrom}`}
                          >
                            <Image
                              value={i.imagePath}
                              width={54}
                              height={54}
                              style={{ margin: '0 8px' }}
                            />
                          </Link>
                          <div>
                            <div className="compare-title">{i.productName}</div>
                            <div className="compare-price">{numberRender(i.price)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="compare-footer">
                      <div>
                        {intl
                          .getHTML(`mallf.cart.model.hadChooseItems`, {
                            value: lowerProduct.filter((i) => i.checked === true).length,
                          })
                          .d(
                            <span>
                              已选择<b>{lowerProduct.filter((i) => i.checked === true).length}</b>
                              件商品
                            </span>
                          )}
                      </div>
                      <div className="compare-btn">
                        <span onClick={() => handleCompareVisible()}>
                          {intl.get(`mallf.common.button.cancel`).d('取消')}
                        </span>
                        <Button
                          className={
                            lowerProduct.some((i) => i.checked === true) ? 'comfirm-btn' : ''
                          }
                          onClick={() => handleCompareAddCart()}
                          disabled={lowerProduct.every((i) => i.checked === false)}
                        >
                          {intl.get(`mallf.common.model.sure`).d('确定')}
                        </Button>
                      </div>
                    </div>
                  </Spin>
                </div>
              )}
            </div>
          )}
        </li>
        {/* <li className="cart-body-tips">
            {item.itemCode && <span title={item.itemCode}>{item.itemCode}</span>}
          </li> */}
        <li className="cart-body-option">
          <CostAllocation productList={[item]} saveCallBack={editBudget} />
          {!!item.invalidFlag && (
            <div
              className="collect"
              onClick={() => {
                handleCollect();
              }}
            >
              <a>{intl.get(`mallf.cart.view.add.favorites`).d('加入收藏')}</a>
            </div>
          )}
          <div className="remove-btn">
            <div
              onClick={() => {
                handleDelete();
              }}
            >
              <a>{intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}</a>
            </div>
          </div>
        </li>
      </ul>
      {item.seSkuList?.length > 0 && (
        <ul className="cart-service" style={{ paddingBottom: 16 }}>
          {item.seSkuList.map((i) => (
            <div
              className="cart-service-body"
              style={{
                fontSize: '12px',
                color: i.skuType === 1 ? '#5cae2a' : i.skuType === 2 ? '#5cae2a' : '#999',
              }}
            >
              <span style={{ marginLeft: '160px' }}>
                {`【${
                  i.skuType === 1
                    ? intl.get(`mallf.cart.view.cart.annex`).d('附件')
                    : i.skuType === 2
                    ? intl.get(`mallf.cart.view.cart.giveaway`).d('赠品')
                    : i.skuType === 3
                    ? intl.get(`mallf.cart.view.cart.service`).d('服务')
                    : ''
                }】`}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '200px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'bottom',
                }}
                title={i.productName}
              >
                {i.productName}
              </span>
              <span
                style={{
                  marginLeft: '5px',
                  display: 'inline-block',
                  width: '26px',
                  marginRight: 2,
                }}
              >
                x{i.quantity}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '60px',
                  textAlign: 'right',
                  marginRight: '20px',
                }}
              >
                {numberRender(i.quantity * i.latestPrice)}
              </span>
              {i.skuType !== 1 && (
                <a className="btn-del" onClick={() => handleDeleteService(i)}>
                  {intl.get(`mallf.common.button.delete`).d('删除')}
                </a>
              )}
            </div>
          ))}
        </ul>
      )}
      {/* 费用检验不通过提示 */}
      {(item.success === 0 || item?.useBatchProjectCostFlag === 0) && (
        <div className="cart-budget-warn">
          <span>
            <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            {intl
              .get('mallf.common.view.cartAllocationWarn')
              .d('费用分配数量不一致，点击费用分配查看详情')}
          </span>
        </div>
      )}
    </div>
    // </Spin>
  );
}
export default CartItem;
