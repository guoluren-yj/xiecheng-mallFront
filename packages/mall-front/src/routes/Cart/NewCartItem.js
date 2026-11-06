import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox, Icon } from 'hzero-ui';
import { Tooltip, Icon as C7nIcon, Popover } from 'choerodon-ui';
import { Message } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import classNames from 'classnames';
import { math } from 'choerodon-ui/dataset';

import { SupplierComponent, ShowCompare, SpanTitle } from 'utils/renderer';
import Link from 'components/Link';
import Image from 'components/Image';
import SwalAlert from 'components/swal';
import Icons from 'components/Icons';
import LabelPreview, { SiglPrice } from 'components/LabelPreview';
import CustomInfo from 'components/CustomInfo';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import {
  getUserConfigInfo,
  getStockConfig,
  numberRender,
  convertImg,
  filterNullValueObject,
  getProductLimit,
  getPrecision,
  priceNumberRender,
  getPrimaryColor,
  calcValidatePack,
} from 'utils/utils';
import {
  collectProductService,
  handleChangePrice,
  handleDeleteCompare,
  queryLowerProduct,
  addCompareCart,
  fetchGift,
} from 'services/cartService';

import { DEFAULT_MAX, SHOW_DEFAULT_MAX } from 'utils/constants';
import style from './cartItem.less';
import CartPurches from './CartPurchase';
import CompareOrderDetail from './CompareOrderDetail';
import { getCompareList } from '@/services/productDetailService';
import Budget from './Budget';
import GiftItem from './GiftItem';
import CartCount from './CartCount';
import CuxWrapper from '@/cuxTools/CuxWrapper';

const labelWidthMap = {
  1: 250,
  2: 122,
  3: 80,
};

function CartItem(props) {
  const { organizationId, budgetSwitch } = getUserConfigInfo();
  const symbol = '';
  /** 新增的多语言 */
  const pieces = intl.get(`mallf.cart.model.cart.pieces`).d('件');
  // 选择的货币类型
  const {
    updateCart,
    deleteCart,
    updateCheck,
    item,
    currencyIndex,
    allProductNum,
    updateNumber,
    // rule = true,
    fetchProduct,
    item: {
      productSource,
      ladderPriceList: ladderPrices,
      minPurchaseQuantity,
      maxPurchaseQuantity,
      purchaseQuantityLimit,
      uomPrecision,
      productAttributeDTOList,
      productGiftDTO, // 赠品
    },
    budgetList,
    budgetSelectList,
    setShowEdit,
    showEdit,
    editBudget,
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
    price: item.latestPrice,
  });

  const { purchaseType } = getUserConfigInfo();
  const [morePrice, setMorePrice] = useState(false);
  // eslint-disable-next-line no-unused-vars
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
  }, [item]);

  useEffect(() => {
    document.body.addEventListener('click', handleCloseCompare, false);
    return () => {
      document.body.removeEventListener('click', handleCloseCompare, false);
    };
  }, []);

  const handleCloseCompare = (e) => {
    const element = document.querySelector('.compare-product');
    if (element && !element.contains?.(e.target)) {
      setCompareVisible(false);
    }
  };

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
      },
    ];
    if (item.collectFlag === 1) {
      return;
    }
    collectProductService(collectProduct).then(
      Message.success(intl.get(`mallf.cart.view.cart.hasCollected`).d('已加入收藏'))
    );
  };

  /**
   * 单条删除商品
   */
  const handleDelete = () => {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>{intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}</span>
      ),
      onOk: () => {
        deleteCart([item]);
      },
    });
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

  // function handleCompareVisible() {
  //   setCompareVisible(false);
  // }

  function handleCompareChange(index, val) {
    const data = [...lowerProduct];
    data[index].checked = val;
    setLowerProduct(data);
  }

  function handleCompareAddCart(addData) {
    addCompareCart({ item, addData: [addData] }).then(() => {
      fetchProduct();
      setLowFlag(false);
      setCompareVisible(false);
    });
  }

  function deleteCompareList(id) {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>
          {intl.get(`mallf.cart.model.confirm.deleteCompareProduct`).d('确认删除比价单？')}
        </span>
      ),
      onOk: () => {
        handleDeleteCompare({
          productId: id,
          levelPath: item.levelPath,
          regionId: item.secondRegionId,
        }).then(() => {
          fetchProduct();
          SwalAlert(intl.get(`mallf.cart.model.success.deleteCompareProduct`).d('比价单删除成功'));
        });
      },
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
    if (item.productSource === 'CATA' && item.stockQuantity <= 0) {
      return <div>{intl.get('mallf.cart.view.cart.noStock').d('该商品暂时缺货')}</div>;
    }
    if (item.shipperFlag === 1 && item.totalCqNum) {
      return (
        <>
          <span>{intl.get('mallf.cart.view.customNumber').d('定制品数量')}：</span>
          {item?.totalCqNum}
          {/* {item?.uomName} */}
        </>
      );
    }
    if (item.budgetInfoList?.length > 1 && budgetSwitch === '1') {
      return (
        <span>{intl.get('mallf.cart.view.prodcut.more.budgeInfo').d('该商品有多个预算维度')}</span>
      );
    }
    if (item.stockFlag === 0) {
      return <span id="outOfStock">{intl.get(`mallf.cart.model.noStock`).d('无货')}</span>;
    } else if (item.stockFlag === 4) {
      return <span>{intl.get('mallf.cart.model.subscribe').d('预订')}</span>;
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
      // srm-82738 修改库存数量展示
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
              .get(`mallf.cart.model.minPurchaseNumber`, {
                value: minLimit,
              })
              .d(`最小购买量为${minLimit}`)}
          </div>
        )}
        {item?.minPackageQuantity > 1 && (
          <div>
            {`${intl.get('mallf.cart.view.errorMinPackageQuantity').d('最小包装量为')}${
              item?.minPackageQuantity
            }`}
          </div>
        )}
        {math.lt(maxLimit, SHOW_DEFAULT_MAX) && (
          <div>
            {intl
              .get('mallf.cart.model.maxPurchaseNumbers', { value: maxLimit })
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
      budgetInfoList = [],
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
  const changeVal = (value) => {
    const tmpQuantity = +value;
    const { seSkuList, minPackageQuantity = 1 } = item;
    // 禁止输入小于最小采购量
    if (value < minLimit) {
      updateNumber(item);
      return;
    }
    const isPackage = math.mod(value, minPackageQuantity || 1) === 0;
    console.log(isPackage);
    // 购买量大于最小采购量时才判断最小包装量
    if (
      calcValidatePack(uomPrecision, minPackageQuantity) &&
      math.gte(value, minLimit) &&
      math.lte(value, maxLimit) &&
      !isPackage
    ) {
      SwalAlert(
        intl
          .get('mallf.cart.view.minPackageQuantity.warning', {
            value: minPackageQuantity,
          })
          .d(`购买数量只能是最小包装量${minPackageQuantity}的整数倍`)
      );
      updateNumber(item);
      return;
    }
    if (seSkuList) {
      for (let i = 0; i < seSkuList.length; i++) {
        seSkuList[i].quantity = tmpQuantity;
      }
    }
    if (!isNaN(tmpQuantity) && tmpQuantity > DEFAULT_MAX) {
      updateNumber({
        ...item,
        seSkuList,
        quantity: DEFAULT_MAX,
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

  function handleSaveCustom(params) {
    updateCart(params);
  }

  function handleMouseEnter() {
    setMorePrice(true);
  }
  function handleMouseLeave() {
    setMorePrice(false);
  }

  const showLadderPrices = useMemo(() => {
    const { pointName } = getUserConfigInfo();
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
                        {tmp.salePrice}
                      </div>
                      {item.agreementBusinessType === 'POINTS' && (
                        <div
                          className="ladderPrice-pointPrice"
                          title={`${tmp.pointPrice}${pointName}`}
                        >
                          {`${tmp.pointPrice}${pointName}`}
                        </div>
                      )}
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
                        {tmp.salePrice}
                        {symbol}
                      </div>
                      {item.agreementBusinessType === 'POINTS' && (
                        <div
                          className="ladderPrice-pointPrice"
                          title={`${tmp.pointPrice}${pointName}`}
                        >
                          {`${tmp.pointPrice}${pointName}`}
                        </div>
                      )}
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

  const replaceUnit = ({
    ouId,
    ouName,
    invoiceOrgId,
    invoiceOrgName,
    purchaseOrgId,
    purchaseOrgName,
    remark,
    ...rest
  }) => {
    updateCart({
      ...item,
      ...filterNullValueObject({
        ouId,
        ouName,
        invOrganizationId: invoiceOrgId,
        organizationName: invoiceOrgName,
        purOrganizationId: purchaseOrgId,
        purOrganizationName: purchaseOrgName,
      }),
      remark,
      updateOrganizationFlag: 1,
      refresh: 1,
      ...rest,
    });
    setShowEdit('');
  };
  function handleSave(values) {
    replaceUnit(values);
    // if (item.addressId !== values.addressId) {
    //   chooseAddress({ addressId: values.addressId, item });
    // }
  }
  const { shelf, belongTypeList } = props;
  const { productLabelDTOList = [] } = labels; // 商品标签
  const labelList =
    productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;

  const labelMaxWidth = labelWidthMap[labelList?.length] || 80;

  // 定制品
  const customProps = {
    product: item,
    openMoadlIcon: (
      <C7nIcon
        className="detail-info-update"
        type="mode_edit"
        style={{ fontSize: 14, marginLeft: '4px', color: getPrimaryColor(), cursor: 'pointer' }}
      />
    ),
    onCustomOk: handleSaveCustom,
  };

  const cartCountProps = {
    item,
    renderStoreInfo,
    minLimit,
    maxLimit,
    handleProductComfirmInfo,
    setQualityChange,
    shelf,
    defaultValue,
    changeVal,
    setUpdate,
    update,
    qualityChange,
  };

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
              disabled={isNil(item.totalPrice)}
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
          {item.customFlag === 1 && shelf && <CustomInfo {...customProps} />}
          <div className="item-company center-content">
            <SupplierComponent
              showCataIcon={item.productSource === 'CATA'}
              style={{ verticalAlign: 'super', marginRight: 0 }}
            >
              {item.showSupplierName && (
                <div className="product-company text-overflow">
                  {item.productSource === 'CATA' && (
                    <Tooltip
                      title={intl.get('mallf.cart.view.common.CATA.product').d('目录化商品')}
                    >
                      <C7nIcon className="cata-icon" type="chrome_reader_mode" />
                    </Tooltip>
                  )}
                  <Tooltip
                    placement="bottom"
                    title={`${intl.get('mallf.cart.view.supplier').d('供应商')} : ${
                      item.showSupplierName
                    }`}
                  >
                    {item.showSupplierName}
                  </Tooltip>
                </div>
              )}
            </SupplierComponent>
            {item.itemCode && (
              <div className="product-item text-overflow">
                <Tooltip
                  placement="bottom"
                  title={`${intl.get('mallf.cart.view.item.code').d('物料编码')} : ${
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
                  value={intl.get('mallf.cart.view.sigl.product').d('积分商品')}
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
        <CartPurches
          cCartPurchase={props.cCartPurchase}
          modalActive={showEdit === item.cartId}
          toggleModalActive={setShowEdit}
          info={item}
          modalProps={{
            currencyIndex,
            allProductNum,
            replaceUnit,
            handleSave,
            belongTypeList,
          }}
        />
        <CuxWrapper path="Cart/Body/TableColumn" value={{ item, updateCart, labels }} />
        {/* <li className="cart-body-unit">{item.currencyCode}</li> */}
        <li className="cart-body-price">
          <div className="text-overflow">
            <SpanTitle>
              {item?.currencySymbol || ''}
              {item.latestPriceMeaning || item.latestPrice}
              {item.uomName ? `/${item.uomName}` : ''}
            </SpanTitle>
          </div>
          <div>
            <SiglPrice style={{ marginLeft: 8, marginTop: 6 }} pointPrice={item.pointPrice} />
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
          {!isEmpty(ladderPrices) && showLadderPrices}
        </li>
        <CartCount {...cartCountProps} />
        <li className="cart-body-all-price">
          <p
            title={`${item?.currencySymbol || ''}${
              item.totalPriceMeaning || item.totalPrice
            }`} /* ${item.currencyCode} */
            style={{ maxWidth: 120 }}
            className="text-overflow"
          >
            {item?.currencySymbol || ''}
            {item.totalPriceMeaning || item.totalPrice}
            {/* {item.currencyCode} */}
          </p>
          <div>
            <SiglPrice style={{ marginLeft: 8, marginTop: 6 }} pointPrice={item.totalPointPrice} />
          </div>
          {item.hasProductCompare === 1 && shelf && (
            <ShowCompare>
              <Popover
                content={
                  compareVisible && (
                    <CompareOrderDetail
                      compareLoading={compareLoading}
                      cartItem={item}
                      setCompareVisible={setCompareVisible}
                      onCompareOk={(product) => {
                        handleCompareAddCart(product);
                      }}
                      handleCompareChange={handleCompareChange}
                      productCompareAssignList={lowerProduct || []}
                      setLowerProduct={setLowerProduct}
                    />
                  )
                }
                placement="bottom"
                overlayClassName="compare-detail-popver"
                overlayStyle={{ width: 400, height: 500 }}
                trigger="click"
                visible={compareVisible}
                onVisibleChange={(vis) => {
                  setCompareVisible(vis);
                  if (vis) {
                    if (lowFlag) {
                      handleChangeProduct(item.productId);
                    } else if (priceChangeFlag) {
                      updateComparePrice(item);
                    } else {
                      getCompareList({
                        productId: item.productId,
                        levelPath: item.levelPath,
                        regionId: item.secondRegionId,
                      }).then((res) => {
                        const newData = res.productCompareAssignList
                          ?.map((i) => ({
                            ...i,
                            checked: false,
                          }))
                          .filter((p) => p.productId !== item.productId);
                        setLowerProduct(newData);
                      });
                    }
                  } else {
                    setLowerProduct([]);
                  }
                }}
              >
                <div className="compare-content">
                  <div>
                    {intl.get(`mallf.common.model.compareOrder`).d(`比价单`)}
                    <C7nIcon
                      style={{
                        fontSize: 14,
                        marginLeft: 5,
                        marginTop: '-4px',
                        cursor: 'pointer',
                        color: lowFlag ? getUserConfigInfo().theme[`warning-color`] : '#888',
                      }}
                      type={lowFlag ? 'error' : 'find_in_page'}
                    />
                  </div>
                </div>
              </Popover>
              <div className="delete-compare" onClick={() => deleteCompareList(item.productId)}>
                {intl.get(`mallf.common.button.delete`).d('删除')}
              </div>
            </ShowCompare>
          )}
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
          {shelf && (
            <Budget
              budgetData={item}
              budgetList={budgetList}
              budgetSelectList={budgetSelectList}
              saveCallBack={editBudget}
              labels={labels}
            />
          )}
        </li>
      </ul>
      {shelf && <GiftItem giftData={productGiftDTO} quantity={item.quantity} />}
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
                  {intl.get(`mallf.cart.button.delete`).d('删除')}
                </a>
              )}
            </div>
          ))}
        </ul>
      )}
      {/* 预算检验不通过提示 */}
      {(item.success === 0 || item.errorOutFlag) && (
        <div className="cart-budget-warn">
          <span>
            <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            {item.occupancyMessage ||
              intl.get('mallf.cart.view.cartBudgetWarn').d('预算信息不通过，点击预算信息查看详情')}
          </span>
        </div>
      )}
    </div>
    // </Spin>
  );
}
export default CartItem;
