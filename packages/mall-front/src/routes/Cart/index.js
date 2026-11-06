import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { withRouter } from 'react-router-dom';
import { Checkbox, Spin } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import { isEmpty, sum, compose, isNil } from 'lodash';
import qs from 'qs';
import Big from 'big.js';
import AddressLov from 'components/AddressLov';
import useRequest from '@/hooks/useRequest';
import SwalAlert from 'components/swal';
import BreadCrumbs from 'components/BreadCrumbs';
import Loading from 'components/loading';
import Link from 'components/Link';
import Image from 'components/Image';
import { TabPane, Tabs } from 'components/TabPanel';
import BudgetEditModal from 'components/BudgetInfo/budgetEditModal';
import { openComfirmModal } from 'utils/modals';
import * as HmallConfig from 'utils/api-config';
import {
  getUserConfigInfo,
  getStockConfig,
  getProductLimit,
  getPrimaryColor,
  numberRender,
} from 'utils/utils';
import { accessIsLogin, batchGetCodes } from 'services/api';
import intl from 'utils/intl';
import { HmallOptions } from 'utils/options';
import {
  fetchProductService,
  updateCartService,
  deleteCartService,
  preReqOrderService,
  updateAddressService,
  queryCompareRule,
  fetchECStock,
  fetchECSale,
  fetchItemCode,
  updateBudget,
  budgetCheck,
  buggetRemain,
  fetchProductLabelPost as fetchProductLabel,
} from 'services/cartService';
// import withCustomize from 'srm-front-scuz/lib/OldCustomize';
import { fetchBudgetLov } from 'services/productDetailService';
// import failureImg from '../../assets/images/no-product.svg';
import { DEFAULT_MAX } from 'utils/constants';
import { math } from 'choerodon-ui/dataset';
import emptyImg from '../../assets/images/cart/illu_cart_nodata_default.svg';
import CartItem from './NewCartItem';
import PoItem from './PoItem';
import style from './Cart.less';
import ImportBtn from './ImportBtn';
import NewCart from '../CartProCopy';
import CuxFn from '@/cuxTools/cuxFn';
import CuxWrapper from '@/cuxTools/CuxWrapper';
import BatchBudget from './Budget';

let timer;

let EcProductStockData = []; // 电商商品的库存
let EcProductSaleData = []; // 电商商品的可售状态
let productDataItemCode = []; // 商品的物料编码
let itemLoadingList = [false]; // 储存物料编码的加载状态
let checkStatusProducts = {}; // 临时存储勾选的商品
function OldCart(props) {
  const { ecPlatFrom } = HmallOptions();
  const {
    organizationId,
    companyId,
    userId,
    hideFieldList,
    budgetSwitch,
    skuCheckFlag,
  } = getUserConfigInfo();
  const { purchaseType } = getUserConfigInfo();
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
  const [currentTab, setCurrentTab] = useState('all');
  const [countNum, setCount] = useState(0);
  const [purChaseData, setPurChaseData] = useState({
    totalPrice: 0,
    totalCount: 0,
  });
  const [fix, setFix] = useState(true);
  const [qualityChange, setQualityChange] = useState(false);
  const [visible, setVisible] = useState(false); // 修改地址模态框的展示
  const [rule, setRule] = useState(true); // 比价规则是否开启
  const [budgetList, setBudgetList] = useState([]); // 预算维度集合
  const [budgetSelectList, setBudgetSelectList] = useState([]); // 预算select组件数据
  const [budgetEditVisible, setBudgetEditVisible] = useState(false); // 预算编辑弹窗
  const [updateAddressList, setUpdateAddressList] = useState([]);
  const [labelList, setLabelList] = useState([]); // 商品标签
  let checkArr = [];
  const { resData: belongTypeList } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
    query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
  });
  const addressRef = useRef();

  const getShelfStatus = useCallback(
    (p) =>
      p.shelfFlag === 1 &&
      p.invalidFlag === 1 &&
      p.shelfStatus === 1 &&
      p.lockStatus === 1 &&
      !(p.productSource === 'CATA' && skuCheckFlag && p.stockQuantity <= 0),
    [skuCheckFlag]
  );
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
      // .concat(punchoutProduct)
    );
  }, [initData.initProducts]);

  useEffect(() => {
    EcProductStockData = []; // 电商商品的库存
    EcProductSaleData = []; // 电商商品的可售状态
    productDataItemCode = []; // 商品的物料编码
    itemLoadingList = [false]; // 储存物料编码的加载状态
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
    if (EcProductStockData.length === EcProductSaleData.length) {
      // 将电商商品数据合并到商品中
      EcProductSaleData.forEach((p, index) => {
        const current = EcProductStockData.find((i) => i.cartId === p.cartId) || {};
        EcProductSaleData[index] = {
          ...p,
          stockNum: current.stockNum,
          stockFlag: current.stockFlag,
          maxPurchaseQuantity: current.maxPurchaseQuantity,
        };
      });
    }
    const newList = [...initData.initProducts];
    newList.forEach((p, index) => {
      const current = EcProductSaleData.find((i) => i.cartId === p.cartId) || p;
      const { itemCode, itemName, itemId, itemCategoryId, itemCategoryName, itemCategoryCode } =
        productDataItemCode.find((i) => i.cartId === p.cartId) || p;
      const { checked } = checkStatusProducts.initProducts?.find((i) => i.cartId === p.cartId) || p;
      newList[index] = {
        ...p,
        ...current,
        itemCode,
        itemName,
        itemId,
        itemCategoryId,
        itemCategoryName,
        itemCategoryCode,
        checked,
      };
    });
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
  }, [countNum]);

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

  function chooseAddress(values) {
    const { addressId, item } = values;
    checkArr.push(item);
    const product = initData.initProducts.filter((f) => !f.qtHeaderNo);
    let checkedProducts = [];
    product.forEach(() => {
      checkedProducts = product.filter((every) => every.checked);
    });
    updateAddressService(checkArr, addressId).then(() => {
      fetchProduct(checkedProducts);
      checkArr = [];
    });
  }

  const openTable = (list = []) => {
    setUpdateAddressList(list);
    if (list.length === 0) {
      SwalAlert(
        intl.get('mallf.cart.view.product.chooseOneCurrency').d('请选中需要修改地址的商品')
      );
    } else {
      setVisible(true);
    }
  };

  function chooseBatchAddress(values) {
    const { addressId } = values;
    updateAddressService(updateAddressList, addressId).then(() => {
      fetchProduct(updateAddressList);
    });
  }

  /* 清空失效商品 */
  const handleDeleteExpiredGoods = () => {
    const expiredGoods = initData.initProducts.filter((p) => !getShelfStatus(p));
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

  /**
   * 获取到商品后设置是否悬浮底部控制条
   */
  // const setFixFoot = () => {
  //   const { clientHeight } = document.documentElement;
  //   const height = document.body && document.body.scrollHeight - clientHeight;
  //   if (height >= 90) {
  //     setFix(false);
  //   } else if (height < 90) {
  //     setFix(true);
  //   }
  // };

  useEffect(() => {
    accessIsLogin();
    fetchProduct();
    fetchCompareRule();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  function fetchCompareRule() {
    queryCompareRule().then((res) => {
      setRule(res.settingValue === '1');
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
    if (
      CuxFn({
        name: 'Cart-fn-cuxUpdateCheckCate',
        value: {
          cartItem,
          getCheckedProduct,
        },
      })() === false
    ) {
      return false;
    }
    if (
      initData.currencyCode === cartItem.currencyCode ||
      (initData.selectedCount === 0 && !initData.currencyCode)
    ) {
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
        selectAll: count === 0 ? false : checkIsSelectAll(changeProducts, cartItem.currencyCode),
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
    } else {
      checked = true;
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
      ladderPriceList: ladderPrices,
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
    const val = cartItem.quantity;
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
    updateCartService(params)
      .then(async (res) => {
        if (res) {
          const newBudgetInfoList = await CuxFn({
            name: 'Cart-fn-updateBudget',
            value: {
              params,
              cartItem,
              tmpQuantity,
              updateBudget,
              res,
            },
          })(async () => {
            // 当只有一条预算更新购物车时更新预算，更新采买组织时不需要更新预算
            const { budgetInfoList = [] } = cartItem;
            if (budgetInfoList.length === 1 && !params.updateOrganizationFlag) {
              const [newBudget] = await updateBudget([
                {
                  ...cartItem,
                  quantity: tmpQuantity,
                  budgetInfoList: budgetInfoList.map((n) => ({ ...n, quantity: tmpQuantity })),
                },
              ]);
              return newBudget?.budgetInfoList;
            }
            return res?.budgetInfoList;
          })();
          getECOtherData(
            [{ ...res, budgetInfoList: newBudgetInfoList }].filter((p) => p.sourceFrom !== 'CATA')
          );
          setQualityChange(false); // 解锁数量
          tmpChangeProducts = product.map((p) => {
            if (p.cartId === res.cartId) {
              return {
                ...res,
                budgetInfoList: newBudgetInfoList,
                checked,
              };
            } else if (!p.cartId && p.qtLine[0].cartId === cartItem.cartId) {
              return {
                ...p,
                qtLine: [res],
              };
            } else {
              return { ...p };
            }
          });
          if (params.updateOrganizationFlag) {
            await fetchProduct();

            CuxFn({
              name: 'Cart-fn-AfterUpdateOrganization',
              value: {
                initData,
                setInitData,
              },
            })();

            // 过滤更新采买组织商品后重新计算购物车总金额
            calculatePrice(product.filter((n) => n.cartId !== params.cartId));
            // props.history.push('/refresh');
            // product.forEach((item, index, arr) => {
            //   if (item.cartId === cartItem.cartId) {
            //     arr.splice(index, 1);
            //   }
            // });
            // setInitData({
            //   ...initData,
            //   initProducts: [res].concat(product),
            // });
          } else {
            setInitData({
              ...initData,
              selectedCount,
              selectAll: checked
                ? checkIsSelectAll(tmpChangeProducts, cartItem.currencyCode)
                : initData.selectAll,
              currencyCode: checked ? cartItem.currencyCode : initData.currencyCode,
              initProducts: tmpChangeProducts,
            });
            calculatePrice(tmpChangeProducts);
          }
        } else {
          SwalAlert(intl.get(`mallf.cart.view.fail.changeNum`).d('数量变更失败'));
        }
      })
      .catch(() => {
        resetCount();
        setQualityChange(false);
        setLoadStatus({
          ...loadStatus,
          cartSpinning: false,
        });
      })
      .finally(() => {
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
      let { currencyCode, selectedCount } = initData;

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
      }
      setUpdateAddressList(newUpdateAddressList);
      setInitData({
        initProducts: filterList,
        selectAll: checkIsSelectAll(filterList, currencyCode),
        currencyCode,
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
    const checkedProduct = product.filter((n) => n.checked);
    // 财务精度
    const financialPrecision = checkedProduct[0]?.qtHeaderNo
      ? checkedProduct[0].qtLine[0]?.financialPrecision
      : checkedProduct[0]?.financialPrecision;
    let total = 0;
    let count = 0;
    product.forEach((cart) => {
      if (cart.checked) {
        if (cart.qtHeaderNo) {
          cart.qtLine.forEach((line) => {
            const { quantity, latestPrice, totalAmount } = line;
            count = math.plus(count, quantity);

            const linePrice = totalAmount || math.multipliedBy(quantity, latestPrice);

            total = math.plus(total, linePrice);
          });
        } else {
          const { seSkuList, quantity, totalPrice } = cart;
          count = math.plus(quantity, count);
          if (seSkuList) {
            seSkuList.forEach((i) => {
              if (i.skuType === 3) {
                total = math.plus(total, math.multipliedBy(i.latestPrice, i.quantity));
              }
            });
          }
          total = math.plus(total, totalPrice);
        }
      }
    });
    setPurChaseData({
      totalPrice: count === 0 ? 0 : numberRender(total, financialPrecision, true),
      totalCount: count,
    });
  };

  function handlePunchOut(allProudct) {
    const initProducts = [];
    const recordPo = [];
    (allProudct || []).forEach((item) => {
      if (!item.qtHeaderNo) {
        initProducts.push({
          ...item,
        });
      }
      const totalPrice =
        item.totalPrice || item.totalPrice === 0 ? item.totalPrice : item.totalAmount;
      if (item.qtHeaderNo && !initProducts.some((s) => s.qtHeaderNo === item.qtHeaderNo)) {
        initProducts.push({
          qtHeaderNo: item.qtHeaderNo,
          checked: true,
          qtLine: [{ ...item, totalPrice }],
          currencyCode: item.currencyCode,
        });
      } else if (item.qtHeaderNo) {
        recordPo.push({ ...item, totalPrice });
      }
    });

    const tmpInitProducts = initProducts.map((m) => {
      if (m.qtHeaderNo) {
        return {
          ...m,
          qtLine: [...m.qtLine, ...recordPo.filter((f) => f.qtHeaderNo === m.qtHeaderNo)],
        };
      } else {
        return m;
      }
    });
    return tmpInitProducts;
  }

  /**
   * 查询商品
   */
  const fetchProduct = async (checkedProducts) => {
    let idArray = [];
    let poArray = [];
    if (checkedProducts) {
      idArray = checkedProducts.map((item) => item.productId);
      poArray = checkedProducts.map((item) => item.qtHeaderNo);
    }
    setLoadStatus({ cartSpinning: true, loading: countNum === 0 });
    await fetchProductService().then((json) => {
      const initProducts = [];
      const recordPo = [];
      (json || []).forEach((item) => {
        if (!item.qtHeaderNo) {
          initProducts.push({
            ...item,
            checked: idArray.indexOf(item.productId) >= 0,
          });
        }
        const totalPrice =
          item.totalPrice || item.totalPrice === 0 ? item.totalPrice : item.totalAmount;
        if (item.qtHeaderNo && !initProducts.some((s) => s.qtHeaderNo === item.qtHeaderNo)) {
          initProducts.push({
            qtHeaderNo: item.qtHeaderNo,
            checked: poArray.includes(item.qtHeaderNo),
            qtLine: [{ ...item, totalPrice }],
            currencyCode: item.currencyCode,
          });
        } else if (item.qtHeaderNo) {
          recordPo.push({ ...item, totalPrice });
        }
      });

      const tmpInitProducts = initProducts.map((m) => {
        if (m.qtHeaderNo) {
          return {
            ...m,
            qtLine: [...m.qtLine, ...recordPo.filter((f) => f.qtHeaderNo === m.qtHeaderNo)],
          };
        } else {
          return m;
        }
      });
      setInitData({
        ...initData,
        initProducts: tmpInitProducts,
      });
      setLoadStatus({
        ...loadStatus,
        loading: false,
        cartSpinning: false,
      });
      // 查电商商品
      getECOtherData(tmpInitProducts.filter((p) => p.sourceFrom !== 'CATA' && !p.qtHeaderNo));
      // 查商品物料映射编码
      getDataItemCode(tmpInitProducts.filter((f) => !f.qtHeaderNo));
      if (!checkedProducts) {
        handleScroll(); // 获取到商品后设置是否悬浮底部控制条
      }
    });
  };

  // const getPoData = (pro = []) => {
  //   let qtList = [...new Set(pro.map(m => m.qtHeaderNo))];
  //   qtList = qtList.map(qtHeaderNo => ({
  //     qtHeaderNo,
  //     checked: poData.find(poLine => poLine.qtHeaderNo === qtHeaderNo)?.checked,
  //     qtLine: pro.filter(f => f.qtHeaderNo === qtHeaderNo),
  //   }));
  //   setPoData(qtList);
  // };

  const getDataItemCode = (arr = []) => {
    productDataItemCode = []; // 清空 防止脏数据
    itemLoadingList = [];

    // 获取物料编码方法
    const fetchMethods = (params, loadingIndex) => {
      fetchItemCode(params).then((res) => {
        res.forEach((p) => {
          const current = productDataItemCode.some((i) => i?.cartId === p?.cartId);
          if (!current) {
            productDataItemCode.push(p);
          }
        });
        itemLoadingList[loadingIndex] = true;
        setCount((c) => c + 1);
      });
    };

    // 每组20个去查物料编码
    for (let i = 0; i < arr.length; i += 20) {
      const brr = arr.slice(i, i + 20);
      itemLoadingList.push(false);
      fetchMethods(brr, i / 20);
    }
  };

  const getECOtherData = (arr = []) => {
    const obj = {};
    EcProductStockData = []; // 清空 防止脏数据
    EcProductSaleData = [];
    arr.forEach((p) => {
      if (!obj[p.productSource]) {
        obj[p.productSource] = [];
      }
      obj[p.productSource].push(p);
    });
    for (const key in obj) {
      // 电商纬度
      if (key) {
        const addressObj = {};
        obj[key].forEach((p) => {
          if (!addressObj[`${key}_${p.addressId}`]) {
            // 电商和地址的合并纬度
            addressObj[`${key}_${p.addressId}`] = [];
          }
          addressObj[`${key}_${p.addressId}`].push(p);
        });
        for (const k in addressObj) {
          if (k) {
            // 查库存
            // eslint-disable-next-line no-loop-func
            fetchECStock(addressObj[k]).then((res) => {
              res.forEach((p) => {
                const current = EcProductStockData.some((i) => i?.cartId === p?.cartId);
                if (!current) {
                  EcProductStockData.push(p);
                }
              });
              setCount((c) => c + 1);
            });
            // 查是否可售
            // eslint-disable-next-line no-loop-func
            fetchECSale(addressObj[k]).then((res) => {
              res.forEach((p) => {
                const current = EcProductSaleData.some((i) => i?.cartId === p?.cartId);
                if (!current) {
                  EcProductSaleData.push(p);
                }
              });
              setCount((c) => c + 1);
            });
          }
        }
      }
    }
  };

  function getCurrentNum(currentNum) {
    setInitCounter(currentNum);
  }

  // 预算值集查询
  useEffect(() => {
    if (budgetSwitch === '1') {
      fetchBudgetLov().then((res) => {
        if (res) {
          setBudgetList(res);
          let selectLovCodeObj = {};
          res
            .filter((item) => item.componentType === 'SELECT')
            .forEach((n) => {
              const { lovCode } = n;
              selectLovCodeObj = { ...selectLovCodeObj, [lovCode]: lovCode };
            });
          if (!isEmpty(selectLovCodeObj)) {
            batchGetCodes(selectLovCodeObj).then((resp) => {
              if (resp) {
                setBudgetSelectList(resp);
              }
            });
          }
        }
      });
    }
  }, [budgetSwitch]);

  // 编辑预算
  function editBudget(params) {
    const newproductData = initData.initProducts.map((item) => {
      // pounchOut商品
      if (item.qtHeaderNo) {
        const newQtline = item.qtLine.map((q) => {
          const cartLine = params.find((p) => q.cartId === p.cartId) || {};
          return isEmpty(cartLine) ? q : cartLine;
        });
        return {
          ...item,
          qtLine: newQtline,
        };
      }
      // 标准商品
      const cartLine = params.find((p) => item.cartId === p.cartId) || {};
      return isEmpty(cartLine) ? item : cartLine;
    });
    calculatePrice(newproductData);
    setInitData({
      ...initData,
      initProducts: newproductData,
    });
  }

  useEffect(() => {
    // 过滤punchOut商品
    const productIds = initData.initProducts.filter((m) => !m.qtHeaderNo).map((n) => n.productId);
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
        return item.qtHeaderNo ? (
          renderPunchOut(item, {
            marginBottom: product[index + 1] && !product[index + 1].qtHeaderNo ? 10 : 0,
          })
        ) : (
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
              visible={visible}
              updateCheck={updateCheck}
              updateCart={updateCart}
              deleteCart={deleteCart}
              chooseAddress={chooseAddress}
              checkArr={checkArr}
              rule={rule}
              fetchProduct={fetchProduct}
              timer={timer}
              getCurrentNum={getCurrentNum}
              currentCode={initData.currencyCode}
              budgetList={budgetList}
              budgetSelectList={budgetSelectList}
              editBudget={editBudget}
              belongTypeList={belongTypeList}
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
            visible={visible}
            updateCart={updateCart}
            deleteCart={deleteCart}
            chooseAddress={chooseAddress}
            checkArr={checkArr}
            timer={timer}
            setInitCounter={setInitCounter}
            getCurrentNum={getCurrentNum}
            belongTypeList={belongTypeList}
            labels={labels}
            qualityChange={qualityChange}
          />
        );
      });
    }
  };

  const handleChangePunchCheck = (poLine, bool) => {
    const poCurrencyCode = poLine.currencyCode;
    if (initData.currencyCode === poCurrencyCode || !initData.currencyCode) {
      const newProduct = initData.initProducts.map((m) =>
        poLine.qtHeaderNo === m.qtHeaderNo ? { ...m, checked: bool } : m
      );
      const count = bool
        ? initData.selectedCount + poLine.qtLine.length
        : initData.selectedCount - poLine.qtLine.length;
      setInitData({
        ...initData,
        initProducts: newProduct,
        selectAll: checkIsSelectAll(newProduct, poCurrencyCode),
        selectedCount: count,
        currencyCode: count === 0 ? '' : poCurrencyCode,
      });
      calculatePrice(newProduct);
    } else {
      SwalAlert(
        intl.get(`mallf.cart.view.porduct.chooseSameCurrency`).d('只能选择相同币种的商品！')
      );
    }
  };

  const renderPunchOut = (poLine, poStyle) => {
    return (
      <div className="cart-punchout-line" style={poStyle}>
        <div className="punch-header">
          <span className="punch-header-check">
            <Checkbox
              checked={poLine.checked}
              onChange={(e) => {
                handleChangePunchCheck(poLine, e.target.checked);
              }}
            />
          </span>
          <p className="punch-header-source">
            <span className="punchout-h-label">
              {intl.get('mallf.cart.view.Ec.sourceFrom').d('来源电商')}：
            </span>
            <span className="punchout-h-content">{ecPlatFrom[poLine.qtLine[0].productSource]}</span>
          </p>
          <p className="punch-header-receiver">
            <span className="punchout-h-label">
              {intl.get(`mallf.cart.model.receive.info`).d('收货信息')}：
            </span>
            <span className="punchout-h-name">{poLine.qtLine[0].contactName}</span>
            <span className="punchout-h-address" title={poLine.qtLine[0].address}>
              {poLine.qtLine[0].address}
            </span>
            <a
              style={{ marginLeft: 4 }}
              className="detail-info-update"
              onClick={() => {
                openTable(poLine.qtLine);
                addressRef.current.element.element.click();
              }}
            >
              <Icon type="mode_edit" style={{ color: getPrimaryColor(), fontSize: 12 }} />
            </a>
          </p>
          <p className="punchout-header-qhHeaderNo">
            <span className="punchout-h-label">
              {intl.get('mallf.cart.view.qtHeaderNo').d('报价单号')}：
            </span>
            <span className="punchout-h-content">{poLine.qtLine[0].qtHeaderNo}</span>
          </p>
          <p className="punchout-header-date">
            <span className="punchout-h-label">
              {intl.get('mallf.cart.view.qtEndDate').d('报价有效期')}：
            </span>
            <span className="punchout-h-content">{poLine.qtLine[0].qtEndDate}</span>
          </p>
        </div>
        {poLine.qtLine.map((item) => (
          <PoItem
            item={item}
            shelf={getShelfStatus(item)}
            visible={visible}
            // updateCheck={updateCheck}
            updateCart={updateCart}
            deleteCart={deleteCart}
            checkArr={checkArr}
            rule={rule}
            fetchProduct={fetchProduct}
            timer={timer}
            currentCode={initData.currencyCode}
            editBudget={editBudget}
            budgetList={budgetList}
            budgetSelectList={budgetSelectList}
          />
        ))}
      </div>
    );
  };

  /* 全选 */
  const handleOnChangeSelectAll = (e) => {
    const val = e.target.checked;
    let count = 0;
    const { currencyCode } = initData;
    let product = initData.initProducts;
    product = product.filter(
      (p) => (getShelfStatus(p) || p.qtHeaderNo) && !getStockConfig(p)
      // p.effectiveFlag
    ); // 过滤掉失效商品及开启了库存强校验库存不足的商品
    // 第一个子元素的币种编码
    const firstCurrencyCode = currencyCode || (product.length > 0 ? product[0].currencyCode : '');
    const changeProducts = CuxFn({
      name: 'Cart-fn-cuxSelectAll',
      value: {
        initData,
        firstCurrencyCode,
        getStockConfig,
        val,
        count,
        getCheckedProduct,
      },
    })(() => {
      return initData.initProducts.map((item) => {
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
    })();
    setInitData({
      currencyCode: val ? firstCurrencyCode : '',
      selectAll: val,
      initProducts: changeProducts,
      selectedCount: val ? count : 0,
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

    const updateItemCheck = (list, code, c) => {
      setInitData({
        currencyCode: code,
        selectAll: checkIsSelectAll(list, code),
        initProducts: list,
        selectedCount: c,
      });
      calculatePrice(list);
    };

    const itemCheckAll = () => {
      // 所有物料商品
      if (itemProduct.length > 0) {
        const { currencyCode } = itemProduct[0];
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
        updateItemCheck(changeProducts, currencyCode, count);
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
        updateItemCheck(changeProducts, '', count);
      } else {
        itemCheckAll();
      }
    }
  };

  // 预算校验
  const checkBudget = (productList) => {
    return new Promise((resolve) => {
      budgetCheck(productList)
        .then((res) => {
          if (res) {
            const newRes = res.map((item) => {
              const { success, quantity } = item;
              return {
                ...item,
                success:
                  success && sum(item?.budgetInfoList?.map((n) => n.quantity)) === quantity ? 1 : 0, // 校验购物车预算数量
              };
            });
            resolve(newRes);
          }
        })
        .catch(() => {
          setLoadStatus({
            ...loadStatus,
            loading: false,
          });
        });
    });
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
   * 处理购物车预算数据
   */
  const handleCartBudgetData = async (preProducts) => {
    // 开启预算
    if (budgetSwitch === '1' && preProducts.some((p) => p.budgetSwitch === '1')) {
      // 剔除success字段,会影响后端检验返回
      const checkBudgetData = preProducts
        .map((n) => {
          const { success, ...others } = n;
          return others;
        })
        .filter((p) => p.budgetSwitch === '1');
      const budgetValidList = await checkBudget(checkBudgetData);
      if (!budgetValidList.every((n) => n.success === 1)) {
        // 购物车商品行剔除success，勾选商品行校验后会重新覆盖
        const cartList = initData.initProducts.map((n) => {
          const { success, ...others } = n;
          return others;
        });
        const newCartProducts = cartProductSortTop(handlePunchOut(budgetValidList), cartList);
        setInitData({
          ...initData,
          initProducts: newCartProducts, // 为了排序，否则勾选商品倒序了
        });
        setLoadStatus({
          ...loadStatus,
          loading: false,
        });
        const errLength = budgetValidList.filter((n) => n.success !== 1)?.length;
        SwalAlert(
          intl
            .get('mallf.cart.view.budget.errLength', {
              value: errLength,
            })
            .d(`当前共有${errLength}件商品未通过预算，请维护预算信息。`)
        );
        const errBudgetOffsetTop =
          document.getElementsByClassName('cart-budget-warn')[0]?.offsetTop || 0;
        document.body.scrollTop = errBudgetOffsetTop;
        return false;
      } else {
        // 查出预算余额
        // eslint-disable-next-line no-param-reassign
        preProducts = await buggetRemain(budgetValidList);
      }
    }
    return preProducts;
  };

  /**
   * 订单生成
   */
  const handleSettleAccounts = () => {
    if (
      CuxFn({
        name: 'Cart-fn-cuxPreCheckCate',
        value: {
          getCheckedProduct,
        },
      })() === false
    ) {
      return false;
    }
    // 赠品 TODO
    // if (false) {
    //   const noGiftProducts = initData.initProducts.filter((p) => p.checked);
    //   const message = noGiftProducts.slice(0, 3).map((n) => {
    //     return (
    //       <>
    //         【
    //         <span
    //           style={{
    //             display: 'inline-block',
    //             maxWidth: '100px',
    //             verticalAlign: 'bottom',
    //           }}
    //           className="text-overflow"
    //           title={n.productName}
    //         >
    //           {n.productName}
    //         </span>
    //         】
    //       </>
    //     );
    //   });
    //   openComfirmModal({
    //     title: intl.get('mallf.common.view.prompt').d('提示'),
    //     border: false,
    //     children: (
    //       <span>
    //         {intl.get('mallf.common.view.produc').d('商品')}
    //         {message}
    //         {noGiftProducts.length > 3 ? intl.get('mallf.cart.view.stockMore').d('等') : ''}
    //         {intl
    //           .get('mallf.cart.view.giftStockOver.confirm')
    //           .d('赠品已送完，请确认是否继续生成采购申请？')}
    //       </span>
    //     ),
    //     onOk: () => {},
    //   });
    //   return;
    // }
    if (!math.isNaN(purChaseData.totalPrice) && math.gt(purChaseData.totalPrice, DEFAULT_MAX)) {
      SwalAlert(intl.get('mallf.cart.view.cart.overPrice').d('金额超过采购上限!'));
      return;
    }
    if (
      initData.initProducts
        .filter((p) => p.checked)
        .some((p) => p.agreementBusinessType === 'POINTS') &&
      initData.initProducts.filter((p) => p.checked).some((p) => !p.agreementBusinessType)
    ) {
      SwalAlert(
        intl.get('mallf.cart.view.siglwarning.mixproduct').d('积分商品不能和普通商品一起下单')
      );
      return;
    }
    const product = initData.initProducts.filter((f) => !f.qtHeaderNo);
    const poData = initData.initProducts.filter((f) => f.qtHeaderNo);
    setLoadStatus({
      ...loadStatus,
      loading: true,
    });
    const selectedProducts = product.filter((p) => p.checked);
    const tmpSelectProducts = selectedProducts.map((item) => {
      const { seSkuList = [], quantity, isCanVAT } = item;
      if (seSkuList) {
        for (let i = 0; i < seSkuList.length; i++) {
          seSkuList[i].quantity = quantity;
          seSkuList[i].isCanVAT = isCanVAT;
          seSkuList[i].totalPrice = quantity * seSkuList[i].latestPrice;
        }
      }
      return {
        ...item,
        seSkuList,
        purchaseType,
        levelPath: getUserConfigInfo().levelPath,
        labels: labelList?.find((n) => n.productId === item.productId), // 商品标签
      };
    });
    let preProducts = [...tmpSelectProducts];
    poData.forEach((poLine) => {
      if (poLine.checked) {
        preProducts = [...preProducts, ...poLine.qtLine];
      }
    });
    // 有库存的目录化商品
    const cataStockProduct = tmpSelectProducts.filter((n) => n.stockQuantity >= 0);
    // 数量超过库存的商品
    const overStockProduct = [];
    cataStockProduct.forEach((pro) => {
      const { quantity, stockQuantity, productName } = pro;
      if (quantity > stockQuantity) {
        overStockProduct.push(`【${productName}】`);
      }
    });
    async function preReqOrder() {
      // 处理预算
      const newPreProducts = await CuxFn({
        name: 'Cart-fn-handleCartBudgetData',
        value: {
          preProducts,
          initData,
          loadStatus,
          cartProductSortTop,
          setInitData,
          handlePunchOut,
          setLoadStatus,
          checkBudget,
          buggetRemain,
          handleCartBudgetData,
        },
      })(() => handleCartBudgetData(preProducts))();
      if (newPreProducts) {
        preReqOrderService(newPreProducts)
          .then((res) => {
            const jump = () => {
              const cartIds = newPreProducts.map((n) => n.cartId);
              props.history.push({
                pathname: '/before-company-order',
                data: { orderData: res, cartIds },
              });
            };
            const list = res?.map((n) => n.shoppingCartDTOList)?.flat();
            if (res && list?.some((n) => n.giftStockOutFlag === 1)) {
              const noGiftProducts = list.filter((n) => n.giftStockOutFlag === 1);
              const productNameList = new Set(noGiftProducts.map((n) => n.productName));
              const message = Array.from(productNameList)
                .slice(0, 3)
                .map((name) => {
                  return (
                    <>
                      【
                      <span
                        style={{
                          display: 'inline-block',
                          maxWidth: '100px',
                          verticalAlign: 'bottom',
                        }}
                        className="text-overflow"
                        title={name}
                      >
                        {name}
                      </span>
                      】
                    </>
                  );
                });
              openComfirmModal({
                title: intl.get('mallf.common.view.prompt').d('提示'),
                border: false,
                children: (
                  <span>
                    {intl.get('mallf.common.view.produc').d('商品')}
                    {message}
                    {noGiftProducts.length > 3 ? intl.get('mallf.cart.view.stockMore').d('等') : ''}
                    {intl
                      .get('mallf.cart.view.giftStockOver.confirm')
                      .d('赠品已送完，请确认是否继续生成采购申请？')}
                  </span>
                ),
                onOk: () => {
                  jump();
                },
              });
              return;
            }
            CuxFn({
              name: 'Cart-fn-preReqOrderJump',
              value: { res, jump },
            })(jump)();
          })
          .finally(() => {
            setLoadStatus({
              ...loadStatus,
              loading: false,
            });
          });
      }
    }
    preReqOrder();
  };

  // 页面渲染前数据处理获取
  const failureProduct = initData.initProducts.filter((p) => !getShelfStatus(p));

  const addressCuxRender = CuxFn({
    name: 'Cart-fn-addressCuxRender',
  })(() => (
    <li className="cart-footer-add">
      <AddressLov
        mode="button"
        className="address-lov"
        clearButton={false}
        onRef={(ref) => {
          addressRef.current = ref;
        }}
        lovPara={{ companyId, userId }}
        onChange={(address) => chooseBatchAddress(address)}
      />
      <a
        disabled={!getCheckedProduct.length > 0}
        onClick={() => {
          let checkList = [...initData.initProducts.filter((f) => f.checked && !f.qtLine)];
          poData.forEach((f) => {
            if (f.checked) {
              checkList = [...checkList, ...f.qtLine];
            }
          });
          setShowEdit('');
          openTable(checkList);
          addressRef.current.element.element.click();
        }}
      >
        {intl.get(`mallf.cart.model.update.address`).d('修改地址')}
      </a>
    </li>
  ));

  const itemCanChoose = useMemo(() => {
    const _product = initData.initProducts.filter(
      (p) => getShelfStatus(p) && !p.qtHeaderNo && p.itemCode
    );
    return _product.length > 0;
  }, [initData.initProducts]);

  const budgetModalProps = {
    budgetData: initData.initProducts.filter((n) => n.checked),
    budgetList,
    budgetSelectList,
    budgetVisible: budgetEditVisible,
    setBudgetVisible: setBudgetEditVisible,
    editBudget,
  };

  const mallProduct = initData.initProducts.filter((f) => !f.qtHeaderNo);
  const poData = initData.initProducts.filter((f) => f.qtHeaderNo);

  // 勾选商品价格不存在时下一步按钮禁用
  const checkNoPrice = initData.initProducts.some(
    (item) => !item.qtHeaderNo && item.checked && isNil(item.totalPrice)
  );

  // 下一步按钮disabled
  const nextButtonDisabled =
    !!(purChaseData.totalCount <= 0) ||
    loadStatus.settleLoading ||
    initData.initProducts.some(
      (item) => !item.qtHeaderNo && item.checked && !getShelfStatus(item)
    ) ||
    checkNoPrice;
  const newTotalCount = useMemo(() => new Big(purChaseData.totalCount).toString(), [
    purChaseData.totalCount,
  ]);
  const showImportBtn = CuxFn({
    name: 'Cart-fn-showImportBtn',
    value: { hideFieldList, initData },
  })(() => hideFieldList && !hideFieldList.includes('SHOPPINGCART_IMPORT'))();

  return (
    <div>
      <BreadCrumbs
        className="breadCrumbs"
        value={{
          pageTitle: intl.get(`mallf.cart.view.cart`).d('购物车'),
          rightBtn: showImportBtn && <ImportBtn initData={initData} setInitData={setInitData} />,
        }}
      />
      {loadStatus.loading ? (
        <Loading />
      ) : (
        <Spin spinning={loadStatus.cartSpinning}>
          <div
            className={style.cart}
            style={
              initData.initProducts === null ||
              initData.initProducts.length === 0 ||
              (failureProduct.length === 0 && currentTab !== 'all')
                ? { paddingBottom: 0 }
                : {}
            }
          >
            <div className="cart-body">
              {/* 头 */}
              <Tabs>
                <TabPane
                  title={intl.get(`mallf.cart.model.cart.allProduct`).d('全部商品')}
                  key="all"
                  onClick={(e, key) => setCurrentTab(key)}
                >
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
                          <Link to="/">
                            <span id="go">
                              {intl.get(`mallf.cart.model.go.shopping`).d('去逛逛')}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="cart-header">
                        <ul style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <li className="cart-header-left">
                            {initData.initProducts.every(
                              (item) =>
                                !!item.totalPrice ||
                                item.totalPrice === 0 ||
                                item.qtLine?.every((t) => t.totalAmount) ||
                                !getShelfStatus(item)
                            ) && (
                              <Checkbox
                                onChange={(e) => {
                                  handleOnChangeSelectAll(e);
                                }}
                                checked={initData.selectAll}
                                disabled={
                                  mallProduct.every(
                                    (p) => !getShelfStatus(p) || getStockConfig(p)
                                  ) && poData.length === 0
                                }
                              />
                            )}
                          </li>
                          <li className="cart-header-title">
                            <span id="commodity">
                              {intl.get(`mallf.cart.view.productinfo`).d('商品信息')}
                            </span>
                          </li>
                          <li className="cart-header-purchse">
                            <span id="purchse">
                              {intl.get(`mallf.cart.view.purchseinfo`).d('采买信息')}
                            </span>
                          </li>
                          <CuxWrapper path="Cart/Header/TableColumn" />
                          {/* <li className="cart-header-unit">
                            <span id="currency">
                              {intl.get(`mallf.cart.view.currency`).d('币种')}
                            </span>
                          </li> */}
                          <li className="cart-header-price">
                            <span id="unit price">
                              {intl.get(`mallf.cart.view.single.price`).d('单价')}
                            </span>
                          </li>
                          <li className="cart-header-count">
                            <span id="num">{intl.get(`mallf.cart.view.quantity`).d('数量')}</span>
                          </li>
                          <li className="cart-header-all-price">
                            <span id="subtotal">
                              {intl.get(`mallf.cart.view.all.money`).d('金额')}
                            </span>
                          </li>
                          {/* <li className="cart-header-tips">
                            <span id="prompt">
                              {intl.get('mallf.cart.view.item.code').d('物料编码')}
                            </span>
                          </li> */}
                          <li className="cart-header-option">
                            <span id="operation">
                              {intl.get(`mallf.cart.view.operation`).d('操作')}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="cart-content-list">{cartDetail(true)}</div>
                    </div>
                  )}
                </TabPane>
                <TabPane
                  title={intl.get(`mallf.cart.model.FailureGoods`).d('失效商品')}
                  key="invalid"
                  tips={failureProduct.length > 0 ? failureProduct.length : ''}
                  onClick={(e, key) => setCurrentTab(key)}
                >
                  {failureProduct.length === 0 ? (
                    <div className="emptyCart">
                      {loadStatus.loading ? (
                        <Loading />
                      ) : (
                        <div className="div-empty">
                          <p>
                            <Image value={emptyImg} width={250} height={180} className="cartImg" />
                          </p>
                          <span>
                            {intl.get(`mallf.cart.view.none.FailureGoods`).d('暂无失效商品')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="cart-header">
                        <ul style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <li className="cart-header-left" style={{ visibility: 'hidden' }}>
                            <Checkbox
                              width={18}
                              height={18}
                              onChange={(e) => {
                                handleOnChangeSelectAll(e);
                              }}
                              value={false}
                            />
                          </li>
                          <li className="cart-header-title">
                            <span id="commodity">
                              {intl.get(`mallf.cart.view.productinfo`).d('商品信息')}
                            </span>
                          </li>
                          <li className="cart-header-purchse">
                            <span id="purchse">
                              {intl.get(`mallf.cart.view.purchseinfo`).d('采买信息')}
                            </span>
                          </li>
                          <CuxWrapper path="Cart/Header/TableColumn" />
                          {/* <li className="cart-header-unit">
                            <span id="currency">
                              {intl.get(`mallf.cart.view.currency`).d('币种')}
                            </span>
                          </li> */}
                          <li className="cart-header-price">
                            <span id="unit price">
                              {intl.get(`mallf.cart.view.single.price`).d('单价')}
                            </span>
                          </li>
                          <li className="cart-header-count">
                            <span id="num">{intl.get(`mallf.cart.view.quantity`).d('数量')}</span>
                          </li>
                          <li className="cart-header-all-price">
                            <span id="subtotal">
                              {intl.get(`mallf.cart.view.subtotal`).d('小计')}
                            </span>
                          </li>
                          {/* <li className="cart-header-tips">
                            <span id="prompt">
                              {intl.get('mallf.cart.view.item.code').d('物料编码')}
                            </span>
                          </li> */}
                          <li className="cart-header-option">
                            <span id="operation">
                              {intl.get(`mallf.cart.view.operation`).d('操作')}
                            </span>
                          </li>
                        </ul>
                      </div>
                      {failureProduct.length > 0 && (
                        <div className="cart-content-list">{cartDetail(false)}</div>
                      )}
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </div>
            {initData.initProducts === null ||
            initData.initProducts.length === 0 ||
            (failureProduct.length === 0 && currentTab !== 'all') ? (
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
                    spinning={loadStatus.settleLoading}
                    size="small"
                  >
                    <ul className={`${fix ? 'levitate-ul' : ''}`}>
                      {currentTab === 'all' && (
                        <React.Fragment>
                          {initData.initProducts.every(
                            (item) =>
                              !!item.totalPrice ||
                              item.totalPrice === 0 ||
                              item.qtLine?.every((t) => t.totalAmount) ||
                              !getShelfStatus(item)
                          ) && (
                            <>
                              <li className="cart-footer-left">
                                <Checkbox
                                  width={18}
                                  height={18}
                                  onChange={(e) => {
                                    handleOnChangeSelectAll(e);
                                  }}
                                  value={initData.selectAll}
                                  disabled={
                                    mallProduct.every(
                                      (p) => !getShelfStatus(p) || getStockConfig(p)
                                    ) && poData.length === 0
                                  }
                                />
                              </li>
                              <li>
                                <span id="selected">
                                  {intl.get(`mallf.cart.model.all.choosed`).d('已选')}
                                  {getCheckedProduct.length > 0 && `(${getCheckedProduct.length})`}
                                </span>
                              </li>
                            </>
                          )}

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
                          {addressCuxRender()}
                          <BatchBudget
                            batchFlag
                            budgetData={getCheckedProduct}
                            budgetList={budgetList}
                            budgetSelectList={budgetSelectList}
                            saveCallBack={editBudget}
                          />
                          <li className="more">
                            <p className="load">
                              <span className="point">...</span>
                              {itemLoadingList.every((item) => item) && (
                                <div className="hidden-menu">
                                  <div
                                    className={classNames({
                                      'item-all-select': true,
                                      'disable-choose': !itemCanChoose,
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
                              )}
                            </p>
                          </li>
                        </React.Fragment>
                      )}
                      <li className="cart-footer-right">
                        {currentTab === 'all' ? (
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
                              ? intl.get(`mallf.cart.view.next`).d('下一步')
                              : intl.get(`mallf.cart.model.create.order`).d('生成订单')}
                          </button>
                        ) : (
                          failureProduct.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleClickDelete(true);
                              }}
                              className={`failure-Product ${
                                failureProduct.length <= 0 ? '' : 'empty-failure-Product'
                              }`}
                              text={intl
                                .get(`mallf.cart.model.clear.FailureGoods`)
                                .d('清空失效商品')}
                              disabled={failureProduct.length <= 0}
                            >
                              {intl.get(`mallf.cart.model.clear.FailureGoods`).d('清空失效商品')}
                            </button>
                          )
                        )}
                      </li>
                      {currentTab === 'all' && (
                        <React.Fragment>
                          <li className="cart-footer-price">
                            {intl
                              .get(`mallf.cart.view.total.excludingShipping`)
                              .d('合计（不含运费）')}
                            <span className="cartRed2">
                              <span className="currencySymbol" style={{ fontSize: 16 }}>
                                {initData?.currencySymbol}
                              </span>
                              {purChaseData.totalPrice}
                            </span>
                          </li>
                          <li className="cart-footer-count">
                            {intl
                              .getHTML(`mallf.cart.model.hadChooseItems`, {
                                value: purChaseData.totalCount,
                              })
                              .d(
                                <span>
                                  已选择<b>{newTotalCount}</b>件商品
                                </span>
                              )}
                          </li>
                        </React.Fragment>
                      )}
                    </ul>
                  </Spin>
                </div>
              </>
            )}
          </div>
        </Spin>
      )}
      {budgetEditVisible && <BudgetEditModal {...budgetModalProps} />}
    </div>
  );
}

function Cart(props) {
  const { isNewCart } = props;
  switch (isNewCart) {
    case 1:
      return <NewCart {...props} />;
    case 0:
      return <OldCart {...props} />;
    default:
      return <></>;
  }
}

export default compose(
  withRouter,
  formatterCollections({ code: 'mallf.cart' }),
  connect(({ global }) => ({
    isNewCart: global.isNewCart,
    webConfig: global.webConfig,
    constants: global.constants,
  }))
)(Cart);
