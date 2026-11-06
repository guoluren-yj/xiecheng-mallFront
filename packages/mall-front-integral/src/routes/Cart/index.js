import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Checkbox, Spin } from 'hzero-ui';
import { Icon, Tooltip } from 'choerodon-ui';
import { Select, Form, DataSet } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import qs from 'qs';

import useEventListener from 'hooks/useEventListener';
import useRequest from 'hooks/useRequest';
import SwalAlert from 'components/swal';
import BreadCrumbs from 'components/BreadCrumbs';
import Loading from 'components/loading';
import Link from 'components/Link';
import * as HmallConfig from 'utils/api-config';
import {
  getUserConfigInfo,
  getStockConfig,
  getProductLimit,
  numberRender,
  priceNumberRender,
} from 'utils/utils';
import { accessIsLogin } from 'services/api';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import {
  // deleteCartService,
  // preReqOrderService,
  // updateAddressService,
  queryCompareRule,
  fetchProductLabelPost as fetchProductLabel,
} from 'services/cartService';
import { addCartService } from '@/services/productDetailService';
import {
  fetchProductService,
  deleteCartService,
  preReqOrderService,
  getAddressList,
  updateAddressService,
} from '@/services/cartService';
import { DEFAULT_MAX } from 'utils/constants';
import { math } from 'choerodon-ui/dataset';
import emptyImg from '../../assets/images/cart/illu_cart_nodata_default.svg';
import CartItem from './NewCartItem';
import style from './Cart.less';
import { addressDs } from '@/routes/Cart/ds';
// import { SiglPrice } from 'components/LabelPreview';
let timer;

let checkStatusProducts = {}; // 临时存储勾选的商品
function Cart(props) {
  const { organizationId, userId, skuCheckFlag } = getUserConfigInfo();
  const { purchaseType, memberId } = getUserConfigInfo();
  const [initData, setInitData] = useState({
    initProducts: [],
    selectAll: false,
    currencyCode: '',
    selectedCount: 0,
  });
  const [initCounter, setInitCounter] = useState(0);
  const [showEdit, setShowEdit] = useState('');
  const [loadStatus, setLoadStatus] = useState({
    loading: true,
    cartSpinning: true,
    settleLoading: false,
  });
  const [footerWidth, setFooterWidth] = useState(
    document.querySelector('.gb-wrapper') &&
      `${document.querySelector('.gb-wrapper').offsetWidth}px`
  );
  const [purChaseData, setPurChaseData] = useState({
    totalPoint: 0,
    totalPrice: 0,
    totalCount: 0,
    pointsTypes: {},
  });
  const [fix, setFix] = useState(true);
  const [qualityChange, setQualityChange] = useState(false);
  const [rule, setRule] = useState(true); // 比价规则是否开启
  const [updateAddressList, setUpdateAddressList] = useState([]);
  const [labelList, setLabelList] = useState([]); // 商品标签
  // const [addressList, setAddressList] = useState([]);
  // const [currentAddress, setCurrentAddress] = useState({});

  const { resData: integralBalanceData } = useRequest({
    url: `/${HmallConfig.siglService}/v1/${organizationId}/member-pointss/integral-balance`,
    method: 'POST',
    body: { userId },
  });

  const addressDataSet = useMemo(() => {
    return new DataSet(addressDs());
  }, []);

  const getShelfStatus = useCallback((p) => p.invalidFlag === 1, [skuCheckFlag]);
  const getCheckedProduct = useMemo(() => {
    let punchoutProduct = [];
    initData.initProducts
      .filter((p) => p.checked && p.qtLine)
      .forEach((p) => {
        punchoutProduct = [...punchoutProduct, ...p.qtLine];
      });
    return (
      initData.initProducts
        // .filter((p) => getShelfStatus(p) && p.checked)
        .filter((p) => p.checked)
        .concat(punchoutProduct)
    );
  }, [initData.initProducts]);

  useEffect(() => {
    // EcProductStockData = []; // 电商商品的库存
    // EcProductSaleData = []; // 电商商品的可售状态
    // productDataItemCode = []; // 商品的物料编码
    // itemLoadingList = [false]; // 储存物料编码的加载状态
    checkStatusProducts = {}; // 临时存储勾选的商品
    window.addEventListener('resize', () => {
      setFooterWidth(window.innerWidth);
      handleScroll();
    });
    return () => {
      window.removeEventListener('resize', () => {
        setFooterWidth(window.innerWidth);
        handleScroll();
      });
    };
  }, []);

  useEffect(() => {
    const newList = [...initData.initProducts];
    // 再来一单顶部聚合
    const againCartIds = Object.values(qs.parse(props.location?.query));
    if (!isEmpty(againCartIds)) {
      const isExitFlag = (cartId) => againCartIds.some((s) => s === cartId || Number(s) === cartId);
      const allCartProducts = newList.map((item) => {
        return {
          ...item,
          againFlag: isExitFlag(item.cartId),
          checked: isExitFlag(item.cartId),
        };
      });
      const againProducts = allCartProducts.filter((n) => isExitFlag(n.cartId));
      const newCartProducts = cartProductSortTop(againProducts, allCartProducts);
      setInitData({
        ...initData,
        currencySymbol: againProducts[0]?.currencySymbol,
        currencyCode: againProducts[0]?.currencyCode,
        selectedCount: againProducts.length || 0,
        initProducts: newCartProducts,
      });
      calculatePrice(newCartProducts);
    } else {
      setInitData({
        ...initData,
        ...checkStatusProducts,
        initProducts: newList,
      });
    }
  }, [loadStatus.cartSpinning]);

  /**
   * 监听滚动事件
   */
  const handleScroll = () => {
    const scrollTop = document.body?.scrollTop || document.documentElement?.scrollTop || 0;
    const scrollHeight = document.body?.scrollHeight || document.documentElement?.scrollHeight || 0;
    const { clientHeight } = document.documentElement;
    const bottom = scrollHeight - scrollTop - clientHeight;
    const {
      constants: { footerPaddingBottom },
    } = props;
    const d = footerPaddingBottom + 20;
    if (bottom > d) {
      setFix(false);
    } else {
      setFix(true);
    }
  };

  /* 清空失效商品 */
  const handleDeleteExpiredGoods = () => {
    const expiredGoods = initData.initProducts.filter((val) => val.invalidFlag === 0);
    if (expiredGoods.length === 0) {
      SwalAlert(intl.get(`mallf.cart.view.delete.noneFailureGoods`).d('没有失效的商品可以删除'));
    } else {
      openComfirmModal({
        title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
        border: false,
        children: (
          <span>
            {intl.get(`mallf.cart.view.confirm.deleteAllFailureGoods`).d('确认删除所有失效商品？')}
          </span>
        ),
        onOk: () => {
          deleteCartService(expiredGoods);
          fetchProduct();
        },
      });
    }
  };

  useEffect(() => {
    accessIsLogin();
    fetchProduct();
    fetchCompareRule();
    initAddress();
  }, []);

  async function initAddress() {
    await fetchAddressList();
    await addressDataSet.validate();
  }

  useEventListener('scroll', handleScroll, window, true);

  function fetchCompareRule() {
    queryCompareRule().then((res) => {
      setRule(res.settingValue === '1');
    });
  }

  // 地址查询
  async function fetchAddressList() {
    const res = await getAddressList({ page: 0, size: 0 });
    if (res) {
      const { addressId } =
        res?.content.find((n) => !!n.currentFlag) ||
        res?.content.find((n) => !!n.defaultFlag) ||
        {};
      addressDataSet
        .getField('addressId')
        .set('options', new DataSet({ paging: false, data: res?.content }));
      addressDataSet.create({ addressId });
    }
  }

  // 查询地址
  function updateAddress(addressId) {
    updateAddressService({ ownerId: userId, addressId }).then((res) => {
      if (res) {
        fetchProduct();
        fetchAddressList();
      }
    });
  }

  const checkIsSelectAll = (products, currencyCode) => {
    const mallProducts = products.filter((f) => !f.qtHeaderNo);
    const poData = products.filter((f) => f.qtHeaderNo);
    const normalProduct = mallProducts.filter(
      (p) =>
        getShelfStatus(p) &&
        // p.effectiveFlag &&
        (p.currencyCode === currencyCode || !currencyCode)
    );
    const poAllSelect = poData.every((po) => po.checked);
    const selectAllFlag = normalProduct.every((item) => item.checked);
    return selectAllFlag && poAllSelect;
  };

  const updateCheck = (cartItem) => {
    if (initData.currencyCode === cartItem.currencyCode || !initData.currencyCode) {
      const count = cartItem.checked ? initData.selectedCount + 1 : initData.selectedCount - 1;
      const product = initData.initProducts;
      const changeProducts = product.map((p) => {
        if (p.cartId === cartItem.cartId) {
          return {
            ...cartItem,
          };
        } else {
          return { ...p };
        }
      });
      checkStatusProducts = {
        initProducts: changeProducts,
        selectAll: checkIsSelectAll(changeProducts, cartItem.currencyCode),
        selectedCount: count,
        currencyCode: count === 0 ? '' : cartItem.currencyCode,
        currencySymbol: count === 0 ? '' : cartItem.currencySymbol,
      };
      setInitData({
        ...initData,
        ...checkStatusProducts,
      });
      calculatePrice(changeProducts);
      return true;
    } else {
      SwalAlert(
        intl.get(`mallf.cart.view.porduct.chooseSameCurrency`).d('只能选择相同币种的商品！')
      );
      return false;
    }
  };

  function resetCount(cartItem) {
    updateNumber({
      ...cartItem,
      quantity: initCounter,
    });
  }

  const updateCart = (cartItem) => {
    const product = [...initData.initProducts];
    let { checked } = cartItem;
    let { selectedCount } = initData;
    if (initData.currencyCode !== cartItem.currencyCode && initData.currencyCode) {
      checked = false;
    } else if (!checked) {
      selectedCount++;
    }
    let tmpChangeProducts = product.map((p) => {
      if (p.cartId === cartItem.cartId) {
        return {
          ...p,
          ...cartItem,
          checked,
        };
      } else {
        return { ...p };
      }
    });
    const allData = {
      ...initData,
      selectedCount,
      selectAll: checked
        ? checkIsSelectAll(tmpChangeProducts, cartItem.currencyCode)
        : initData.selectAll,
      currencyCode: checked ? cartItem.currencyCode : initData.currencyCode,
      initProducts: tmpChangeProducts,
    };
    checkStatusProducts = allData;
    setInitData(allData);

    const {
      stockNum,
      ladderPrices,
      productSource,
      minPurchaseQuantity,
      maxPurchaseQuantity,
      purchaseQuantityLimit,
    } = cartItem;

    const [minLimit, maxLimit] = getProductLimit({
      sourceFrom: productSource,
      stockLimit: stockNum,
      minPurchaseQuantity,
      maxPurchaseQuantity,
      purchaseQuantityLimit,
      ladderPriceLimit: ladderPrices,
    });
    const val = +cartItem.quantity;
    let tmpQuantity = 1;
    setLoadStatus({
      ...loadStatus,
      settleLoading: true,
      cartSpinning: true,
    });
    if (val > 0) {
      const quantity = val > minLimit ? val : minLimit;
      tmpQuantity = quantity > maxLimit ? maxLimit : quantity;
    } else if (val === undefined || val === null || val === '' || val < 0 || val === 0) {
      tmpQuantity = minLimit || 1;
    }
    const params = {
      ...cartItem,
      quantity: tmpQuantity,
    };
    addCartService(params)
      .then(async (res) => {
        if (res) {
          const updateRes = await fetchProductService({
            ownerId: userId,
            cartId: cartItem.cartId,
          });
          tmpChangeProducts = product.map((p) => {
            if (p.cartId === updateRes?.[0]?.cartId) {
              return {
                ...(updateRes?.[0] || {}),
                checked,
              };
            } else {
              return { ...p };
            }
          });
          if (params.updateOrganizationFlag) {
            fetchProduct();
            // 过滤更新采买组织商品后重新计算购物车总金额
            calculatePrice(product.filter((n) => n.cartId !== params.cartId));
          } else {
            setInitData({
              ...initData,
              selectedCount,
              selectAll: checked
                ? checkIsSelectAll(tmpChangeProducts, cartItem.currencyCode)
                : initData.selectAll,
              currencySymbol: checked ? cartItem.currencySymbol : initData.currencySymbol,
              currencyCode: checked ? cartItem.currencyCode : initData.currencyCode,
              initProducts: tmpChangeProducts,
            });
            calculatePrice(tmpChangeProducts);
          }
        } else {
          SwalAlert(intl.get(`mallf.cart.view.fail.changeNum`).d('数量变更失败'));
        }
      })
      .catch(() => resetCount())
      .finally(() => {
        setQualityChange(false);
        if (!params.updateOrganizationFlag) {
          setLoadStatus({
            ...loadStatus,
            settleLoading: false,
            cartSpinning: false,
          });
        }
      });
  };

  const updateNumber = (cartItem) => {
    const product = initData.initProducts;
    const changeProducts = product.map((p) => {
      if (p.cartId === cartItem.cartId) {
        return {
          ...cartItem,
        };
      } else {
        return { ...p };
      }
    });
    setInitData({
      ...initData,
      initProducts: changeProducts,
    });
  };
  /**
   * 删除方法
   * @param {Array} shoppingCartList 删除数组
   */
  const deleteCart = (deleteCartList) => {
    setLoadStatus({
      ...loadStatus,
      settleLoading: true,
    });
    deleteCartList.map((item) => {
      if (item && item.serviceShoppingCartDTOList) {
        const { serviceShoppingCartDTOList = [] } = item;
        serviceShoppingCartDTOList.forEach((i) => {
          deleteCartList.push(i);
        });
      }
      return deleteCartList;
    });
    deleteCartService(deleteCartList).then(() => {
      setLoadStatus({
        ...loadStatus,
        settleLoading: false,
      });
      const delPoList = deleteCartList.filter((f) => f.qtHeaderNo);
      const delmallList = deleteCartList.filter((f) => !f.qtHeaderNo);
      const newUpdateAddressList = updateAddressList.filter((f) =>
        deleteCartList.every((d) => d.cartId !== f.cartId)
      );
      let { currencyCode, selectedCount, currencySymbol } = initData;

      const filterList = initData.initProducts
        .map((m) => {
          if (!m.qtHeaderNo) {
            return {
              ...m,
              isFilter: delmallList.every((d) => d.cartId !== m.cartId),
            };
          } else {
            const { qtLine } = m;
            const newQtLine = qtLine.filter((cart) =>
              delPoList.every((s) => s.cartId !== cart.cartId)
            );
            return { ...m, qtLine: newQtLine, isFilter: newQtLine.length > 0 };
          }
        })
        .filter((f) => f.isFilter);

      deleteCartList.forEach((item) => {
        // 选中的商品++
        if (item.checked) {
          selectedCount--;
        }
      });
      if (selectedCount === 0) {
        currencyCode = '';
        currencySymbol = '';
      }
      setUpdateAddressList(newUpdateAddressList);
      setInitData({
        initProducts: filterList,
        selectAll: checkIsSelectAll(filterList, currencyCode),
        currencyCode,
        currencySymbol,
        selectedCount,
      });
      calculatePrice(filterList);
    });
    // fetchProduct();
  };
  /**
   * 计算商品及价格
   */
  const calculatePrice = (newInitProducts) => {
    const product = newInitProducts || [];
    let total = 0;
    let count = 0;
    let totalPoint = 0;
    const pointsTypes = {};
    product.forEach((cart) => {
      if (cart.checked) {
        const {
          quantity,
          totalPrice,
          paymentType,
          totalHybridPrice,
          totalHybridPoint,
          totalPointPrice,
          pointsTypeName,
        } = cart;
        count = math.plus(quantity, count);
        switch (paymentType) {
          case 'HYBRID_PAYMENT':
            total = math.plus(total, totalHybridPrice);
            totalPoint = math.plus(totalPoint, totalHybridPoint);
            pointsTypes[pointsTypeName] = math.plus(
              pointsTypes[pointsTypeName] || 0,
              totalHybridPoint
            );
            break;
          case 'CASH_PAYMENT':
            total = math.plus(total, totalPrice);
            break;
          case 'POINTS_PAYMENT':
            totalPoint = math.plus(totalPoint, totalPointPrice);
            pointsTypes[pointsTypeName] = math.plus(
              pointsTypes[pointsTypeName] || 0,
              totalPointPrice
            );
            break;
          default:
            break;
        }
      }
    });
    setPurChaseData({
      totalPoint,
      totalPrice: Number(count) === 0 ? 0 : total,
      totalCount: Number(count),
      pointsTypes,
    });
  };

  /**
   * 查询商品
   */
  const fetchProduct = (checkedProducts) => {
    let idArray = [];
    if (checkedProducts) {
      idArray = checkedProducts.map((item) => item.productId);
    }
    setLoadStatus({
      ...loadStatus,
      cartSpinning: true,
      loading: initData.initProducts.length === 0,
    });
    const params = {
      ownerId: userId,
      memberId,
    };
    fetchProductService(params).then((json) => {
      const initProducts = [];
      (json || []).forEach((item) => {
        initProducts.push({
          ...item,
          checked: idArray.indexOf(item.productId) >= 0,
        });
      });
      setInitData({
        selectAll: false,
        currencyCode: '',
        selectedCount: 0,
        initProducts,
      });
      calculatePrice(initProducts);
      setLoadStatus({
        ...loadStatus,
        loading: false,
        cartSpinning: false,
      });
      if (!checkedProducts) {
        handleScroll(); // 获取到商品后设置是否悬浮底部控制条
      }
    });
  };

  function getCurrentNum(currentNum) {
    setInitCounter(currentNum);
  }

  useEffect(() => {
    const productIds = initData.initProducts.map((n) => n.productId);
    if (!isEmpty(productIds)) {
      // 获取商品标签
      fetchProductLabel(productIds).then((res) => {
        if (!isEmpty(res)) {
          setLabelList(res);
        }
      });
    }
  }, [initData.initProducts.length]);

  // 创建有效和无效商品

  const cartDetail = (shelf) => {
    const product = initData.initProducts;
    if (shelf) {
      return product.map((item, index) => {
        const labels = labelList?.find((n) => n.productId === item.productId);
        return (
          <>
            <CartItem
              setQualityChange={setQualityChange}
              cCartPurchase={props.cCartPurchase}
              currencyIndex={index}
              allProductNum={product.length}
              showEdit={showEdit}
              setShowEdit={setShowEdit}
              updateNumber={updateNumber}
              item={item}
              shelf={getShelfStatus(item)}
              updateCheck={updateCheck}
              updateCart={updateCart}
              deleteCart={deleteCart}
              rule={rule}
              fetchProduct={fetchProduct}
              timer={timer}
              getCurrentNum={getCurrentNum}
              currentCode={initData.currencyCode}
              labels={labels}
              qualityChange={qualityChange}
            />
          </>
        );
      });
    } else {
      const filterProduct = product.filter((p) => !getShelfStatus(p));
      return filterProduct.map((item, index) => {
        const labels = labelList?.find((n) => n.productId === item.productId);
        return (
          <CartItem
            cCartPurchase={props.cCartPurchase}
            showEdit={showEdit}
            setShowEdit={setShowEdit}
            item={item}
            index={index}
            shelf={shelf}
            updateCart={updateCart}
            deleteCart={deleteCart}
            timer={timer}
            setInitCounter={setInitCounter}
            getCurrentNum={getCurrentNum}
            labels={labels}
            qualityChange={qualityChange}
          />
        );
      });
    }
  };

  /* 全选 */
  const handleOnChangeSelectAll = (e) => {
    const val = e.target.checked;
    let count = 0;
    const { currencyCode, currencySymbol } = initData;
    let product = initData.initProducts;
    product = product.filter(
      (p) => (getShelfStatus(p) || p.qtHeaderNo) && !getStockConfig(p)
      // p.effectiveFlag
    ); // 过滤掉失效商品及开启了库存强校验库存不足的商品
    // 第一个子元素的币种编码
    const firstCurrencyCode = currencyCode || (product.length > 0 ? product[0].currencyCode : '');
    const firstCurrencySymbol =
      currencySymbol || (product.length > 0 ? product[0].currencySymbol : '');
    const changeProducts = initData.initProducts.map((item) => {
      let { checked } = item;
      if (
        (item.invalidFlag === 1 || item.qtHeaderNo) &&
        item.currencyCode === firstCurrencyCode &&
        !getStockConfig(item)
      ) {
        if (item.qtHeaderNo) {
          count += item.qtLine.length;
        } else {
          count++;
        }
        checked = val;
      }
      return {
        ...item,
        checked,
      };
    });
    setInitData({
      currencyCode: val ? firstCurrencyCode : '',
      currencySymbol: val ? firstCurrencySymbol : '',
      selectAll: val,
      initProducts: changeProducts,
      selectedCount: count,
    });
    calculatePrice(changeProducts);
  };

  /**
   * 删除已选的有效商品
   */
  const handleClickDelete = (isInvalid) => {
    const product = initData.initProducts.filter((f) => !f.qtHeaderNo);
    const poData = initData.initProducts.filter((f) => f.qtHeaderNo);
    let tmpProPo = [];
    poData.forEach((f) => {
      if (f.checked) {
        tmpProPo = [...tmpProPo, ...f.qtLine];
      }
    });
    let clearProducts = [];
    if (isInvalid) {
      // 失效商品
      clearProducts = product.filter(
        (p) => !getShelfStatus(p)
        // p.effectiveFlag
      );
    } else {
      clearProducts = [...product.filter((p) => p.checked), ...tmpProPo];
    }
    if (clearProducts.length === 0) {
      SwalAlert(
        isInvalid
          ? intl.get(`mallf.cart.view.delete.noneFailureGoods`).d('没有失效的商品可以删除')
          : intl.get(`mallf.cart.view.delete.noChooseGoods`).d('请选中需要删除的商品')
      );
    } else {
      openComfirmModal({
        title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
        border: false,
        children: (
          <span>
            {isInvalid
              ? intl
                  .get(`mallf.cart.view.confirm.deleteAllFailureGoods`)
                  .d('确认删除所有失效商品？')
              : intl.get(`mallf.cart.view.confirm.deleteChooseGoods`).d('确认删除选中的商品？')}
          </span>
        ),
        onOk: () => {
          deleteCart(clearProducts);
        },
      });
    }
  };

  // 物料全选
  const handleSelectItem = () => {
    // 如果已选择中，有物料以及无物料，点击物料全选，只保留有物料的选择
    // 如果有物料的已经全选，再次触发即为全部取消物料选择
    let count = 0;
    let product = initData.initProducts;
    product = product.filter(
      (p) => getShelfStatus(p)
      // p.effectiveFlag
    ); // 拿到有效的商品

    // 获取当前已选择
    const checkProduct = product.filter((f) => f.checked);

    const itemProduct = product.filter((f) => f.itemCode);

    const updateItemCheck = (list, code, currencySymbol, c) => {
      setInitData({
        currencyCode: code,
        currencySymbol,
        selectAll: checkIsSelectAll(list, code),
        initProducts: list,
        selectedCount: c,
      });
      calculatePrice(list);
    };

    const itemCheckAll = () => {
      // 所有物料商品
      if (itemProduct.length > 0) {
        const { currencyCode, currencySymbol } = itemProduct[0];
        const changeProducts = initData.initProducts.map((item) => {
          let { checked } = item;
          if (
            itemProduct.some((i) => i.cartId === item.cartId) &&
            item.currencyCode === currencyCode
          ) {
            checked = true;
            count++;
          } else {
            checked = false;
          }
          return { ...item, checked };
        });
        updateItemCheck(changeProducts, currencyCode, currencySymbol, count);
      }
    };

    // 无选择商品，物料全选
    if (checkProduct.length === 0) {
      itemCheckAll();
    } else {
      // 获取物料商品与选中商品相同币种的
      const itemSameCurrency = itemProduct.filter(
        (f) => f.currencyCode === checkProduct[0].currencyCode
      );
      // 选中商品即为物料商品，则全部取消选中
      if (
        itemSameCurrency.length === checkProduct.length &&
        itemSameCurrency.every((i) => i.checked)
      ) {
        const changeProducts = initData.initProducts.map((item) => {
          return { ...item, checked: false };
        });
        updateItemCheck(changeProducts, '', '', count);
      } else {
        itemCheckAll();
      }
    }
  };

  /**
   * 购物车商品顶部聚合排序
   * @param {*} sortProductList 需要排序的商品行
   * @param {*} cartList 购物车商品
   */
  const cartProductSortTop = (sortProductList, cartList) => {
    cartList.forEach((item, index) => {
      // 标准商品根据cartId,pounchOut根绝qtHeaderNo
      const sortProduct = sortProductList.find(
        (n) =>
          (!n.qtHeaderNo && n.cartId === item.cartId) ||
          (n.qtHeaderNo && n.qtHeaderNo === item.qtHeaderNo)
      );
      if (sortProduct) {
        cartList.splice(index, 1);
        cartList.unshift(sortProduct);
      }
    });
    return [...sortProductList, ...cartList.filter((n) => !n.checked)];
  };

  /**
   * 订单生成
   */
  const handleSettleAccounts = async () => {
    const flag = await addressDataSet.validate();
    if (!flag) return;

    if (math.gt(purChaseData.totalPrice, DEFAULT_MAX)) {
      SwalAlert(intl.get('mallf.common.view.cart.overPrice').d('金额超过采购上限!'));
      return;
    }
    if (
      initData.initProducts
        .filter((p) => p.checked)
        .some((p) => p.agreementBusinessType === 'POINTS') &&
      initData.initProducts.filter((p) => p.checked).some((p) => !p.agreementBusinessType)
    ) {
      SwalAlert(
        intl.get('mallf.common.view.siglwarning.mixproduct').d('积分商品不能和普通商品一起下单')
      );
      return;
    }
    setLoadStatus({
      ...loadStatus,
      loading: true,
    });
    const selectedProducts = initData.initProducts.filter((p) => p.checked);
    const preProducts = [...selectedProducts];
    // 有库存的目录化商品
    const cataStockProduct = selectedProducts.filter((n) => n.stockQuantity);
    // 数量超过库存的商品
    const overStockProduct = [];
    cataStockProduct.forEach((pro) => {
      const { quantity, stockQuantity, productNum } = pro;
      if (quantity > stockQuantity) {
        overStockProduct.push(`【${productNum}】`);
      }
    });
    function preReqOrder() {
      const params = {
        addressId: addressDataSet.current.get('addressId'),
        shoppingCartDTOList: preProducts,
      };
      preReqOrderService(params)
        .then((res) => {
          const cartIds = preProducts.map((n) => n.cartId);
          props.history.push({
            pathname: '/sigl/before-order',
            data: { orderData: res, cartIds },
          });
        })
        .finally(() => {
          setLoadStatus({
            ...loadStatus,
            loading: false,
          });
        });
    }
    preReqOrder();
  };

  const itemCanChoose = useMemo(() => {
    const _product = initData.initProducts.filter((p) => getShelfStatus(p) && p.itemCode);
    return _product.length > 0;
  }, [initData.initProducts]);

  const integralBalanceRender = useMemo(() => {
    return (
      <div style={{ padding: 2 }}>
        {(integralBalanceData || []).map((integral) => {
          const { pointsTypeName, integralBalance } = integral;
          return (
            <div style={{ width: 200, display: 'flex', marginBottom: '5px' }}>
              <span>{pointsTypeName}：</span>
              <span style={{ flex: 1, textAlign: 'right' }}>
                <Icon type="donut_small" style={{ fontSize: 12, marginTop: -3, paddingRight: 3 }} />
                {priceNumberRender(integralBalance)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }, [integralBalanceData]);

  const totalIntegralRender = useMemo(() => {
    const { pointsTypes = {} } = purChaseData;
    return (
      <div style={{ padding: 2 }}>
        <div
          style={{
            fontWeight: 600,
            marginBottom: 10,
            fontSize: 14,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {intl.get('mallf.common.view.pointsTypesDetail').d('积分抵扣明细')}
        </div>
        {(Object.keys(pointsTypes) || []).map((point) => {
          return (
            <div style={{ width: 200, display: 'flex', marginBottom: '5px' }}>
              <span>{point}：</span>
              <span style={{ flex: 1, textAlign: 'right' }}>
                <Icon type="donut_small" style={{ fontSize: 12, marginTop: -3, paddingRight: 3 }} />
                {priceNumberRender(pointsTypes[point])}
              </span>
            </div>
          );
        })}
      </div>
    );
  }, [purChaseData]);

  const AddressSelect = () => {
    return (
      <Form dataSet={addressDataSet} labelLayout="float">
        <Select
          name="addressId"
          clearButton={false}
          style={{ width: 400 }}
          onChange={(val) => updateAddress(val)}
        />
      </Form>
    );
  };
  const rightBtn = useMemo(() => {
    return (
      <div
        className="remain-integral"
        style={{
          fontSize: 12,
          color: '#666666',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {integralBalanceData?.length > 1 ? (
          <Tooltip placement="bottom" title={integralBalanceRender}>
            <span style={{ paddingRight: 10 }}>
              {intl.get('mallf.common.view.sigl.allIntegralBalance').d('查看不同类型剩余可用积分')}
              <Icon type="expand_more" style={{ fontSize: 16, marginTop: -3, paddingLeft: 3 }} />
            </span>
          </Tooltip>
        ) : (
          <>
            <span style={{ paddingRight: 10 }}>
              {intl.get('mallf.common.view.sigl.remainIntegral').d('剩余可用积分')}：
            </span>
            <span style={{ color: '#191919', fontWeight: 600 }}>
              <Icon type="donut_small" style={{ fontSize: 12, marginTop: -3, paddingRight: 3 }} />
              {priceNumberRender(integralBalanceData?.[0]?.integralBalance)}
            </span>
          </>
        )}
        <span style={{ paddingLeft: 40 }}>
          {intl.get(`mallf.common.model.receive.info`).d('收货信息')}：
        </span>
        <AddressSelect />
      </div>
    );
  }, [integralBalanceData]);

  // 下一步按钮disabled
  const nextButtonDisabled =
    purChaseData.totalCount === 0 ||
    loadStatus.settleLoading ||
    initData.initProducts.some((item) => item.checked && !getShelfStatus(item));
  const isShowPointDetail = Object.values(purChaseData.pointsTypes).length > 1;
  return (
    <div>
      <BreadCrumbs
        className="breadCrumbs"
        value={{
          pageTitle: intl.get(`mallf.common.view.cart`).d('购物车'),
          rightBtn,
        }}
      />
      {loadStatus.loading ? (
        <Loading />
      ) : (
        <Spin spinning={loadStatus.cartSpinning}>
          <div
            className={style.cart}
            style={
              initData.initProducts === null || initData.initProducts.length === 0
                ? { paddingBottom: 0 }
                : {}
            }
          >
            <div className="cart-body">
              {/* 头 */}
              {initData.initProducts.length === 0 ? (
                <div className="emptyCart">
                  {loadStatus.loading ? (
                    <Loading />
                  ) : (
                    <div className="div-empty">
                      <p>
                        <img
                          alt=""
                          src={emptyImg}
                          style={{ width: 250, height: 180 }}
                          className="cartImg"
                        />
                      </p>
                      <span id="emptyCart">
                        {intl.get(`mallf.cart.view.cart.empty`).d('您的购物车是空的')}
                      </span>
                      <Link to="/sigl">
                        <span id="go">{intl.get(`mallf.cart.model.go.shopping`).d('去逛逛')}</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="cart-header">
                    <ul style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <li className="cart-header-left">
                        <Checkbox
                          onChange={(e) => {
                            handleOnChangeSelectAll(e);
                          }}
                          checked={initData.selectAll}
                        />
                      </li>
                      <li className="cart-header-title">
                        <span id="commodity">
                          {intl.get(`mallf.common.view.productinfo`).d('商品信息')}
                        </span>
                      </li>
                      <li className="cart-header-price">
                        <span id="unit price">
                          {intl.get(`mallf.common.view.single.price`).d('单价')}
                        </span>
                      </li>
                      <li className="cart-header-count">
                        <span id="num">{intl.get(`mallf.common.view.quantity`).d('数量')}</span>
                      </li>
                      <li className="cart-header-all-price">
                        <span id="subtotal">
                          {intl.get(`mallf.common.view.all.money`).d('金额')}
                        </span>
                      </li>
                      {/* <li className="cart-header-tips">
                        <span id="prompt">
                          {intl.get('mallf.common.view.item.code').d('物料编码')}
                        </span>
                      </li> */}
                      <li className="cart-header-option">
                        <span id="operation">
                          {intl.get(`mallf.common.view.operation`).d('操作')}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="cart-content-list">{cartDetail(true)}</div>
                </div>
              )}
            </div>
            {initData.initProducts === null || initData.initProducts.length === 0 ? (
              <></>
            ) : (
              <>
                <div
                  className={`cart-footer ${
                    !fix && initData.initProducts?.length ? 'levitate-cart-footer' : ''
                  }`}
                  style={{ width: footerWidth }}
                >
                  <Spin
                    // key={loadStatus.settleLoading}
                    // className="cart-change-spin"
                    spinning={loadStatus.settleLoading}
                    size="small"
                  >
                    <ul className={`${fix ? 'levitate-ul' : ''}`}>
                      {
                        <React.Fragment>
                          {
                            <>
                              <li className="cart-footer-left">
                                <Checkbox
                                  width={18}
                                  height={18}
                                  onChange={(e) => {
                                    handleOnChangeSelectAll(e);
                                  }}
                                  value={initData.selectAll}
                                />
                              </li>
                              <li>
                                <span id="selected">
                                  {intl.get(`mallf.cart.model.all.choosed`).d('已选')}
                                  {getCheckedProduct.length > 0 && `(${getCheckedProduct.length})`}
                                </span>
                              </li>
                            </>
                          }

                          <li
                            className="cart-footer-del"
                            onClick={() => {
                              handleClickDelete(false);
                            }}
                          >
                            <a disabled={!getCheckedProduct.length > 0}>
                              {intl.get(`mallf.cart.model.hadChoose.delete`).d('删除已选')}
                            </a>
                          </li>
                          <li className="more">
                            <p className="load">
                              <span className="point">...</span>
                              {
                                <div className="hidden-menu">
                                  <div
                                    className={classNames({
                                      'item-all-select': true,
                                    })}
                                    onClick={handleDeleteExpiredGoods}
                                  >
                                    <p>
                                      {intl
                                        .get('mallf.cart.model.item.clearExpiredGoods')
                                        .d('清空失效商品')}
                                    </p>
                                  </div>
                                  <div
                                    className={classNames({
                                      'item-all-select': true,
                                      'disable-choose': !itemCanChoose,
                                    })}
                                    onClick={handleSelectItem}
                                  >
                                    <span>
                                      {intl.get('mallf.cart.model.item.allSelect').d('物料全选')}
                                    </span>
                                  </div>
                                </div>
                              }
                            </p>
                          </li>
                        </React.Fragment>
                      }
                      <li className="cart-footer-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (qualityChange) {
                              return;
                            }
                            handleSettleAccounts(purchaseType);
                          }}
                          className={`all-product ${
                            nextButtonDisabled ? 'all-product-disabled' : ''
                          }`}
                          disabled={nextButtonDisabled}
                        >
                          {purchaseType === 'COMPANY'
                            ? intl.get(`mallf.common.view.next`).d('下一步')
                            : intl.get(`mallf.cart.model.create.order`).d('生成订单')}
                        </button>
                      </li>
                      {
                        <React.Fragment>
                          <li className="cart-footer-price">
                            {intl
                              .get(`mallf.cart.view.total.excludingShipping`)
                              .d('合计（不含运费）')}
                            <span className="cartRed2">
                              <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                                {`${initData.currencyName ? `(${initData.currencyName}) ` : ''}`}
                              </span>
                              <span>
                                {purChaseData.totalPoint > 0 && (
                                  <span>
                                    <Icon style={{ fontSize: 16 }} type="donut_small" />
                                    {numberRender(purChaseData.totalPoint)}
                                    <Tooltip title={isShowPointDetail && totalIntegralRender}>
                                      {isShowPointDetail && (
                                        <Icon
                                          type="expand_less"
                                          style={{ fontSize: 20, marginTop: -3, paddingLeft: 3 }}
                                        />
                                      )}
                                    </Tooltip>
                                    <span
                                      style={{ fontSize: 24, margin: '0 5px', fontWeight: 600 }}
                                    >
                                      +
                                    </span>
                                  </span>
                                )}
                                <span className="currencySymbol" style={{ fontSize: 16 }}>
                                  {initData.currencySymbol || ''}
                                </span>
                                {numberRender(
                                  purChaseData.totalPrice,
                                  initData.initProducts.filter((p) => p.checked)?.[0]
                                    ?.financialPrecision,
                                  true
                                )}
                              </span>
                            </span>
                          </li>
                          <li className="cart-footer-count">
                            {intl
                              .getHTML(`mallf.cart.model.hadChooseItems`, {
                                value: purChaseData.totalCount,
                              })
                              .d(
                                <span>
                                  已选择<b>{purChaseData.totalCount}</b>件商品
                                </span>
                              )}
                          </li>
                        </React.Fragment>
                      }
                    </ul>
                  </Spin>
                </div>
              </>
            )}
          </div>
        </Spin>
      )}
    </div>
  );
}
export default connect(({ global }) => ({
  webConfig: global.webConfig,
  constants: global.constants,
}))(withRouter(Cart));
