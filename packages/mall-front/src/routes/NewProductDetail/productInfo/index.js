import React, { useState, useEffect, useMemo, useRef } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import Big from 'big.js';
import { Spin, Checkbox, Icon } from 'hzero-ui';
// import Swiper from 'swiper';
import { isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { DataSet, Icon as C7nIcon } from 'choerodon-ui/pro';
import qs from 'qs';

import { DEFAULT_MAX } from 'utils/constants';
import { getOpenCartFlag } from 'utils/configUtils';
import Image from 'components/Image';
import Swal from 'components/swal';
import Icons from 'components/Icons';
import request from 'utils/request';
import LabelPreview from 'components/LabelPreview';
import intl from 'utils/intl';
import Fly from 'utils/flyCart';
import HmallConfig from 'utils/api-config';
import { SupplierComponent } from 'utils/renderer';
import { getNumberLocalized } from 'utils/numberRender';
import { openGoToLowestSkuModal } from 'utils/modals';
import {
  getUserConfigInfo,
  getProductLimit,
  getToFixed,
  priceNumberRender,
  calcValidatePack,
  getMinPurchaseQuantity,
} from 'utils/utils';
import { getHeaderFixedDimension, getCartParams } from 'utils/addNewCart';
import { accessIsLogin } from 'services/api';
import AddressModal from 'routes/MyMall/AddressList/AddressModal';
import AddressLov from 'components/AddressLov';
import { ReceiveLov } from 'components/C7nProLov/commons';

import {
  queryStock,
  addCartService,
  // checkCompareRule,
  // getSameProductList,
  // queryGiftSku,
  queryExtensionIns,
  fetchBudgetLov,
  buyNowService,
} from 'services/productDetailService';
import { updateBudget, saveCustom } from 'services/cartService';
import {
  addNewCartService,
  newBuyNowService,
  ecCustomizedPriceService,
  openCartBuyNowService,
  getCardByPriceService,
} from 'services/newCartService';
import ReceiverPhone from './JDECardInfo/ReceiverPhone';
import JDECardInfo from './JDECardInfo';
import RangePrice from './rangePrice';
import ReceiveInfo from './ReceiveInfo';

import Spec from './spec';
import Price from './price';
import styles from './index.less';
import CuxFn from '@/cuxTools/cuxFn';
import { getCurrentLanguage } from '@/utils/utils';
import Allocation from './Allocation';
import AllocationModal from '@/routes/CartProCopy/ProductAllocation/AllocationModal';
import BudgetInfo from './BudgetInfo';
import AddressInfo from './AddressInfo';
import CustomInfo from './CustomInfo';
import AddCart from './AddCart';
import SaleQuality from './SaleQuality';
import ActivityLabel, { getCataGiftLabels } from './ActivityLabel';

export const code3 = 'MALL.PRODUCT.DETAIL.BASE.INFO';

let timer;
export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
  isNewCart: global.isNewCart,
}))(
  withRouter(function ProductInfo(props) {
    const {
      userId,
      companyId,
      organizationId,
      purchaseType,
      invoiceOrgId,
      // invoiceOrgName,
      purchaseOrgId: initPurOrgId,
      // purchaseOrgName,
      hideFieldList = [],
      addressInfo,
      skuCheckFlag,
      noTaxDisplayType,
      unitId,
      unitName,
      budgetSwitch,
      levelPath,
      tenantId,
    } = getUserConfigInfo();
    const {
      similarData,
      sourceFrom,
      productId,
      productData,
      setProductData = (e) => e,
      setCartLoading,
      saleLoading,
      fetchDefaultAddress,
      // handleAddCompare,
      currentAddress = {},
      setCurrentAddress,
      updateAddress = (e) => e,
      history,
      // setItemInfo,
      dispatch,
      dimensTemplates,
      isNewCart, // 是否启用新购物车
      custDisplay,
      labelList,
    } = props;
    const onCataStock = sourceFrom === 'CATA' && skuCheckFlag; // 目录化商品开启了库存校验
    const offCataStock = sourceFrom === 'CATA' && !skuCheckFlag; // 目录化商品关闭了库存校验
    // const { resData: belongTypeList } = useRequest({
    //   url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
    //   query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
    // });
    const [update, setUpdate] = useState(false);
    // const [configFlag, setConfigFlag] = useState(false);
    const invOrganizationId = invoiceOrgId;
    // const [invOrganizationName, setInvOrganizationName] = useState(invoiceOrgName);
    const purchaseOrgId = initPurOrgId;
    // const [purchaseOrganName, setPurchaseOrganName] = useState(purchaseOrgName);
    const [stockNumber, setStockNumber] = useState(undefined);
    const [stockState, setStockState] = useState(undefined);
    const [deliveryPay, setDeliveryPay] = useState(undefined);
    const [addCartLoading, setAddCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [MinProductNumber, setMinProductNumber] = useState(1);
    const [MaxProductNumber, setMaxProductNumber] = useState(1);
    const [currentPrice, setCurrentPrice] = useState('');
    const [currentPointPrice, setCurrentPointPrice] = useState(productData?.pointPrice);
    // const [Initvisible, setInitvisible] = useState(false);
    const [visible, setVisible] = useState(false);
    // const [sameProduct, setSameProduct] = useState([]);
    // const [lowestPrice, setLowestPrice] = useState();
    const [JDServicesList, setJDServicesList] = useState([]);
    const [selectedJDServicesList, setSelectedJDServicesList] = useState([]);
    const [JDServicesIndex, setJDServicesIndex] = useState(-1);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [budgetList, setBudgetList] = useState([]);
    const [fetchBudgetLoading, setFetchBudgetLoading] = useState(true);
    // const [subInvoice, SetSubInvoice] = useState(undefined);
    // const [subPurchase, SetSubPurchase] = useState(undefined);
    const [budget, setBudget] = useState({});
    const [withoutTaxPrice, setWithoutTaxPrice] = useState();
    const [allocatVisible, setAllocatVisible] = useState(false);
    const [showBuyNow, setShowBuyNow] = useState(false); // 分配信息是否可以立即购买
    const [allocationData, setAllocationData] = useState([]);
    // const [giftLoading, setGiftLoading] = useState(false);

    // const [centralizedFlag, setCentralizedFlag] = useState(false); // 是否开启拼单 影响立即购买
    const {
      id,
      // itemCode, // 物料编码
      supplierCompanyId, // 供应商
      taxIncludedPrice, // 协议价
      minPurchaseQuantity, // 最小采购量
      purchaseQuantityLimit, // 目录化最大购买量
      shelfFlag, // 上下架状态
      saleFlag, // 平台级上下架状态
      cause, // 不可售报文
      checkSaleResult: ecProductCheckVO,
      ladderEnableFlag,
      ladderPriceList: productLadderPrices,
      skuName, // 商品名称
      price, // 新的价格字段
      showSupplierName: supplierCompanyName, // 供应商公司名称
      skuCode, // 商品编号
      thirdSkuCode,
      maxPurchaseQuantity, // 电商单次购买最大购买量
      productSkuAttrDTOS = [],
      stockQuantity = null,
      minPackageQuantity = 1, // 最小包装量
      agreementLineId, // 协议行id
      itemCategoryId, // 物料分类id
      itemCode,
      itemName,
      taxRate,
      uomName,
      catalogId,
      ladderPriceList, // 未含税阶梯价
      benchmarkPrice, // 基准价
      skuRefType,
      uomPrecision,
      itemId,
      categoryId,
      skuTitle,
      defaultPrecision,
      marketPrice, // 市场价
      customFlag,
      agreementBusinessType, // 积分类型
      postageRule, // 运费规则
      installRule, // 安装费规则
      // pointPrice, // 积分价格
      deliveryType, // 配送方式
      productSaleQuantity, // 销量
      supplyTagDesc, // 供应商标签
      currencySymbol, // 币种
      estimatedDeliveryDate, // 电商预计送货接收值
      saleAgreementId,
      warehouseId, // 领用库房id
      warehouseName,
      warehouseAddress,
      productGiftDTO, // 新赠品字段
      customizedProductLineList, // 定制品数据
      receiveFlag,
      centralizedFlag,
      centralizedBetweenDay,
      centralizedTemplateName,
      operationAuth, // 为VIEW时仅浏览
    } = productData;
    const marketingUnit = productSkuAttrDTOS?.filter((item) => item.attrCode === '000000000005');
    // const { dimensionList = [], dimensionTemplate } = dimensTemplates || {};
    const [currentWarehouse, setCurrentWarehouse] = useState({
      warehouseId, // 领用库房id
      warehouseName,
      warehouseAddress,
    });
    // 是否领用
    const isReceive = useMemo(() => receiveFlag === 1, [receiveFlag]);
    const addressRef = useRef();
    const receiveRef = useRef();
    const dimensionList =
      dimensTemplates[isReceive ? 'receivedDimensionList' : 'dimensionList'] || [];
    const dimensionTemplate =
      dimensTemplates[isReceive ? 'receivedDimensionTemplate' : 'dimensionTemplate'] || {};
    const { templateId, templateName } = dimensionTemplate || {};
    const [productInfoLoading, setProductInfoLoading] = useState(false);

    // 京东E卡
    const isJDECard = useMemo(() => sourceFrom === 'JD-V-ECRD', [sourceFrom]); // 是否京东E卡
    const defalutFaceValue = useMemo(() => {
      let defaultValue = null;
      if (isJDECard && similarData.length) {
        const { saleAttrList = [] } = similarData[0] || {};
        if (!saleAttrList?.some((s) => String(s.saleValue) === String(taxIncludedPrice))) {
          defaultValue = taxIncludedPrice;
        }
      }
      return defaultValue;
    }, [similarData, isJDECard, taxIncludedPrice]); // 匹配 其它面值初始值
    const jDEDataSet = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'otherFaceValue',
          type: 'number',
          defaultValue: defalutFaceValue,
          min: 1,
          max: 5000,
          precision: 0,
        },
      ],
      events: {
        update: ({ dataSet: ds, value }) => {
          ds.validate().then((flag) => {
            if (flag && value) {
              // value 为null也通过了 在此限制
              setProductInfoLoading(true);
              getCardByPriceService({ salePrice: value })
                .then((res) => {
                  const url = `${HmallConfig.contextPath}/product-detail?productId=${res.skuId}&sourceFrom=${res.sourceFrom}`;
                  updatePage(url);
                })
                .finally(() => {
                  setProductInfoLoading(false);
                });
            }
          });
        },
      },
    });
    // 刷新当前页面，跳转到指定详情页面
    function updatePage(location) {
      history.push(location);
      window.mallProductDetail = {
        address: currentAddress,
      };
      history.push('/refresh');
    }

    // 购物车动画 + 购物车数量更新
    const callBack = () => {
      flyInit();
      dispatch({
        type: 'global/update',
        payload: { showMiniCart: true },
      });
    };

    function fetchMroBudget() {
      const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cscro-budget-defaults/get`;
      return request(url, { query: { userId, companyId } });
    }

    async function getDefaultBudget() {
      const { tenantNum } = getUserConfigInfo()?.userInfo;
      if (tenantNum === 'SRM-CSCMRO' && !isEmpty(budgetList)) {
        const data = await fetchMroBudget();
        setBudget(data || {});
      }
    }

    useEffect(() => {
      const { tenantNum } = getUserConfigInfo()?.userInfo;
      if (tenantNum === 'SRM-CSCMRO' && !isEmpty(budgetList)) {
        getDefaultBudget();
      }
    }, [budgetList]);

    useEffect(() => {
      CuxFn({
        name: 'addNewCart-fn-setAddress',
        value: {
          itemCode,
          currentAddress,
          addressRef,
          companyId,
          userId,
          setCurrentAddress,
          product: productData,
        },
      })();
    }, []);

    useEffect(() => {
      CuxFn({
        name: 'productDetail-fn-handleProductData',
        value: {
          setProductData,
          productData,
          labelList,
        },
      })();
    }, [labelList]);

    // 地址信息变动带来的联动
    useEffect(() => {
      fetchEcService();
      stockQuery(currentAddress.addressId);
    }, [currentAddress.addressId, currentWarehouse.warehouseId]);

    // 库房变动
    useEffect(() => {
      CuxFn({
        name: 'get-mobile-average-price',
        value: {
          setProductData,
          productData,
          tenantId,
          skuId: sourceFrom === 'CATA' ? skuCode : thirdSkuCode,
          warehouseId: currentWarehouse.warehouseId,
        },
      })();
    }, [currentWarehouse.warehouseId]);

    // 更新数据
    useEffect(() => {
      // const initQuantity = minPurchaseQuantity || 1;
      const [min, max] = getProductLimit({
        sourceFrom,
        minPurchaseQuantity: getMinPurchaseQuantity({
          minPurchaseQuantity,
          isReceive,
          uomPrecision,
        }),
        maxPurchaseQuantity,
        purchaseQuantityLimit,
        stockLimit: stockNumber,
        ladderPriceLimit: productLadderPrices,
        price: taxIncludedPrice,
      });
      setUpdate((n) => !n);
      setMinProductNumber(min);
      setMaxProductNumber(max);
      let currentUnit = taxIncludedPrice !== 0 ? taxIncludedPrice || price : 0;
      if (ladderEnableFlag === 1 && productLadderPrices?.length > 0) {
        productLadderPrices.forEach((item) => {
          const { ladderFrom, ladderTo, taxIncludedPrice: taxPrice } = item;
          if (math.gte(min, ladderFrom) && math.lt(min, ladderTo)) {
            currentUnit = taxPrice;
          }
        });
      }
      setCurrentPrice(currentUnit);
    }, [productData]);

    useEffect(() => {
      if (noTaxDisplayType === 'SHOW') {
        let noPrice = productData.taxExcludedPrice;
        if (ladderPriceList?.length > 0) {
          const { taxExcludedPrice } =
            ladderPriceList.find(
              (n) =>
                math.gte(quantity, n.ladderFrom) &&
                (math.lt(quantity, n.ladderTo) || n.ladderTo === null)
            ) || {};
          noPrice = taxExcludedPrice;
        }
        setWithoutTaxPrice(noPrice);
      }
    }, [quantity, productData.taxExcludedPrice]);

    useEffect(() => {
      if (
        quantity &&
        (quantity > MaxProductNumber || quantity < MinProductNumber) &&
        MaxProductNumber > MinProductNumber
      ) {
        // if (!uomPrecision) {
        timer = setTimeout(() => {
          if (math.gt(quantity, MaxProductNumber)) {
            setQuantity(MaxProductNumber);
          }
          if (math.lt(quantity, MinProductNumber)) {
            setQuantity(MinProductNumber);
          }
          updatePrice();
        }, 1000);
        // }
      }
      updatePrice();
    }, [quantity, update, productData.ladderPriceList, productData.taxIncludedPrice]);

    // 获取预算值集
    useEffect(() => {
      if (budgetSwitch === '1') {
        setFetchBudgetLoading(true);
        fetchBudgetLov()
          .then((res) => {
            if (res) {
              setBudgetList(res);
            }
          })
          .finally(() => {
            setFetchBudgetLoading(false);
          });
      }
    }, [budgetSwitch]);

    /**
     * 加购按钮是否可点击
     */
    const getAddCartBtnStatus = useMemo(() => {
      const { setStockEnough } = props;
      const flag =
        (ecProductCheckVO && !ecProductCheckVO.saleState) ||
        stockState === 5 ||
        shelfFlag !== 1 ||
        saleFlag !== 1 ||
        stockNumber === undefined;
      setStockEnough(!flag);
      return flag;
    });

    function updatePrice() {
      if (ladderEnableFlag === 1 && ladderPriceList?.length > 0) {
        if (
          ladderPriceList[ladderPriceList.length - 1]?.ladderTo !== null &&
          quantity >= ladderPriceList[ladderPriceList.length - 1]?.ladderTo
        ) {
          setQuantity(ladderPriceList[ladderPriceList.length - 1]?.ladderTo - 1);
          setCurrentPrice(ladderPriceList[ladderPriceList.length - 1].taxIncludedPrice);
          setCurrentPointPrice(ladderPriceList[ladderPriceList.length - 1].pointPrice);
        } else {
          ladderPriceList.forEach((item) => {
            const { ladderFrom, ladderTo, taxIncludedPrice: salePrice } = item;
            if (
              !ladderTo ? quantity >= ladderFrom : quantity >= ladderFrom && quantity < ladderTo
            ) {
              setCurrentPrice(salePrice);
              setCurrentPointPrice(item?.pointPrice);
            }
          });
        }
      }
    }

    function fetchEcService() {
      const { addressId, regionCodeList = [], fullAddress } = currentAddress;
      const params = addressId
        ? {
            provinceId: regionCodeList?.[0],
            cityId: regionCodeList?.[1],
            countyId: regionCodeList?.[2],
            address: fullAddress,
          }
        : addressInfo;
      if (sourceFrom !== 'CATA') {
        setServiceLoading(true);
        queryExtensionIns({
          ...params,
          tenantId: organizationId,
          supplierCode: sourceFrom,
          skuId: thirdSkuCode,
        })
          .then((res) => {
            if (res.success) {
              const { result = [] } = res;
              setJDServicesList(initJDServicesList(result || []));
            } else {
              Swal(res.resultMsg);
            }
          })
          .finally(() => {
            setServiceLoading(false);
          });
      }
    }

    // 把延保服务全部初始化为未选中
    function initJDServicesList(list = []) {
      const selectedList = [];
      const newList = list.map((service) => {
        return {
          ...service,
          productServiceDetailList: service.productServiceDetailList.map((sku) => {
            const newSku = {
              ...sku,
              checked: false,
            };
            selectedList.push(newSku);
            return newSku;
          }),
        };
      });
      setSelectedJDServicesList(selectedList);
      return newList;
    }

    /**
     * 查询商品库存
     * @param {Number} addressId - 地址 id
     */
    const stockQuery = (addressId) => {
      // if (ecPlatform && addressId) {
      // if (addressId) {
      setAddCartLoading(true);
      setCartLoading(true);
      const queryParams = { addressId, platformCode: sourceFrom };
      const { regionCodeList = [], fullAddress } = currentAddress;
      const addressPara = {
        provinceId: regionCodeList?.[0],
        cityId: regionCodeList?.[1],
        countyId: regionCodeList?.[2],
        address: fullAddress,
      };
      Promise.all([
        queryStock(queryParams, {
          tenantId: organizationId,
          inventoryId: isReceive ? currentWarehouse.warehouseId : null,
          stockType: isReceive ? 'RECEIVE' : 'SALE',
          batchSkuIds: [
            {
              skuId: sourceFrom === 'CATA' ? skuCode : thirdSkuCode,
              supplierCode: sourceFrom,
              categoryId,
            },
          ],
          ...addressPara,
        }),
      ])
        .then((res) => {
          const stockData = res[0].result || [];
          const payData = res[1] || {};
          setStockNumber(stockData[0]?.skuStock);
          setStockState(stockData[0]?.stockState);
          setProductData((data) => ({
            ...data,
            skuStock: stockData[0]?.skuStock || '-',
            stockState: stockData[0]?.stockState,
          }));
          if (
            stockData[0]?.stockState === 1 &&
            stockData[0]?.skuStock > 0 &&
            stockData[0]?.skuStock <= 50
          ) {
            const [, max] = getProductLimit({
              sourceFrom,
              minPurchaseQuantity,
              maxPurchaseQuantity,
              purchaseQuantityLimit,
              stockLimit: stockData[0]?.skuStock,
              ladderPriceLimit: productLadderPrices,
              price: taxIncludedPrice,
            });
            setMaxProductNumber(max);
          }
          if (!payData.code) {
            setDeliveryPay(payData.result);
          }
        })
        .finally(() => {
          setAddCartLoading(false);
          setCartLoading(false);
        });
      // }
    };

    const openAddress = () => {
      CuxFn({
        name: 'addNewCart-fn-setAddress',
        value: {
          itemCode,
          currentAddress,
          addressRef,
          companyId,
          userId,
          setCurrentAddress,
          product: productData,
        },
      })();
      addressRef.current.element.element.click();
    };

    const openReceive = () => {
      receiveRef.current.element.element.click();
    };

    function chooseAddress(values) {
      const {
        addressId,
        regionIdList = [],
        regionCodeList = [],
        invOrganizationId: _invId,
        inventoryCode,
        inventoryId,
        inventoryName,
        ...other
      } = values || {};
      const _currentAddress = {
        ...other,
        addressId,
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
        // setInitvisible(false);
      } else {
        updateAddress(_currentAddress); // 地址变更后操作
        setStockNumber(undefined);
        // setInitvisible(false);
      }
    }

    const step = minPackageQuantity || 1;

    function minus() {
      let num = math.minus(quantity, step);
      num = math.lt(num, MinProductNumber) ? MinProductNumber : num;
      setQuantity(isNaN(num) ? MinProductNumber : num);
    }

    function add() {
      let num = math.plus(quantity, step);
      num = math.gte(num, MaxProductNumber) ? MaxProductNumber : num;
      setQuantity(isNaN(num) ? MinProductNumber : num);
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
          val = DEFAULT_MAX;
          setUpdate((prev) => !prev);
        }
        setQuantity(+val > MaxProductNumber ? MaxProductNumber : +val);
      } else if (val === '') {
        setQuantity('');
      }
    }

    function checkVal(e) {
      const val = e.target.value;
      if (val === '' || isNaN(+val) || math.lt(val, minPurchaseQuantity || MinProductNumber)) {
        setQuantity(minPurchaseQuantity || MinProductNumber);
      }
    }

    function flyInit() {
      const fly = new Fly({
        startEle: document.querySelector(`#product-add`),
        endEle: document.querySelector('#miniCart'),
        imgUrl: productData?.productImageList?.find((p) => p.type === 'IMAGE')?.imagePath,
      });
      fly.init();
    }

    function validateToCart(type = 'addCart') {
      if (quantity === '' || isNaN(quantity)) {
        setQuantity(minPurchaseQuantity || MinProductNumber);
        return;
      }
      if (math.gt(quantity, MaxProductNumber)) {
        Swal(
          intl
            .get('mallf.productDetail.view.maxProductNumber.warning', {
              value: MaxProductNumber,
            })
            .d(`最大采购量为${MaxProductNumber}`)
        );
        return;
      } else if (math.lt(quantity, MinProductNumber)) {
        Swal(
          intl
            .get('mallf.productDetail.view.minProductNumber.warning', {
              value: MinProductNumber,
            })
            .d(`最小采购量为${MinProductNumber}`)
        );
        return;
      }
      // let budgetFlag = true;
      // 加入购物车之前sku校验
      const isAdd = []; // 存储每一个规格是否选择
      if (!isJDECard) {
        // 京东E卡因推荐面值 可不选择
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
      }
      if (
        calcValidatePack(uomPrecision, minPackageQuantity) &&
        !math.eq(math.mod(quantity, minPackageQuantity || 1), 0)
      ) {
        Swal(
          intl
            .get('mallf.productDetail.view.minPackageQuantity.warning', {
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

    // 立即购买失败回调
    function buyNowErrorBack(res) {
      const { errorMessage, necessaryError, cartHeaderDTOList } = res.cartList?.[0] || {};
      // 立即购买必填为空，前端提示
      if (necessaryError === 1) {
        setShowBuyNow(true);
        setAllocatVisible(true);
        setAllocationData(cartHeaderDTOList);
        return;
      }
      CuxFn({
        name: 'NewProdutDetail-fn-buyNowErrorBack',
        value: { res },
      })(() => Swal(errorMessage))();
    }

    // 新购物车加购
    async function addNewCart(type) {
      if (isEmpty(dimensionTemplate)) {
        Swal(
          intl
            .get('mallf.common.view.noDimensTemplates')
            .d('当前采买组织下不存在已发布的购物车模板')
        );
        setAddCartLoading(false);
        setCartLoading(false);
        return;
      }
      // 头固定列
      const headerDimension =
        dimensionList?.filter((n) =>
          ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType)
        ) || [];
      const _HEADER_FIXED = getHeaderFixedDimension({
        currentAddress,
        currentWarehouse,
        product: productData,
      });
      // 头维度
      let headerList = headerDimension.map((n) => {
        return {
          ...n.dimension,
          headerNum: 1,
          tenantId: organizationId,
          ..._HEADER_FIXED[n.dimension.dimensionCode],
        };
      });
      headerList = CuxFn({
        name: 'productDetail-fn-cuxHeaderList',
        value: {
          dimensionList,
          headerList,
          organizationId,
          product: productData,
        },
      })(() => headerList)();
      // 行维度
      const cartLineList = dimensionList?.filter((n) => n.dimension.dimensionCode === 'quantity');
      const params = getCartParams(
        {
          templateId,
          unitId,
          unitName,
          supplierCompanyId,
          productId,
          itemCode,
          productSource: sourceFrom,
          tenantId: organizationId,
          ownerId: userId,
          companyId,
          cartSource: 'DETAIL',
          openCartFlag: getOpenCartFlag() ? 1 : 0,
          saleAgreementId,
          receiveFlag: isReceive ? 1 : 0,
          searchUuid: qs.parse(props.location.search.substr(1))?.searchUuid,
          cartHeaderDTOList: [
            {
              headerList,
              cartLineList: cartLineList.map((n) => {
                return {
                  // lineNum: 1,
                  lineList: [
                    {
                      ...n.dimension,
                      tenantId: organizationId,
                      headerNum: 1,
                      lineNum: 1,
                      value: quantity,
                    },
                  ],
                };
              }),
            },
          ],
          customizedProductLineList,
        },
        { price: currentPrice, labelList }
      );
      if (type === 'buyNow') {
        if (getOpenCartFlag(productData?.linkType)) {
          openCartBuyNowService(params)
            .then((res) => {
              if (res) {
                const successCallBack = (resp) => {
                  if (resp.success) {
                    props.history.push({
                      pathname: '/req-open-cart',
                      orderData: {
                        ...resp,
                        emptyCheckedFlag: 1,
                      },
                    });
                  } else {
                    buyNowErrorBack(resp);
                  }
                };

                const result = openGoToLowestSkuModal({
                  res,
                  onOk: () => {
                    params.confirmFlag = 1;
                    openCartBuyNowService(params).then((resp) => {
                      if (resp) {
                        successCallBack(resp);
                      }
                    });
                  },
                });

                if (result === 'NoRule') {
                  successCallBack(res);
                }
              }
            })
            .finally(() => {
              setAddCartLoading(false);
              setCartLoading(false);
            });
          return;
        }
        newBuyNowService(params)
          .then((res) => {
            if (res) {
              const successCallBack = (resp) => {
                if (resp?.success === 1) {
                  const orderData = resp.orderList.map((order) => {
                    const {
                      orderInfo,
                      orderLineList,
                      orderPriceInfo,
                      orderInvoiceInfo,
                      orderExtraInfo,
                    } = order;
                    const shoppingCartDTOList = orderLineList.map((line) => {
                      const { orderLinePrice, orderLineValue, orderLineProduct } = line;
                      const { skuSrmInfo, productAttributeDTOList } = orderLineProduct || {};
                      return {
                        ...orderLineValue,
                        ...(skuSrmInfo || {}),
                        ...orderLinePrice,
                        productAttributeDTOList,
                        // dataType: orderLineValue?.dataType,
                        // quantity: orderLineValue?.quantity,
                        // remark: orderLineValue.remark,
                        // neededDate: orderLineValue.neededDate,
                      };
                    });
                    return {
                      ...(orderExtraInfo || {}),
                      ...orderInfo,
                      ...orderPriceInfo,
                      ...orderInvoiceInfo,
                      shoppingCartDTOList,
                    };
                  });

                  const gotoBuyNow = CuxFn({
                    name: 'ProductDetail-fn-gotoNewBuyNow',
                    value: {
                      resp,
                      history,
                      orderData,
                    },
                  })(() => {
                    props.history.push({
                      pathname: '/before-order',
                      data: { orderData, preData: resp.orderList },
                    });
                  });

                  gotoBuyNow();
                } else {
                  buyNowErrorBack(resp);
                }
              };

              const result = openGoToLowestSkuModal({
                res,
                params,
                onOk: () => {
                  params.confirmFlag = 1;
                  newBuyNowService(params).then((resp) => {
                    if (resp) {
                      successCallBack(resp);
                    }
                  });
                },
              });

              if (result === 'NoRule') {
                successCallBack(res);
              }
            }
          })
          .finally(() => {
            setAddCartLoading(false);
            setCartLoading(false);
          });
      } else {
        const newParams = await CuxFn({
          name: 'productDetail-fn-addNewCart',
          value: { params },
        })(() => params)();
        if (isEmpty(newParams)) {
          setAddCartLoading(false);
          setCartLoading(false);
          return;
        }
        addNewCartService(newParams)
          .then((res) => {
            if (res?.reWarehouseFlag === 1) {
              Swal(
                intl
                  .get('mallf.productDetail.view.reWarehouseFlag')
                  .d('库房信息已变更，请重新维护领用库房信息')
              );
              return;
            }

            if (res) {
              if (res?.lowestPriceRule) {
                openGoToLowestSkuModal({
                  res,
                  params,
                  onOk: () => {
                    setCartLoading(true);
                    params.confirmFlag = 1;
                    addNewCartService(params).then((resp) => {
                      if (resp) {
                        setCartLoading(false);
                        flyInit();
                        dispatch({
                          type: 'global/update',
                          payload: { showMiniCart: true },
                        });
                      }
                    });
                  },
                });
              } else {
                flyInit();
                dispatch({
                  type: 'global/update',
                  payload: { showMiniCart: true },
                });
              }
            }
          })
          .finally(() => {
            setAddCartLoading(false);
            setCartLoading(false);
          });
      }
    }

    function addOrBuyNowCart(type) {
      const { addressId } = currentAddress || {};
      if (!userId) {
        accessIsLogin();
        return;
      }
      // 校验地址和库存组织是否选择
      if ((addressId || isReceive) && !addCartLoading) {
        if (!invOrganizationId && !isNewCart) {
          Swal(
            intl
              .get(`mallf.productDetail.view.choseInventoryOrg`)
              .d('当前组织未关联库存组织，请联系管理员')
          );
          return;
        }

        if (!purchaseOrgId && !isNewCart) {
          Swal(
            intl
              .get(`mallf.productDetail.view.plsChosePurchaseOrg`)
              .d('当前组织未关联采购组织，请联系管理员')
          );
          return;
        }
        const addCartAccess =
          stockNumber !== 0 ||
          stockState === 4 ||
          stockState === 6 ||
          stockState === 2 ||
          stockState === 3;
        const newJDServicesList = [];
        JDServicesList.forEach((service) => {
          const { categoryCode } = service;
          service.productServiceDetailList.forEach((sku) => {
            const { productId: jdServiceId, price: servicePrice, checked } = sku;
            // 被选中的服务当成商品加入购物车
            if (checked) {
              newJDServicesList.push({
                serviceCategoryCode: categoryCode,
                skuType: 3,
                mainSkuId: id || productId, // 该主商品的id
                productId: jdServiceId, // 该服务的id
                addressId,
                ladderEnableFlag,
                purchaseType,
                quantity,
                minPurchaseQuantity,
                invOrganizationId:
                  (currentAddress && currentAddress.invOrganizationId) || invOrganizationId,
                purOrganizationId: purchaseOrgId,
                productSource: sourceFrom,
                tenantId: organizationId,
                unitPrice: servicePrice,
                latestPrice: servicePrice,
                supplierCompanyId,
                supplierCompanyName,
                skuCode,
                companyId,
                ownerId: userId,
              });
            }
          });
        });
        const params = {
          addressId,
          ladderEnableFlag,
          purchaseType,
          quantity,
          minPurchaseQuantity,
          invOrganizationId:
            (currentAddress && currentAddress.invOrganizationId) || invOrganizationId,
          purOrganizationId: purchaseOrgId,
          productId: id || productId,
          productSource: sourceFrom,
          tenantId: organizationId,
          unitPrice: currentPrice,
          latestPrice: currentPrice,
          supplierCompanyId,
          supplierCompanyName,
          skuType: 0,
          skuCode,
          seSkuList: [...newJDServicesList],
          levelPath: getUserConfigInfo().levelPath,
          unitId,
          customizedProductLineList: customFlag === 1 ? customizedProductLineList : [],
          cartSource: 'DETAIL',
          openCartFlag: getOpenCartFlag() ? 1 : 0,
          searchUuid: qs.parse(props.location.search.substr(1))?.searchUuid,
        };
        if (!isEmpty(budget)) {
          params.budget = JSON.stringify(budget);
        }
        if (addCartAccess) {
          // checkCompareRule(params.productId).then((res) => {
          //   if (res) {
          setAddCartLoading(true);
          setCartLoading(true);
          if (isNewCart) {
            addNewCart(type);
            return;
          }
          if (type === 'buyNow') {
            const { regionIdList = [], inventoryCode, inventoryId, inventoryName } = currentAddress;
            const newParams = {
              ...params,
              minPackageQuantity,
              totalPrice: isNaN(+currentPrice)
                ? currentPrice
                : Number(new Big(currentPrice).mul(quantity)),
              latestPrice: currentPrice,
              agreementLineId, // 协议行id
              benchmarkPrice, // 基准价
              skuRefType,
              currencyCode: productSkuAttrDTOS?.find((item) => item.attrCode === '000000000009')
                ?.attrValId, // 币种
              currencyName: productSkuAttrDTOS?.find((item) => item.attrCode === '000000000009')
                ?.description,
              itemCategoryId,
              itemCode,
              itemName,
              stockQuantity,
              taxRate,
              uomName,
              catalogId,
              secondRegionId: regionIdList[1] || null,
              customizedProductLineList: customFlag === 1 ? customizedProductLineList : [],
              cpQuantity: quantity,
              agreementBusinessType,
              inventoryCode,
              inventoryId,
              inventoryName,
            };
            if (!isEmpty(budget)) {
              newParams.budgetInfoList = [
                {
                  budget: JSON.stringify(budget),
                  quantity,
                },
              ];
            }
            const gotoBuyNow = CuxFn({
              name: 'ProductDetail-fn-gotoBuyNow',
              value: {
                newParams,
                setAddCartLoading,
                setCartLoading,
                history,
              },
            })(() => {
              buyNowService(newParams)
                .then((resp) => {
                  if (resp) {
                    props.history.push({
                      pathname: '/before-company-order',
                      data: { orderData: resp },
                    });
                  }
                })
                .finally(() => {
                  setAddCartLoading(false);
                  setCartLoading(false);
                });
            });
            gotoBuyNow(newParams);
          } else {
            addCartService(params)
              .then((resp) => {
                const { needInsertCustomized, cartId, latestPrice } = resp;
                // 保存定制品
                if (needInsertCustomized && !isEmpty(customizedProductLineList)) {
                  // 需要绑定cartId
                  const param = [
                    {
                      ...customizedProductLineList?.[0],
                      latestPrice,
                      cpQuantity: quantity,
                      cartId,
                    },
                  ];
                  saveCustom(param);
                }
                updateBudget([
                  {
                    ...resp,
                    budgetInfoList: [
                      {
                        // 水滴筹会有预算，标准默认传'{}'
                        budget: !isEmpty(budget) ? JSON.stringify(budget) : '{}',
                        quantity,
                      },
                    ],
                  },
                ]).then(() => {
                  flyInit();
                  dispatch({
                    type: 'global/update',
                    payload: { showMiniCart: true },
                  });
                });
              })
              .finally(() => {
                setAddCartLoading(false);
                setCartLoading(false);
              });
          }
          // 加入购物车请求
        } else {
          Swal(
            intl.get(`mallf.productDetail.view.noStockCannotCart`).d('库存不足，无法加入购物车')
          );
        }
      } else if (!addressId && !isReceive) {
        Swal(intl.get(`mallf.productDetail.view.chooseAddress`).d('请选择地址'));
      }
    }

    // 选中延保服务
    function chooseYanBao(params = {}) {
      const { categoryCode, skuId, index } = params;
      const newList = JDServicesList.map((service) => {
        const serviceFlag = service.categoryCode === categoryCode;
        return serviceFlag
          ? {
              ...service,
              productServiceDetailList: service.productServiceDetailList.map((sku) => {
                const skuFlag = sku.skuId === skuId;
                const value = !sku.checked;
                const currentSku = service.productServiceDetailList[0];
                const updateSku =
                  sku.skuId === skuId ? { ...sku, checked: value } : { ...sku, checked: false }; // 一个服务下只允许选择一项
                if (skuFlag) {
                  selectedJDServicesList[index] = value
                    ? updateSku
                    : { ...currentSku, checked: false };
                }
                return updateSku;
              }),
            }
          : { ...service };
      });
      setJDServicesIndex(-1);
      setJDServicesList(newList);
      setSelectedJDServicesList(selectedJDServicesList);
    }

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
      // const descSuffix =
      //   [1, 7, 8].includes(currentStock) && estimatedDeliveryDate
      //     ? `，${estimatedDeliveryDate}`
      //     : '';
      const descSuffix = CuxFn({
        name: 'ProductInfo-fn-setCurrentStockInfo',
        value: {
          currentStock,
          estimatedDeliveryDate,
        },
      })(() =>
        [1, 7, 8].includes(currentStock) && estimatedDeliveryDate
          ? `，${estimatedDeliveryDate}`
          : ''
      )();
      return `${stockMessage}${descSuffix}`;
    }

    // 定制品保存
    function handleCustomOk(params) {
      if (sourceFrom !== 'CATA') {
        const { regionId, addressId } = currentAddress || {};
        const { customizedProductValueList } = params?.[0];
        const newParams = {
          levelPath,
          regionId,
          addressId,
          productId,
          companyId,
          customFlag,
          customizedProductValueDTOList: customizedProductValueList.reduce((pre, curr) => {
            if (curr.shipperFlag) {
              const { componentName, cpValue, unitCoefficient } = curr || {};
              pre.push({
                attrName: componentName,
                attrValue: cpValue,
                unitCoefficient,
              });
            }
            return pre;
          }, []),
        };
        ecCustomizedPriceService(newParams).then((res) => {
          if (res) {
            setProductData({
              ...productData,
              customizedProductLineList: params,
              taxIncludedPrice: res.taxIncludedPrice,
              taxExcludedPrice: res.taxExcludedPrice,
              ladderPriceList: res.ladderPriceList,
            });
          }
        });
      } else {
        setProductData((data) => ({
          ...data,
          customizedProductLineList: params,
        }));
      }
    }

    // 商品品牌+商品广义分类+商品型号+商品关键属性信息
    // const name = ecProductName || cataProductName;
    if (skuName) document.title = skuName;
    // const productNum = ecProductNum || cataProductNum;
    const priceProps = {
      currentPrice,
      sourceFrom,
      marketingUnit,
      marketPrice,
      productId,
      noTaxDisplayType,
      defaultPrecision,
      pointPrice: currentPointPrice,
      uomName,
      currencySymbol,
    };
    // const { ecPlatFromName } = HmallOptions();
    const showLadderPrices = !!ladderEnableFlag && productLadderPrices?.length > 0;
    const addCartDisabled = useMemo(() => {
      return (
        (isReceive && !currentWarehouse.warehouseId) ||
        [shelfFlag, saleFlag].some((flag) => flag !== 1) ||
        getAddCartBtnStatus ||
        isNewCart === undefined ||
        operationAuth === 'VIEW'
      );
    }, [
      isReceive,
      currentWarehouse,
      shelfFlag,
      saleFlag,
      onCataStock,
      sourceFrom,
      getAddCartBtnStatus,
      isNewCart,
      operationAuth,
    ]);

    const budgetInfoProps = {
      budgetList,
      productData,
      productSkuAttrDTOS,
      setBudget,
    };
    const buyNowProps = {
      budgetList,
      fetchBudgetLoading,
      hideFieldList,
      addCartLoading,
      saleLoading,
      validateToCart,
      addCartDisabled,
      disabled: onCataStock && stockNumber < quantity,
      product: productData,
      centralizedFlag: isReceive ? 0 : centralizedFlag, // 是否开启拼单配置
    };
    // 定制品
    const customProps = {
      product: productData,
      showCustomItem: false,
      openMoadlIcon: (
        <a className="custom-edit-button">
          {intl.get('mallf.productDetail.model.update').d('修改')}
        </a>
      ),
      onCustomOk: handleCustomOk,
    };
    return (
      <Spin spinning={productInfoLoading}>
        <div className={styles['product-detail-content']}>
          {centralizedTemplateName && !isReceive && (
            <div className="product-centralize-template">
              <C7nIcon type="stars" />
              <span className="centralize-template-name text-overflow" r-title>
                {centralizedTemplateName}
              </span>
              {typeof centralizedBetweenDay === 'number' && (
                <span className="centralize-template-date">
                  （
                  {intl
                    .get('mallf.productDetail.model.endDate', {
                      value: centralizedBetweenDay,
                    })
                    .d(`${centralizedBetweenDay}天后结束`)}
                  ）
                </span>
              )}
            </div>
          )}
          <div className="product-title">
            <div style={{ flex: 1 }}>
              <p className="p-name" title={skuName}>
                <SupplierComponent>
                  {sourceFrom !== 'CATA' && supplyTagDesc && (
                    // <span className="platform-jd">{ecPlatFromName[sourceFrom]}</span>
                    <span className="platform-jd">{supplyTagDesc}</span>
                  )}
                </SupplierComponent>
                {skuName}
              </p>
              <p className="p-small-name">{skuTitle || ''}</p>
            </div>
            <SaleQuality productSaleQuantity={productSaleQuantity} skuId={id || productId} />
          </div>
          {custDisplay(
            {
              code: code3,
              dataSource: productData,
              missFields: [
                'price',
                'rangePrice',
                'productGift',
                'productLabel',
                'receiveInfo',
                'addressInfo',
                'arriveDate',
                'postageRule',
                'installRule',
                'jDServices',
                'productNoTax',
                'receiverPhone',
                'jDECardInfo',
              ],
            },
            <>
              {/* 用于个性化custDisplay复制模板,在没有child可复制时，个性化不生效(getChild方法里面会return null) */}
              <div className="product-attr">
                <div
                  className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
                    getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
                  }`}
                >
                  label
                </div>
                <div className="p-content">content</div>
              </div>
              {!showLadderPrices && (
                <Price data-field="price" {...{ ...priceProps, showLadderPrices, isReceive }} />
              )}
              {showLadderPrices && (
                <RangePrice
                  data-field="rangePrice"
                  {...priceProps}
                  productLadderPrices={ladderPriceList}
                  setQuantity={setQuantity}
                  quantity={quantity}
                />
              )}
              {noTaxDisplayType === 'SHOW' && (
                <div data-field="productNoTax" className="product-attr">
                  <div
                    className={`p-label ${
                      getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''
                    } ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''}`}
                    r-title
                  >
                    {intl.get(`mallf.productDetail.view.productNoTax`).d('未税单价')}
                  </div>
                  <div className="p-content withoutTaxPrice">
                    <span className="currencySymbol">{currencySymbol || ''}</span>
                    {priceNumberRender(withoutTaxPrice, defaultPrecision) || '-'}
                  </div>
                </div>
              )}

              {/* 赠品 / 附件 */}
              {!isEmpty(productGiftDTO) ? (
                <div data-field="productGift" className="product-attr">
                  <div
                    r-title
                    className={`p-label ${
                      getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''
                    } ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''}`}
                  >
                    {intl.get('mallf.productDetail.view.salesPromotion').d('促销活动')}
                  </div>
                  <div className="p-content">
                    {sourceFrom === 'CATA' ? (
                      getCataGiftLabels(productGiftDTO)
                    ) : (
                      /* 电商 赠品 / 附件 聚合 */
                      <>
                        {productGiftDTO?.giftVOList?.some((gift) => gift?.giftType === 2) ? (
                          <ActivityLabel productGiftDTO={productGiftDTO} giftType={2} />
                        ) : null}
                        {productGiftDTO?.giftVOList?.some((gift) => gift?.giftType === 1) ? (
                          <ActivityLabel productGiftDTO={productGiftDTO} giftType={1} />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {(!isEmpty(labelList) ||
                agreementBusinessType === 'POINTS' ||
                deliveryType === 1) && (
                <div data-field="productLabel" className="product-attr">
                  <div
                    className={`p-label ${
                      getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''
                    } ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''}`}
                    title={intl.get(`mallf.productDetail.view.label`).d('标签')}
                  >
                    {intl.get(`mallf.productDetail.view.label`).d('标签')}
                  </div>
                  <div className="p-content">
                    {/* {deliveryType === 1 && <LabelPreview code="JDSEND" />} */}
                    {agreementBusinessType === 'POINTS' && (
                      <LabelPreview
                        cursor="grab"
                        code="E"
                        value={intl.get('mallf.productDetail.view.sigl.product').d('积分商品')}
                      />
                    )}
                    {labelList?.map((n) => (
                      <LabelPreview
                        maxWidth={330}
                        cursor="grab"
                        code={n.labelColorCode}
                        value={n.labelName}
                      />
                    ))}
                  </div>
                </div>
              )}
              {isReceive && (
                <ReceiveInfo
                  data-field="receiveInfo"
                  product={productData}
                  currentWarehouse={currentWarehouse}
                  openReceive={openReceive}
                />
              )}
              {!isJDECard && !isReceive && (
                <AddressInfo
                  data-field="addressInfo"
                  product={productData}
                  fetchDefaultAddress={fetchDefaultAddress}
                  currentAddress={currentAddress}
                  openAddress={openAddress}
                />
              )}
              <ReceiverPhone
                r-if={isJDECard && currentAddress?.addressId}
                data-field="receiverPhone"
                currentAddress={currentAddress}
                openAddress={openAddress}
              />
              {/* 取消cata对spec的控制 */}
              <div
                data-field="spec"
                className="product-attr"
                style={{ paddingBottom: similarData.length > 0 ? 5 : 0 }}
              >
                <Spec
                  currentAddress={currentAddress}
                  data={similarData}
                  sourceFrom={sourceFrom}
                  productId={productId}
                />
              </div>
              {useMemo(() => {
                return (
                  <JDECardInfo r-if={isJDECard} data-field="jDECardInfo" dataSet={jDEDataSet} />
                );
              }, [isJDECard])}
              <BudgetInfo data-field="budgetInfo" {...budgetInfoProps} />
              {postageRule && (
                <div data-field="postageRule" className="product-attr">
                  <div
                    className={`p-label ${
                      getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''
                    } ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''}`}
                    r-title
                  >
                    {intl.get('mallf.productDetail.common.view.rule').d('运费规则')}
                  </div>
                  <div className="p-content postage-rule">
                    <span>{postageRule}</span>
                  </div>
                </div>
              )}
              <div data-field="installRule" r-if={installRule} className="product-attr">
                <div
                  className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
                    getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
                  }`}
                  r-title
                >
                  {intl.get('mallf.productDetail.common.view.install.rule').d('安装费规则')}
                </div>
                <div className="p-content">
                  <span>{installRule}</span>
                </div>
              </div>
              <CustomInfo data-field="customInfo" {...customProps} />
              <Allocation
                data-field="allocation"
                isNewCart={isNewCart}
                templateName={templateName}
                setAllocatVisible={setAllocatVisible}
                setShowBuyNow={setShowBuyNow}
                product={productData}
                disabled={isReceive && addCartDisabled}
              />
              {JDServicesList.length > 0 && (
                <div data-field="jDServices" className="jd-services-wrap">
                  <div
                    className={`p-label ${
                      getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''
                    } ${getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''}`}
                    r-title
                  >
                    {intl.get(`mallf.productDetail.view.JDServices`).d('京东服务')}
                  </div>
                  <Spin spinning={serviceLoading}>
                    <div className="jd-services-container">
                      {JDServicesList.map((JDServices, servicesIndex) => {
                        const { categoryCode, imgUrl } = JDServices;
                        const { skuName: bindSkuName, price: servicePrice, checked = false } =
                          selectedJDServicesList[servicesIndex] || {};
                        const servicesFlag = servicesIndex === JDServicesIndex;
                        const firstRow =
                          servicesIndex === 0 || servicesIndex === 1 || servicesIndex === 2;
                        return (
                          <li
                            key={categoryCode}
                            className={`jd-services${firstRow ? '' : ' more-rows'}`}
                            onMouseLeave={() => setJDServicesIndex(-1)}
                          >
                            <div
                              className={`jd-selected-sku${checked ? ' selected-sku-style' : ''}`}
                              onMouseEnter={() => setJDServicesIndex(servicesIndex)}
                            >
                              <Image value={HmallConfig.prefixImgUrl + imgUrl} />
                              <span className="jd-selected-sku-text">{`${bindSkuName}${servicePrice}`}</span>
                              <Icon
                                className="jd-sku-icon-toggle"
                                type={servicesFlag ? 'up' : 'down'}
                              />
                              {checked && <Icon type="check" className="selected-sku-checked" />}
                            </div>
                            {servicesFlag && (
                              <div
                                className="jd-sku-container"
                                onMouseLeave={() => setJDServicesIndex(-1)}
                              >
                                {JDServices.productServiceDetailList.map((sku) => (
                                  <li
                                    key={sku.skuId}
                                    onClick={() =>
                                      chooseYanBao({
                                        categoryCode,
                                        skuId: sku.skuId,
                                        index: servicesIndex,
                                      })
                                    }
                                  >
                                    <p className="jd-sku-title">
                                      <Checkbox checked={sku.checked} />
                                      <span>{`${sku.skuName} ${sku.price}`}</span>
                                      <span className="jd-sku-tip">{sku.instructions}</span>
                                    </p>
                                  </li>
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </div>
                  </Spin>
                </div>
              )}
              <AddCart
                data-field="addCart"
                labelList={labelList}
                quantity={quantity}
                MaxProductNumber={MaxProductNumber}
                MinProductNumber={MinProductNumber}
                changeVal={changeVal}
                minus={minus}
                add={add}
                uomPrecision={uomPrecision}
                checkVal={checkVal}
                addCartLoading={addCartLoading}
                addCartDisabled={addCartDisabled}
                saleLoading={saleLoading}
                validateToCart={validateToCart}
                isReceive={isReceive}
                buyNowProps={buyNowProps}
                currentWarehouse={currentWarehouse}
                openReceive={openReceive}
                sourceFrom={sourceFrom}
                stockNumber={stockNumber}
                currentAddress={currentAddress}
                renderCurrentStockInfo={renderCurrentStockInfo}
                openAddress={openAddress}
                estimatedDeliveryDate={estimatedDeliveryDate}
                cause={cause}
                saleFlag={saleFlag}
                ecProductCheckVO={ecProductCheckVO}
                offCataStock={offCataStock}
                stockQuantity={stockQuantity}
                onCataStock={onCataStock}
                stockState={stockState}
                itemCode={itemCode}
                productId={productId}
                setProductData={setProductData}
                itemId={itemId}
                currentPrice={currentPrice}
                operationAuth={operationAuth}
              />
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
                          {intl
                            .get(`mallf.productDetail.view.is7ToReturn`)
                            .d('支持 7 天无理由退货')}
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
            </>
          )}
          {allocatVisible && (
            <AllocationModal
              visible={allocatVisible}
              setVisible={setAllocatVisible}
              noFetchFlag
              defaultFlag
              showBuyNow={showBuyNow}
              callBack={callBack}
              dimensTemplates={{ dimensionList, dimensionTemplate }}
              product={{
                ...productData,
                sourceFrom,
                stockNumber,
                onCataStock,
                receiveFlag: isReceive ? 1 : 0,
                quantity,
                labelList,
              }}
              title={productData.skuName}
              allocationData={allocationData}
              history={props.history}
              currentWarehouse={currentWarehouse}
              currentAddress={currentAddress}
              searchUuid={qs.parse(props.location.search.substr(1))?.searchUuid}
            />
          )}
          <AddressLov
            mode="button"
            className="address-lov"
            clearButton={false}
            onRef={(ref) => {
              addressRef.current = ref;
            }}
            onChange={chooseAddress}
            lovPara={{ companyId, userId }}
          />
          <ReceiveLov
            mode="button"
            className="address-lov"
            clearButton={false}
            onRef={receiveRef}
            onChange={(data) =>
              setCurrentWarehouse({
                ...data,
                warehouseId: data.inventoryId,
                warehouseName: data.inventoryName,
                warehouseAddress: data.address,
              })
            }
            lovPara={{ agreementHeaderId: saleAgreementId, tenantId, skuId: productId }}
          />
          {visible && (
            <AddressModal
              setDefault
              initAddress={{}}
              visible={visible}
              onCancel={() => setVisible(false)}
              setVisible={setVisible}
              onSuccess={fetchDefaultAddress}
            />
          )}
        </div>
      </Spin>
    );
  })
);
