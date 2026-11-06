import React, { useEffect, useState, useRef, useMemo } from 'react';
import classNames from 'classnames';
import { Checkbox, Tooltip, Icon, Popover, InputNumber, Spin } from 'choerodon-ui';
import { NumberField, Table, DataSet, Modal, Button as C7nButton, Picture } from 'choerodon-ui/pro';
import moment from 'moment';
import { connect } from 'dva';
import { isEmpty, sum, compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import OverflowTip from 'components/OverflowTip';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserConfigInfo, priceNumberRender, getPrecision, getCacheAddress } from 'utils/utils';
import { getUserCustomDimension, getOpenCartFlag } from 'utils/configUtils';
import { DEFAULT_MAX } from 'utils/constants';
import { getHeaderFixedDimension } from 'utils/addNewCart';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import { openComfirmModal, openNotLowestTipsModal } from 'utils/modals';
import Link from 'components/Link';
import Image from 'components/Image';
import Loading from 'components/loading';
import SwalAlert from 'components/swal';
import Search from 'components/NewMyMallSearch';
import AddressLov from 'components/AddressLov';
import {
  fetchShoppingBasket,
  addToCart,
  fetchShoppingBasketProducts,
} from 'services/shoppingBasketService';
import { newBatchCreateService } from 'services/newCartService';
import { tableDs } from './tableDs';
import styles from './index.less';
import Operate from './Operate';

function ShoppingBasket(props) {
  const {
    companyId,
    purchaseOrgId,
    invoiceOrgId,
    levelPath,
    regionId,
    addressInfo,
    organizationId,
    isNewCart,
    unitId,
    userId,
    unitName,
    purchaseType,
    defaultAddress,
  } = useMemo(() => getUserConfigInfo(), []);
  const commonParams = {
    regionId,
    levelPath,
    enabledFlag: 1,
    addressId,
    ecProductCheckDto: { ...addressInfo, tenantId: organizationId },
  };
  const [loading, setLoading] = useState(false);
  const [spining, setSpining] = useState(false);
  const [basketList, setBasketList] = useState([]);
  const [basketNum, setBasketNum] = useState(1);
  const [currentAddress, setCurrentAddress] = useState(
    !isEmpty(defaultAddress) ? defaultAddress : getCacheAddress()
  );
  const { dispatch } = props;
  const { addressId } = currentAddress || {};
  const addressRef = useRef();
  const tableDataSet = useRef(new DataSet(tableDs(basketList))).current;
  const dimensTemplates = useDimensTemplates();
  const searchProps = {
    onSearch: queryShoppingBasket,
    configs: [
      {
        fieldName: intl.get(`mallf.shoppingBasket.view.buyPackageName`).d('采购套餐名称'),
        fieldCode: 'shoppingBarName',
      },
      {
        fieldName: intl.get('mallf.shoppingBasket.model.search.commodityNames').d('商品名称，编码'),
        fieldCode: 'productName',
        defaultFlag: true,
      },
    ],
  };

  useEffect(() => {
    // queryShoppingBasket();
  }, []);

  /**
   * 查询购物篮
   * @param {Object} params - 查询条件
   */
  function queryShoppingBasket(params = {}) {
    const bodyParams = {
      ...params,
      ...commonParams,
    };
    if (!(invoiceOrgId && purchaseOrgId) && !isNewCart) {
      SwalAlert(
        `${intl
          .get('mallf.shoppingBasket.view.no.organization')
          .d('请联系管理员维护采买组织或库存组织')}!`
      );
      return;
    }
    setLoading(true);
    fetchShoppingBasket({ page: 0, size: 0 }, { ...bodyParams, onlyQueryLine: 1 })
      .then((res) => {
        const { content: list = [] } = res;
        // 默认设置购物篮有效商品为选中状态
        const filterList = list.map((item) => {
          return {
            ...item,
            expanded: false,
          };
        });
        setBasketList(filterList);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 查询购物篮
   * @param {Object} id - 购物篮id
   * @param {Object} callBack - 回调函数
   */
  function queryProducts(id, callBack = (e) => e) {
    const customDimensionMap = getUserCustomDimension();
    fetchShoppingBasketProducts(id, { ...commonParams, onlyQueryLine: 1, customDimensionMap })
      .then((res) => {
        setBasketList((data) => {
          return data.map((item) => {
            if (item.shoppingBarId === id) {
              return { ...item, shoppingBarLineList: res?.shoppingBarLineList, init: true };
            } else {
              return item;
            }
          });
        });
      })
      .finally(() => {
        callBack();
      });
  }

  /**
   * 加入购物车
   * @param {Object} item - 商品
   */
  function addCart(params = [], ball) {
    const precisionCheck = params.some((item) => {
      return item.shoppingCartList.some((p) => {
        return (
          p.purchaseNumber &&
          String(p.purchaseNumber).split('.')?.[1]?.length > (p.uomPrecision || 0)
        );
      });
    });
    if (precisionCheck) return;
    const productList = params
      .map((p) =>
        p.shoppingCartList.map((i) => ({
          ...i,
          purchaseNumber: p.marketBasketQuantity * i.purchaseNumber,
          productSource: p.sourceType,
        }))
      )
      .flat();
    if (isEmpty(currentAddress) && productList.some((n) => n.receiveFlag !== 1)) {
      openComfirmModal({
        title: intl.get('mallf.common.view.prompt').d('提示'),
        border: false,
        children: intl
          .get('mallf.common.view.productAddressWarn')
          .d('暂无收货地址，请先维护收货地址'),
        okText: intl.get('mallf.common.view.goEdited').d('去维护'),
        onOk: () => {
          addressRef.current.element.element.click();
        },
      });
      return;
    }
    if (isNewCart) {
      const newParams = productList.map((item) => {
        const {
          sourceType,
          productId,
          purchaseNumber,
          supplierCompanyId,
          receiveFlag,
          saleAgreementId,
        } = item;
        const dimensionList =
          dimensTemplates[receiveFlag === 1 ? 'receivedDimensionList' : 'dimensionList'] || [];
        const dimensionTemplate =
          dimensTemplates[receiveFlag === 1 ? 'receivedDimensionTemplate' : 'dimensionTemplate'] ||
          {};
        if (isEmpty(dimensionTemplate)) {
          return false;
        }
        const { templateId } = dimensionTemplate;
        const _HEADER_FIXED = getHeaderFixedDimension({
          currentAddress,
          product: item,
        });
        // 头固定列
        const headerDimension =
          dimensionList.filter(
            (n) =>
              ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType) ||
              n.dimension.dimensionCode === 'currencyCode'
          ) || [];
        // 头维度
        const headerList = headerDimension.map((n) => {
          return {
            ...n.dimension,
            headerNum: 1,
            tenantId: organizationId,
            ..._HEADER_FIXED[n.dimension.dimensionCode],
          };
        });
        // 行维度
        const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
        const param = {
          companyId,
          unitName,
          templateId,
          unitId,
          supplierCompanyId,
          productId,
          productSource: sourceType,
          tenantId: organizationId,
          ownerId: userId,
          cartSource: 'PURCHASE',
          openCartFlag: getOpenCartFlag() ? 1 : 0,
          receiveFlag,
          saleAgreementId,
          cartHeaderDTOList: [
            {
              headerList,
              cartLineList: cartLineList.map((n) => {
                return {
                  lineNum: 1,
                  lineList: [
                    {
                      ...n.dimension,
                      tenantId: organizationId,
                      headerNum: 1,
                      lineNum: 1,
                      value: purchaseNumber,
                    },
                  ],
                };
              }),
            },
          ],
        };
        return param;
      });
      if (newParams.some((n) => !n)) {
        SwalAlert(
          intl
            .get('mallf.common.view.noDimensTemplates')
            .d('当前采买组织下不存在已发布的购物车模板')
        );
        return;
      }
      setSpining(true);
      newBatchCreateService(newParams)
        .then((res) => {
          // 只要有一组数据含有lowestPriceRule就提示
          const lowestPriceRuleFlag = res.some((item) => {
            return item.lowestPriceRule;
          });
          if (lowestPriceRuleFlag) {
            setSpining(false);
            const result = openNotLowestTipsModal({
              res,
              onOk: () => {
                setSpining(true);
                const newParamsValue = newParams.map((item) => ({
                  ...item,
                  confirmFlag: 1,
                }));
                newBatchCreateService(newParamsValue).then((resp) => {
                  if (resp) {
                    setSpining(false);
                    if (result !== 'StrongRule') {
                      props.history.push('/cart');
                    }
                  }
                });
              },
            });
          } else {
            props.history.push('/cart');
          }
        })
        .finally(() => {
          setSpining(false);
        });
      return;
    }
    if (addressId) {
      setSpining(true);
      const newPar = params.map((item) => {
        return {
          ...item,
          cartSource: 'PURCHASE',
          openCartFlag: getOpenCartFlag() ? 1 : 0,
          shoppingCartList: item.shoppingCartList.map((n) => ({
            ...n,
            purchaseQuantity: n.purchaseNumber,
            companyId,
            purchaseType,
            levelPath,
            addressId,
            ownerId: userId,
            unitPrice: n.price,
            tenantId: organizationId,
            productSource: n.sourceType,
            purOrganizationId: purchaseOrgId,
            invOrganizationId: currentAddress.invOrganizationId || invoiceOrgId,
            skuType: 0,
          })),
        };
      });
      addToCart(newPar)
        .then((res) => {
          if (res) {
            dispatch({
              type: 'global/update',
              payload: { showMiniCart: true },
            });
            // eslint-disable-next-line no-unused-expressions
            ball?.running();
          } else {
            SwalAlert(res.message);
          }
        })
        .finally(() => {
          setSpining(false);
        });
    } else {
      SwalAlert(
        intl
          .get('mallf.shoppingBasket.view.basket.addCartFailed')
          .d('当前账号无默认地址，请维护地址！')
      );
    }
  }

  async function handleBatchAddcart() {
    const flag = await tableDataSet.validate(true);
    const params = tableDataSet.map((s) => s.toData());
    if (flag) {
      addCart(params);
    }
  }

  function handleOpenModal() {
    const dsData = basketList
      .map((basket) => {
        const { shoppingBarName, shoppingBarLineList } = basket;
        const checkList = shoppingBarLineList?.filter((n) => n.checked) || [];
        const newCheckoutList = checkList.map((p) => ({
          ...p,
          purchaseQuantity: p.purchaseNumber,
        }));
        return {
          shoppingBarName,
          purchaseQuantity: newCheckoutList.length,
          productTotalNum: sum(newCheckoutList.map((n) => n.purchaseNumber || 0)),
          marketBasketQuantity: 1,
          shoppingCartList: newCheckoutList,
        };
      })
      .filter((b) => b.purchaseQuantity > 0); // 过滤掉没有勾选的采购套餐
    tableDataSet.loadData(dsData);
    const modal = Modal.open({
      drawer: true,
      size: 'large',
      title: intl.get('mallf.common.view.batchAddCart').d('批量加入购物车'),
      style: {
        width: 1090,
      },
      onOk: async () => {
        const flag = await tableDataSet.validate(true);
        const params = tableDataSet.map((s) => s.toData());
        if (flag) {
          addCart(params);
          modal.close();
        }
      },
      footer: [
        <AddCartButoon dataSet={tableDataSet} closeModal={() => modal.close()} />,
        <C7nButton onClick={() => modal.close()}>
          <span className="sub-cancel-button">{intl.get('hzero.common.btn.cancel').d('取消')}</span>
        </C7nButton>,
      ],
      children: (
        <Table
          dataSet={tableDataSet}
          columns={columns}
          customizedCode="MALL.PACKAGES.BATCHLIST"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      ),
    });
  }

  // 有效期处理
  function handleTime(time) {
    return time && time.split(' ')[0].slice(0, 10);
  }

  /**
   * 购物篮商品选中/取消
   */
  const toggleProductChecked = (checked, { productId, shoppingBarId, isAll }) => {
    setBasketList((data) => {
      return data.map((bar) => {
        if (bar.shoppingBarId === shoppingBarId) {
          const newBar = bar.shoppingBarLineList?.map((product) => {
            const { productFlag, operationAuth } = product || {};
            if (isAll || product.productId === productId) {
              return {
                ...product,
                checked: productFlag === 1 && operationAuth !== 'VIEW' ? checked : false,
              };
            } else {
              return product;
            }
          });
          return { ...bar, shoppingBarLineList: newBar };
        } else {
          return bar;
        }
      });
    });
  };

  /* 修改商品行数量 */
  function handleChangeNum(val, index, productIndex) {
    const newBasketList = basketList;
    newBasketList[index].shoppingBarLineList[productIndex].purchaseNumber = val;
    setBasketList(newBasketList.splice(0));
  }

  function handleAddCart(checkedList) {
    const params = [
      {
        shoppingCartList: checkedList,
        marketBasketQuantity: basketNum,
      },
    ];
    Modal.confirm({
      title: intl.get('mallf.shoppingBasket.view.sureNum').d('确认数量'),
      width: 460,
      content: (
        <div className="content-modal-confirm">
          {intl
            .getHTML('mallf.shoppingBasket.shoppingbasket.confirm.Num', {
              value: checkedList.filter((p) => p.productFlag && p.checked).length,
            })
            .d(
              <span>
                确认将购物篮中
                <b>{checkedList.filter((p) => p.productFlag && p.checked).length}</b>
                种商品加入购物车吗？
              </span>
            )}
        </div>
      ),
      onOk() {
        addCart(params);
      },
    });
  }

  function renderContent(checkedList) {
    return (
      <>
        <div style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
          <InputNumber
            value={basketNum}
            style={{ width: 120 }}
            label={intl.get('mallf.shoppingBasket.model.basketNum').d('采购套餐数量')}
            min={1}
            max={DEFAULT_MAX}
            step={1}
            precision={0}
            onChange={(val) => setBasketNum(val)}
          />
          <div className="popover-basket-footer">
            <C7nButton
              className="basket-footer-add"
              funcType="flat"
              color="primary"
              onClick={() => handleAddCart(checkedList)}
            >
              {intl.get('mallf.shoppingBasket.model.addToCart').d('加入购物车')}
            </C7nButton>
          </div>
        </div>
      </>
    );
  }

  // 展开
  function onExpand(item, { isAll, callBack } = {}) {
    if (!item.expanded && isEmpty(item.shoppingBarLineList) && item.shoppingBarId) {
      queryProducts(item.shoppingBarId, callBack);
    }
    if (isAll) {
      setBasketList((list) => {
        return list.map((p) => {
          return { ...p, expanded: false };
        });
      });
    } else {
      setBasketList((list) => {
        return list.map((p) => {
          if (p.shoppingBarId === item.shoppingBarId) {
            return { ...p, expanded: !p.expanded };
          } else {
            return p;
          }
        });
      });
    }
  }

  /**
   * 加载购物篮列表
   */
  function renderBasket(item, index) {
    const {
      description,
      shoppingBarName,
      startDate,
      endDate,
      effectiveDay,
      shoppingBarLineList = [],
    } = item;
    const countDownDays = moment(endDate).diff(moment(startDate), 'days');
    let countDown = 'count-down-green';
    if (countDownDays > 2 && countDownDays < 8) {
      countDown = 'count-down-yellow';
    } else if (countDownDays < 3) {
      countDown = 'count-down-red';
    }
    const instockProducts = shoppingBarLineList.filter(
      (p) => p.productFlag === 1 && p.operationAuth !== 'VIEW'
    );
    const allChecked =
      !isEmpty(shoppingBarLineList) &&
      !isEmpty(instockProducts) &&
      instockProducts.every((product) => product.checked);
    const indeterminate = !allChecked && shoppingBarLineList.some((product) => product.checked);
    const hasChecked = shoppingBarLineList.some((product) => product.checked); // 是否可以直接加购整个购物篮
    return (
      <div className="basket-list-info" id={`basket-list-${item.shoppingBarId}`}>
        <div className="basket-title" onClick={() => onExpand(item)}>
          <div className="left">
            <Checkbox
              indeterminate={indeterminate}
              className="checked-box-all"
              checked={allChecked}
              onClick={(e) => e.stopPropagation()}
              disabled={!isEmpty(shoppingBarLineList) && isEmpty(instockProducts)}
              onChange={(e) => {
                if (isEmpty(shoppingBarLineList)) {
                  onExpand(item, {
                    callBack: () =>
                      toggleProductChecked(e.target.checked, {
                        shoppingBarId: item.shoppingBarId,
                        isAll: true,
                      }),
                  });
                  return;
                }
                toggleProductChecked(e.target.checked, {
                  shoppingBarId: item.shoppingBarId,
                  isAll: true,
                });
              }}
            />
            <span className="shopping-basket-expand-box">
              <Icon
                type="navigate_next"
                className={classNames([
                  'c7n-pro-table-expand-icon',
                  'shopping-basket-expand-icon',
                  { 'c7n-pro-table-expand-icon-expanded': item.expanded },
                ])}
              />
            </span>
            <Picture
              r-if={item.imagePath}
              src={item.imagePath}
              width={45}
              height={45}
              style={{ marginLeft: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <span className="basket-right">
              <span className="basket-user">
                {shoppingBarName}
                {shoppingBarLineList.length > 0 ? `(${shoppingBarLineList.length})` : null}
              </span>
              <Tooltip
                title={
                  <>
                    <div>
                      {intl.get('mallf.shoppingBasket.view.countDown').d('倒计时')}：{effectiveDay}
                      {intl.get('hzero.common.date.unit.day').d('天')}
                    </div>
                    <div>
                      <span>
                        {intl.get(`mallf.shoppingBasket.view.basket.validityPeriod`).d('有效期')}：
                        {handleTime(startDate)} - {handleTime(endDate)}
                      </span>
                    </div>
                  </>
                }
                placement="top"
              >
                <span className={`basket-time ${countDown}`}>
                  <Icon type="update" className="update-icon" />
                  {effectiveDay}
                  {intl.get('hzero.common.date.unit.day').d('天')}
                </span>
              </Tooltip>
              <OverflowTip
                r-if={description}
                className="basket-remark"
                title={description || ''}
                placement="bottom"
              >
                {description || ''}
              </OverflowTip>
            </span>
          </div>
          <div className={hasChecked ? 'addcart' : 'no-addcart'}>
            {hasChecked ? (
              <Popover
                title={null}
                placement="bottom"
                onVisibleChange={(v) => {
                  if (!v) setBasketNum(1);
                }}
                onClick={(e) => e.stopPropagation()}
                content={renderContent(shoppingBarLineList.filter((product) => product.checked))}
              >
                <div className="cart-again">
                  <Icon type="add_shopping_cart-o" style={{ fontSize: 14 }} />
                </div>
              </Popover>
            ) : (
              <div className="cart-again">
                <Icon type="add_shopping_cart-o" style={{ fontSize: 14 }} />
              </div>
            )}
          </div>
        </div>
        <Spin spinning={item.expanded && !item.init}>
          <div
            className={classNames(['basket-list', { 'basket-expanded': item.expanded }])}
            style={{ maxHeight: window.innerHeight - 180 }}
          >
            {shoppingBarLineList
              ?.sort((before, after) => after.productFlag - before.productFlag)
              .map((product, productIndex) => {
                const { uomPrecision, purchaseNumber, operationAuth } = product;
                const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
                return (
                  <div
                    className={`basket-item ${
                      product.productFlag === 1 ? '' : 'basket-item-disabled'
                    }`}
                  >
                    <Checkbox
                      disabled={product.productFlag !== 1 || operationAuth === 'VIEW'}
                      className="checked-box"
                      checked={product.productFlag === 1 && product.checked}
                      onChange={(e) =>
                        toggleProductChecked(e.target.checked, {
                          productId: product.productId,
                          shoppingBarId: item.shoppingBarId,
                        })
                      }
                    />
                    <Link
                      className="product-link"
                      to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceType}`}
                    >
                      <div className="image-container">
                        <Image
                          value={product.imagePath}
                          width={38}
                          height={38}
                          defaultChecked
                          showCheckbox
                        />
                      </div>
                      <div title={product.productName} className="product-name">
                        {product.productName}
                        <div className="product-price">
                          {product?.currencySymbol || ''}
                          {priceNumberRender(product.price, product?.defaultPrecision)}
                        </div>
                      </div>
                    </Link>
                    <OverflowTip r-if={!product.productFlag} style={{ color: '#999' }}>
                      {intl.get(`mallf.shoppingBasket.view.basket.productExpired`).d('商品已失效')}
                    </OverflowTip>
                    <OverflowTip
                      r-if={product.productFlag === 1 && operationAuth === 'VIEW'}
                      style={{ color: '#999' }}
                    >
                      {intl.get('mallf.common.view.favorite.readOnly').d('商品仅浏览')}
                    </OverflowTip>
                    {product.productFlag === 1 && operationAuth !== 'VIEW' && (
                      <>
                        <NumberField
                          min={defaultValue}
                          step={defaultValue}
                          // max={999999999}
                          precision={uomPrecision}
                          onChange={(val) =>
                            handleChangeNum(
                              val < DEFAULT_MAX ? val : DEFAULT_MAX,
                              index,
                              productIndex
                            )
                          }
                          value={purchaseNumber || 1}
                          style={{ width: 80 }}
                          formatter={(value) => {
                            if (!isNaN(+value) && String(value)?.endsWith('0')) {
                              return +value;
                            } else {
                              return value;
                            }
                          }}
                        />
                        <Operate product={product} addCart={addCart} />
                      </>
                    )}
                    {/* {product.productFlag === 1 ? (
                      <NumberField
                        min={defaultValue}
                        step={defaultValue}
                        // max={999999999}
                        precision={uomPrecision}
                        onChange={val =>
                          handleChangeNum(
                            val < DEFAULT_MAX ? val : DEFAULT_MAX,
                            index,
                            productIndex
                          )
                        }
                        value={purchaseNumber || 1}
                        style={{ width: 80 }}
                        formatter={value => {
                          if (!isNaN(+value) && String(value)?.endsWith('0')) {
                            return +value;
                          } else {
                            return value;
                          }
                        }}
                      />
                    ) : (
                      <p style={{ width: 80, color: '#999' }}>
                        {intl
                          .get(`mallf.shoppingBasket.view.basket.productExpired`)
                          .d('商品已失效')}
                      </p>
                    )}
                    <Operate product={product} addCart={addCart} /> */}
                  </div>
                );
              })}
          </div>
        </Spin>
      </div>
    );
  }

  const columns = [
    {
      name: 'shoppingBarName',
      width: 410,
    },
    {
      name: 'purchaseQuantity',
      width: 210,
      align: 'right',
    },
    {
      name: 'productTotalNum',
      width: 210,
      align: 'right',
    },
    {
      name: 'marketBasketQuantity',
      editor: () => <NumberField step={1} min={1} clearButton={false} />,
      width: 170,
    },
  ];

  const batchAddCartFlag = basketList?.some((b) => b.shoppingBarLineList?.some((i) => i.checked));
  const AddCartButoon = observer(({ closeModal = (e) => e }) => {
    return (
      <C7nButton
        onClick={() => {
          handleBatchAddcart();
          closeModal();
        }}
        color="primary"
      >
        {intl.get('mallf.common.model.addToCart').d('加入购物车')}
      </C7nButton>
    );
  });

  return (
    <div className={styles['basket-container']}>
      <div className="basket-header">
        <div className="basket">
          {intl.get(`mallf.shoppingBasket.view.basket.buyPackage`).d('采购套餐')}（
          {basketList?.length}）
        </div>
      </div>
      <div className="basket-top">
        <Search {...searchProps} />
        <div style={{ flex: 1, textAlign: 'right' }}>
          <C7nButton
            funcType="flat"
            color="primary"
            icon="add_shopping_cart-o"
            onClick={() => handleOpenModal()}
            disabled={!batchAddCartFlag}
          >
            {intl.get('mallf.shoppingBasket.view.batchAddCart').d('批量加入购物车')}
          </C7nButton>
          <C7nButton
            funcType="flat"
            color="primary"
            disabled={basketList.every((item) => !item.expanded)}
            icon="format_indent_increase"
            onClick={() => onExpand({}, { isAll: true })}
          >
            {intl.get('hzero.common.button.collapseAll').d('全部收起')}
          </C7nButton>
        </div>
      </div>
      <div className="basket-content">
        {loading ? (
          <Loading />
        ) : basketList.length > 0 ? (
          <Spin spinning={spining}>
            {basketList.map((item, index) => renderBasket(item, index))}
          </Spin>
        ) : (
          <div className="empty-product">
            <div className="info">
              {intl.get(`mallf.shoppingBasket.view.buyPackageNull`).d('暂无采购套餐')}
            </div>
          </div>
        )}
      </div>
      <AddressLov
        mode="button"
        className="display-none"
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

export default compose(
  connect(),
  formatterCollections({ code: ['mallf.shoppingBasket'] })
)(ShoppingBasket);
