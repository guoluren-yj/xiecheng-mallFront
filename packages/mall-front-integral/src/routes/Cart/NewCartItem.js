import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox, Icon } from 'hzero-ui';
import { Tooltip, InputNumber, Icon as C7nIcon } from 'choerodon-ui';
import { NumberField, Message } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import Link from 'components/Link';
import Image from 'components/Image';
import SwalAlert from 'components/swal';
import Icons from 'components/Icons';
import LabelPreview from 'components/LabelPreview';
import DropSelect from '@/components/DropSelect';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import { SupplierComponent } from 'utils/renderer';
import {
  getUserConfigInfo,
  getStockConfig,
  numberRender,
  convertImg,
  // filterNullValueObject,
  getProductLimit,
  getPrecision,
  getToFixed,
  priceNumberRender,
  calcValidatePack,
} from 'utils/utils';
import { collectProductService, fetchGift } from 'services/cartService';
import { DEFAULT_MAX } from 'utils/constants';
import { math } from 'choerodon-ui/dataset';
import style from './cartItem.less';

const labelWidthMap = {
  1: 250,
  2: 122,
  3: 80,
};

function CartItem(props) {
  const { organizationId } = getUserConfigInfo();
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
    item: {
      productSource,
      pointsLimit,
      quantity,
      ladderPriceList: ladderPrices,
      minPurchaseQuantity,
      maxPurchaseQuantity,
      purchaseQuantityLimit,
      uomPrecision,
      productAttributeDTOList,
      paymentType,
      hybridPoint,
      // hybridPrice,
      latestPrice = 0,
      pointPrice = 0,
      exchangeRate = 1,
      pointsTypeId,
      pointsTypeName,
      pointsTypeList,
    },
    // setShowEdit,
    labels = {},
    // currentCode,
    setQualityChange,
    qualityChange,
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
  // eslint-disable-next-line no-unused-vars
  const [update, setUpdate] = useState(false);
  // 图片usrl跳转
  const HandleImgUrl = (code, url) => {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  };
  const [integral, setIntegral] = useState(hybridPoint);
  // eslint-disable-next-line no-unused-vars
  const [_, setSecondCompare] = useState(0);

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
  }, [pointsLimit, latestPrice, exchangeRate, quantity, integral]);

  const showAttributeInfo = () => {
    const attributeStr = productAttributeDTOList
      .map(({ pValue, pName }) => `${pName}: ${pValue}`)
      .join(`;\xa0\xa0\xa0`);
    return (
      <p
        style={{
          color: '#666666',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: 250,
        }}
        title={attributeStr}
      >
        {attributeStr}
      </p>
    );
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
        channel: 'PERSONAL',
      },
    ];
    if (item.collectFlag === 1) {
      return;
    }
    collectProductService(collectProduct).then((res) => {
      if (res) {
        Message.success(intl.get(`mallf.cart.view.cart.hasCollected`).d('已加入收藏'));
      }
    });
  };

  /**
   * 单条删除商品
   */
  const handleDelete = () => {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确定删除'),
      border: false,
      children: (
        <span>{intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}</span>
      ),
      onOk: () => {
        deleteCart([item]);
      },
    });
  };

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
    if (item.productSource === 'CATA' && item.stockQuantity <= 0) {
      return <div>{intl.get('mallf.cart.view.cart.noStock').d('该商品暂时缺货')}</div>;
    }
    if (item.shipperFlag === 1 && item.totalCqNum) {
      return (
        <>
          <span>{intl.get('mallf.common.view.customNumber').d('定制品数量')}：</span>
          {item?.totalCqNum}
          {/* {item?.uomName} */}
        </>
      );
    }
    if (item.stockQuantity === 0) {
      return <span id="outOfStock">{intl.get(`mallf.common.model.noStock`).d('无货')}</span>;
    } else if (item.stockFlag === 4) {
      return <span>{intl.get('mallf.common.model.subscribe').d('预订')}</span>;
    } else if (item.productSource === 'CATA' && item.stockQuantity <= 50) {
      return (
        <span>
          <span id="inStock">
            {intl
              .get(`mallf.cart.view.remainStock`, {
                value: item.stockQuantity,
              })
              .d(`仅剩余${item.stockQuantity}件`)}
          </span>
        </span>
      );
    } else if (item.stockNum === -2) {
      return <span id="outOfStock">{item.stockStateDesc || ''}</span>;
    } else if (item.stockNum > 0 && item.stockNum <= 50) {
      return (
        <span id="margin">
          {intl
            .get(`mallf.cart.view.remainStock`, {
              value: item.stockNum,
            })
            .d(`仅剩余${item.stockNum}件`)}
        </span>
      );
    } else {
      return '';
    }
  };

  // 购物车静态提示
  const handleProductComfirmInfo = () => {
    return (
      <>
        {renderStoreInfo(item)}
        {minLimit > 1 && (
          <div>
            {intl
              .get(`mallf.common.model.minPurchaseNumber`, {
                value: minLimit,
              })
              .d(`最小购买量为${minLimit}`)}
          </div>
        )}
        {item?.minPackageQuantity > 1 && (
          <div>
            {`${intl.get('mallf.common.view.errorMinPackageQuantity').d('最小包装量为')}${
              item?.minPackageQuantity
            }`}
          </div>
        )}
        {+maxLimit < 999999999 && (
          <div>
            {intl
              .get('mallf.common.model.maxPurchaseNumbers', { value: maxLimit })
              .d(`最大购买量为${maxLimit}`)}
          </div>
        )}
      </>
    );
  };

  // 更改数量预处理
  const updateQuantity = (num, isCheck = false) => {
    const {
      seSkuList,
      regionLevelPath,
      fullAddress,
      // productSource,
      thirdSkuId,
    } = item;
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
  const changeVal = (value) => {
    const tmpQuantity = +value;
    const { seSkuList, minPackageQuantity = 1 } = item;
    // 禁止输入小于最小采购量
    if (value < minLimit) {
      updateNumber(item);
      return;
    }
    // 购买量大于最小采购量时才判断最小包装量
    const isPackage = math.mod(value, minPackageQuantity || 1) === 0;
    if (
      calcValidatePack(uomPrecision, minPackageQuantity) &&
      math.gte(value, minLimit) &&
      math.lte(value, maxLimit) &&
      !isPackage
    ) {
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

    if (!isNaN(+value) && +value >= minLimit) {
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
  };

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
                        numberRender(tmp.salePrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div
                        className="ladderPrice-number"
                        title={`${tmp.ladderFrom}-${tmp.ladderTo}${pieces}`}
                      >
                        {tmp.ladderFrom}-{tmp.ladderTo}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price" title={`${symbol}${tmp.salePrice}`}>
                        {symbol}
                        {paymentType === 'POINTS_PAYMENT' ? tmp.pointPrice : tmp.salePrice}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`ladderPrice-item ${
                        numberRender(tmp.salePrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div className="ladderPrice-number" title={`>=${tmp.ladderFrom}${pieces}`}>
                        {`>=${tmp.ladderFrom}`}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price" title={`${tmp.salePrice}${symbol}`}>
                        {paymentType === 'POINTS_PAYMENT' ? tmp.pointPrice : tmp.salePrice}
                        {symbol}
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

  // const replaceUnit = ({
  //   ouId,
  //   ouName,
  //   invoiceOrgId,
  //   invoiceOrgName,
  //   purchaseOrgId,
  //   purchaseOrgName,
  //   remark,
  //   ...rest
  // }) => {
  //   updateCart({
  //     ...item,
  //     ...filterNullValueObject({
  //       ouId,
  //       ouName,
  //       invOrganizationId: invoiceOrgId,
  //       organizationName: invoiceOrgName,
  //       purOrganizationId: purchaseOrgId,
  //       purOrganizationName: purchaseOrgName,
  //     }),
  //     remark,
  //     updateOrganizationFlag: 1,
  //     refresh: 1,
  //     ...rest,
  //   });
  //   setShowEdit('');
  // };
  const { shelf } = props;
  const { productLabelDTOList = [] } = labels; // 商品标签
  const labelList =
    productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;

  const labelMaxWidth = labelWidthMap[labelList?.length] || 80;
  // const integralPrice = math.minus(latestPrice, math.div(integral || 0, exchangeRate));
  const integralPrice = numberRender(item.hybridPrice, item.financialPrecision, true);

  const diff = () => {
    const origin = Math.ceil(latestPrice * exchangeRate);
    const current = Math.floor(pointsLimit / quantity);

    if (isEmpty(current) && !pointsLimit > 0) {
      return origin;
    } else {
      return origin > current ? current : origin;
    }
  };

  const helpnfo = () => {
    return (
      <>
        <div className="point-range">
          {intl.get(`mallf.cart.point.range`).d('积分可调整范围为0-')}
          {diff()}
        </div>
        <div className="range-tips">
          {intl.get('mallf.cart.range.tips').d('请输入整数积分值，输入积分后自动更新现金价格')}
        </div>
      </>
    );
  };
  const currSymbol = item?.currencySymbol || '';
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
            // style={shelf ? {} : { visibility: 'hidden' }}
          >
            <Checkbox
              checked={item.checked}
              // disabled={
              // item.purchaseFlag === 0
              // item.stockFlag === 0
              // item.saleState === 0
              // getStockConfig(item)
              // }
              onChange={(e) => {
                handleOnClick(e.target.checked);
              }}
            />
          </span>
        </li>
        <li className="cart-body-img">
          <Link
            to={`/sigl/product-detail?productId=${item.productId}&sourceFrom=${item.productSource}`}
          >
            <Image
              value={HandleImgUrl(item.productSource, item.imagePath)}
              width={72}
              height={72}
            />
          </Link>
        </li>
        <li className="cart-body-detail">
          <Link
            to={`/sigl/product-detail?productId=${item.productId}&sourceFrom=${item.productSource}`}
          >
            <div className="cart-body-name" title={`${item.productName}`}>
              {item.productName}
            </div>
          </Link>
          <div className="item-company center-content">
            {item.showSupplierName && (
              <div className="product-company text-overflow">
                <Tooltip
                  title={
                    item.productSource === 'CATA'
                      ? intl.get('mallf.common.view.common.CATA.product').d('目录化商品')
                      : intl.get('mallf.common.view.E-commerce').d('电商')
                  }
                >
                  <C7nIcon className="cata-icon" type="chrome_reader_mode" />
                </Tooltip>
                <SupplierComponent>
                  <Tooltip
                    placement="bottom"
                    title={`${intl.get('mallf.common.view.supplier').d('供应商')} : ${
                      item.showSupplierName
                    }`}
                  >
                    {item.showSupplierName}
                  </Tooltip>
                </SupplierComponent>
              </div>
            )}
            {item.itemCode && (
              <div className="product-item text-overflow">
                <Tooltip
                  placement="bottom"
                  title={`${intl.get('mallf.common.view.item.code').d('物料编码')} : ${
                    item.itemCode
                  }`}
                >
                  {item.itemCode}
                </Tooltip>
              </div>
            )}
          </div>
          {(!isEmpty(labelList) || item.agreementBusinessType === 'POINTS') && (
            <div className="product-label center-content">
              {item.agreementBusinessType === 'POINTS' && (
                <LabelPreview
                  cursor="grab"
                  code="E"
                  value={intl.get('mallf.common.view.sigl.product').d('积分商品')}
                />
              )}
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
          {productAttributeDTOList && showAttributeInfo()}
        </li>
        {/* <li className="cart-body-unit">{item.currencyCode}</li> */}
        <li className="cart-body-price">
          {paymentType === 'HYBRID_PAYMENT' && (
            <>
              <div style={{ width: 138, display: 'inline-block' }}>
                <NumberField
                  label={intl.get('mallf.common.view.sigl.name').d('积分')}
                  value={integral}
                  step={1}
                  min={0}
                  max={diff()}
                  help={helpnfo()}
                  showHelp="tooltip"
                  onChange={(e) => {
                    // if (
                    //   e <= Math.ceil(latestPrice * exchangeRate) &&
                    //   (/^(0|[1-9][0-9]*)$/.test(e) || e === '')
                    // ) {
                    //   setIntegral(e);
                    // }
                    // 原上限逻辑 积分价格/积分汇率，向上取整
                    // const originCompare = Math.ceil(latestPrice * exchangeRate);
                    // 新增上限逻辑 pointsLimit/数量,
                    if (pointsLimit > 0) {
                      setSecondCompare(Math.floor(pointsLimit / quantity));
                      // 取两者种的最小值进行计算
                      setIntegral(e);
                    }
                  }}
                  onBlur={(e) => {
                    const tagetValue = +e.target.value;
                    const val = tagetValue <= diff() ? tagetValue : diff();
                    setIntegral(val);
                    updateCart({
                      ...item,
                      hybridPoint: val,
                      checked: true,
                    });
                  }}
                  prefix={
                    <C7nIcon
                      style={{
                        color: '#191919',
                        fontSize: 14,
                        marginLeft: 8,
                        position: 'relative',
                        top: 3,
                      }}
                      type="donut_small"
                    />
                  }
                  style={{ width: 110, height: 28 }}
                />
              </div>
              <span style={{ fontSize: 16, color: '#191919', margin: '0 5px', fontWeight: 600 }}>
                +
              </span>
              {`${item?.currencySymbol || ''}${integralPrice > 0 ? integralPrice : 0}`}
            </>
          )}
          {paymentType === 'CASH_PAYMENT' && (
            <span>
              {item?.currencySymbol || ''}
              {latestPrice}
            </span>
          )}
          {paymentType === 'POINTS_PAYMENT' && (
            <>
              <C7nIcon
                style={{ color: '#191919', fontSize: 12, marginTop: -3 }}
                type="donut_small"
              />
              {numberRender(pointPrice)}
            </>
          )}
          <DropSelect
            r-if={pointsTypeName}
            defaultValue={pointsTypeId}
            defaultText={pointsTypeName}
            optionsData={pointsTypeList}
            textField="pointsTypeName"
            valueField="pointsTypeId"
            placement="bottomRight"
            onChange={(value, point) => {
              item.pointsLimit = point.pointsLimit;
              item.pointPrice = point.pointPrice;
              item.exchangeRate = point.exchangeRate;
              item.pointsTypeId = point.pointsTypeId;
              item.pointsTypeName = point.pointsTypeName;
              updateCart({
                ...item,
                checked: true,
              });
            }}
            style={{ marginTop: 5, justifyContent: 'flex-end' }}
          />
          {/* <div>
            <SiglPrice style={{ marginLeft: 8, marginTop: 6 }} pointPrice={item.pointPrice} />
          </div> */}
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
                    {`${priceNumberRender(item.diffPrice, item?.defaultPrecision)}`}
                  </span>
                ) : (
                  <span name="prise_down">
                    <Icons
                      type="prise_down"
                      size="10"
                      style={{ color: '#5CAE2A', marginRight: '8px' }}
                    />
                    {`${priceNumberRender(Math.abs(item.diffPrice), item?.defaultPrecision)}`}
                  </span>
                )}
              </React.Fragment>
            )}
          </div>
          {!!ladderPrices && showLadderPrices}
        </li>
        <li className="cart-body-count">
          <InputNumber
            style={{ width: 86 }}
            id={`${item.cartId}-cart-input-number`}
            min={minLimit}
            max={maxLimit}
            value={item.quantity}
            onChange={(v) => {
              // 总金额不能大于9个9
              if (!isNaN(v) && (v * item.latestPrice < DEFAULT_MAX || item.latestPrice === '***')) {
                setQualityChange(item.cartId);
                item.quantity = getToFixed(v, uomPrecision) || minLimit;
                setUpdate(!update);
              }
            }}
            disabled={!item.invalidFlag}
            step={item.customFlag ? 1 : defaultValue}
            onBlur={() => {
              changeVal(item.quantity);
            }}
            precision={(item.customFlag !== 1 && uomPrecision) || 0}
            formatter={(value) => {
              if (!isNaN(+value) && String(value)?.endsWith('0')) {
                return +value;
              } else {
                return value;
              }
            }}
            readOnly={qualityChange && qualityChange !== item.cartId}
            onFocus={() => {
              document.getElementById(`${item.cartId}-cart-input-number`).select();
            }}
          />
          <Tooltip title={handleProductComfirmInfo()}>
            {(!!renderStoreInfo(item) ||
              minLimit > 1 ||
              item?.minPackageQuantity > 1 ||
              +maxLimit < 999999999) && (
              <Icon
                type="exclamation-circle"
                style={{
                  color: '#FCA000',
                  marginLeft: '5px',
                  position: 'absolute',
                  right: -8,
                  top: 23,
                  zIndex: 1,
                }}
              />
            )}
          </Tooltip>
          {item.errorMessage ? (
            <Tooltip title={item.errorMessage}>
              <span className="cart-error-message text-overflow">{item.errorMessage}</span>
            </Tooltip>
          ) : (
            <>
              {!item.fullAddress && (
                <span className="cart-error-message">
                  {intl.get(`mallf.common.model.pleaseChoose.addressInfo`).d('请选择地址信息')}
                </span>
              )}
            </>
          )}
        </li>
        <li className="cart-body-all-price">
          <p
            style={{ maxWidth: 240 }}
            className="text-overflow"
            title={`${currSymbol}${numberRender(
              item.totalHybridPrice,
              item.financialPrecision,
              true
            )}`}
          >
            {/* 混合支付 */}
            {paymentType === 'HYBRID_PAYMENT' && (
              <span>
                <C7nIcon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                {paymentType === 'HYBRID_PAYMENT' && numberRender(item.totalHybridPoint)}
                <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>+</span>
                {item?.currencySymbol || ''}
                {numberRender(item.totalHybridPrice, item.financialPrecision, true)}
              </span>
            )}
            {/* 现金支付 */}
            {paymentType === 'CASH_PAYMENT' && (
              <span>
                {item?.currencySymbol || ''}
                {item?.totalPrice}
              </span>
            )}
            {/* 积分支付 */}
            {paymentType === 'POINTS_PAYMENT' && (
              <span>
                <C7nIcon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                {/* {item?.currencySymbol || ''} */}
                {numberRender(item?.totalPointPrice)}
              </span>
            )}
          </p>
          {/* <div>
            <SiglPrice style={{ marginLeft: 8, marginTop: 6 }} pointPrice={item.totalPointPrice} />
          </div> */}
        </li>
        {/* <li className="cart-body-tips">
            {item.itemCode && <span title={item.itemCode}>{item.itemCode}</span>}
          </li> */}
        <li className="cart-body-option">
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
    </div>
    // </Spin>
  );
}
export default CartItem;
