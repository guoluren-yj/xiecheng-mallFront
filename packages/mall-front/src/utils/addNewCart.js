import { isEmpty } from 'lodash';
import Swal from 'components/swal';
import { openComfirmModal, openGoToLowestSkuModal } from 'utils/modals';
import { getUserConfigInfo } from 'utils/utils';
import { getUserCustomDimension, getUserConfigDTO, getCompareConfig } from 'utils/configUtils';
import intl from 'utils/intl';
import { addNewCartService } from 'services/newCartService';
import CuxFn from '@/cuxTools/cuxFn';
import searchCache from 'utils/searchCache';

export function validAddress({ currentAddress = {}, addressRef, product }) {
  const { userId, companyId } = getUserConfigInfo();
  if (!currentAddress.addressId && product.agreementBusinessType !== 'RECEIVE') {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      children: intl
        .get('mallf.common.view.productAddressWarn')
        .d('暂无收货地址，请先维护收货地址'),
      okText: intl.get('mallf.common.view.goEdited').d('去维护'),
      onOk: () => {
        CuxFn({
          name: 'addNewCart-fn-setAddress',
          value: {
            itemCode: product.itemCode,
            addressRef,
            companyId,
            userId,
            product,
          },
        })();
        addressRef.current.element.element.click();
      },
    });
    return false;
  }
  return true;
}

// 新购物车头维度参数
export function getHeaderFixedDimension({ currentAddress, currentWarehouse = {}, product = {} }) {
  const { defaultAddress } = getUserConfigInfo();
  const { addressId, fullAddress, regionId, internationalTelCode, mobile } =
    currentAddress || defaultAddress || {};
  const { warehouseId, warehouseName, warehouseAddress } = CuxFn({
    name: 'addNewCart-fn-getCurrentWarehouse',
    value: { currentWarehouse },
  })(() => currentWarehouse || {})();
  const {
    supplierCompanyId,
    currencyCode,
    currencyId,
    currencyName,
    saleAgreementId,
    sourceFrom,
    sourceFromCode,
  } = product || {};
  const fixedList = ['invOrganization', 'purOrganization', 'ou', 'company', 'unit'];
  const fixedObj = {};
  const { levelPath } = getUserConfigDTO();
  // 采买组织自定义维度值
  const userCustomDmsValue = getUserCustomDmsValue();
  fixedList.forEach((n) => {
    const value = getUserConfigDTO()[`${n}Id`];
    fixedObj[`${n}Id`] = value
      ? {
          value,
          valueName: getUserConfigDTO()[`${n}Name`] || null,
        }
      : null;
  });
  // 头固定列value值
  const _HEADER_FIXED = {
    ...fixedObj,
    addressId: {
      value: addressId,
      valueName: fullAddress,
    },
    levelPath: {
      value: levelPath,
    },
    currencyId: {
      value: currencyId,
      valueName: currencyName,
    },
    currencyCode: {
      value: currencyCode,
      valueName: currencyName,
    },
    supplierCompanyId: {
      value: supplierCompanyId,
    },
    regionId: {
      value: regionId,
    },
    saleAgreementId: {
      value: saleAgreementId,
    },
    warehouseId: {
      value: warehouseId || -1, // 用户无上次选择记录，库房id给-1
      valueName: warehouseName,
    },
    warehouseAddress: {
      value: warehouseAddress,
    },
    productSource: {
      // 来源 在详情页控制收货人手机号初始显示 不传后端会赋值
      value: sourceFromCode || sourceFrom,
    },
    receiverMobile: {
      // 标准 收货人手机号默认值
      value: (internationalTelCode ? `${internationalTelCode}|` : '') + mobile,
    },
    ...userCustomDmsValue,
  };
  return _HEADER_FIXED;
}

export function getUserCustomDmsValue() {
  const customDimension = getUserCustomDimension();
  Object.keys(customDimension).forEach((key) => {
    const { meaning } = customDimension[key] || {};
    customDimension[key].valueName = meaning;
  });
  return customDimension;
}

export function addNewCareParams(props) {
  const {
    product,
    dimensTemplates,
    currentAddress = {},
    currentWarehouse = {},
    supplierCompanyId,
    tmpQuantity,
    cartSource,
    searchUuid = null,
  } = props;
  const { userId, organizationId, companyId, unitId, unitName } = getUserConfigInfo();
  const {
    productId,
    itemCode,
    sourceFromCode,
    sourceFrom,
    ecPlatform,
    saleAgreementId,
    customizedProductLineList,
    agreementBusinessType,
    manualFlag,
  } = product || {};
  // 是否领用
  const isReceive = agreementBusinessType === 'RECEIVE';
  const dimensionList =
    dimensTemplates[isReceive ? 'receivedDimensionList' : 'dimensionList'] || {};
  const dimensionTemplate =
    dimensTemplates[isReceive ? 'receivedDimensionTemplate' : 'dimensionTemplate'] || {};
  if (isEmpty(dimensionTemplate)) {
    Swal(
      intl.get('mallf.common.view.noDimensTemplates').d('当前采买组织下不存在已发布的购物车模板')
    );
    return false;
  }
  const { templateId } = dimensionTemplate;
  // 头维度
  const headerDimension =
    dimensionList.filter((n) =>
      ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType)
    ) || [];
  const _HEADER_FIXED = getHeaderFixedDimension({
    currentAddress,
    currentWarehouse,
    product,
  });
  // 头维度
  let headerList = headerDimension.map((n) => {
    return {
      ...n.dimension,
      headerIndex: 1,
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
      product,
    },
  })(() => headerList)();
  // 行维度
  const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
  const params = {
    templateId,
    unitId,
    unitName,
    supplierCompanyId,
    productId,
    itemCode,
    productSource: sourceFromCode || sourceFrom || ecPlatform,
    tenantId: organizationId,
    ownerId: userId,
    cartSource,
    companyId,
    saleAgreementId,
    receiveFlag: isReceive ? 1 : 0,
    manualFlag,
    searchUuid,
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
                value: +tmpQuantity,
              },
            ],
          };
        }),
      },
    ],
    customizedProductLineList,
  };
  return params;
}

export async function addNewCart(props) {
  const { product = {}, tmpQuantity, ReceiveLovRef, fly, setLoading = (e) => e } = props;
  const { tenantId } = getUserConfigInfo();
  const careParams = addNewCareParams(props);
  const params = getCartParams(careParams, {
    price: product.sellPrice,
    labelList: product.labelList,
  });
  if (isEmpty(params)) return;
  setLoading(true);
  const newParams = await CuxFn({
    name: 'addNewCart-fn-addNewCart',
    value: { params, product },
  })(() => params)();
  if (isEmpty(newParams)) {
    setLoading(false);
    return;
  }
  addNewCartService(newParams)
    .then((res) => {
      if (res.reWarehouseFlag === 1) {
        openComfirmModal({
          title: intl.get('mallf.common.view.prompt').d('提示'),
          border: false,
          children: intl
            .get('mallf.common.view.productReceiveWarn')
            .d('暂无库房信息，请先维护库房信息'),
          okText: intl.get('mallf.common.view.goEdited').d('去维护'),
          onOk: () => {
            ReceiveLovRef.current.product = product;
            ReceiveLovRef.current.tmpQuantity = tmpQuantity;
            ReceiveLovRef.current.fly = fly;
            ReceiveLovRef.current.dataSet
              .getField('commonLov')
              .setLovPara('agreementHeaderId', product.saleAgreementId);
            ReceiveLovRef.current.dataSet.getField('commonLov').setLovPara('tenantId', tenantId);
            ReceiveLovRef.current.dataSet
              .getField('commonLov')
              .setLovPara('skuId', product.productId);
            ReceiveLovRef.current.element.element.click();
          },
        });
        return;
      }
      if (res) {
        if (res?.lowestPriceRule) {
          openGoToLowestSkuModal({
            res,
            params,
            onOk: () => {
              setLoading(true);
              params.confirmFlag = 1;
              addNewCartService(params).then((resp) => {
                if (resp) {
                  setLoading(false);
                  fly();
                }
              });
            },
          });
        } else {
          fly();
        }
      }
    })
    .finally(() => {
      setLoading(false);
    });
}

// 判断排除策略比价
export function isExcludeCompare(labelList, supplierCompanyId) {
  const { labelCodeList, supplierIdList } = getCompareConfig();
  // 排除标签
  const excludeLabel =
    labelCodeList &&
    labelList &&
    labelList.some((s) => s.deleteFlag === 0 && labelCodeList.includes(s.labelCode));
  // 排除供应商
  const excludeSupplier = supplierIdList && supplierIdList.includes(supplierCompanyId);
  return excludeLabel || excludeSupplier;
}

// 加入购物车参数调整埋点
export function getCartParams(params, extraInfo) {
  return CuxFn({
    name: 'addCart-fn-getParams',
    value: {
      params,
      extraInfo,
    },
  })(() => {
    const { lowerLimit, upperLimit } = getCompareConfig();
    const { productId, supplierCompanyId, searchUuid } = params || {};
    const { price, labelList } = extraInfo || {};
    if (isExcludeCompare(labelList, supplierCompanyId)) return params;

    // 当前商品
    const curProduct = { productId, price };
    // 比价商品
    const compareList = searchCache.get(searchUuid) || [];
    const cartParams = { ...params };
    const filterCompareList = compareList.filter((f) => f.productId !== productId);
    // 缓存比价商品长度大于最小比价数量同时非加购商品以外的数量长度要大于0（按理来说至少会有2个商品比价第二个条件可能会不需要）
    if (compareList.length >= lowerLimit && filterCompareList.length > 0) {
      const searchProductList = [curProduct, ...filterCompareList];
      // 如果超过最大限制，则删除（一般来说只会删除1次）
      while (searchProductList.length > upperLimit) {
        searchProductList.pop();
      }
      cartParams.searchProductList = searchProductList;
    }
    return cartParams;
  })();
}

// 再来一单加购后置统一操作
export function afterBuyAgain(result = [], successJump) {
  const targetList = result.filter((r) => ![0, '0'].includes(r.buyAgainSuccess));
  const runSuccessJump = () => {
    if (typeof successJump === 'function') {
      successJump(targetList);
    }
  };
  // 判断是否加入了购物车
  if (result.length && targetList.length === result.length) {
    runSuccessJump();
  } else if (targetList.length) {
    runSuccessJump();
    setTimeout(() => {
      Swal(
        intl
          .get('mallf.common.view.addCartSomeSuccess')
          .d('部分商品下架或在收货地址区域不可售，已将可售商品加入购物车')
      );
    }, 1500);
  } else {
    Swal(intl.get('mallf.common.view.buyAgainAllNotSale').d('全部商品下架或在收货地址区域不可售'));
  }
}

// 不可加购原因提示
export function notAddCartMessage({
  saleEnable,
  stockState,
  sourceFrom,
  soldOutType, // 不可售类型
  operationAuth,
}) {
  let message = null;
  if (operationAuth === 'VIEW') {
    message = intl
      .get('mallf.common.view.operationAuthView')
      .d('当前商品采买权限仅浏览，请联系管理员操作');
  } else if (saleEnable === 0) {
    switch (soldOutType) {
      case 1:
        message = intl
          .get('mallf.common.view.soldOutType1')
          .d('管理员已将该商品从商城下架，请联系商城管理员');
        break;
      case 2:
        message = intl
          .get('mallf.common.view.soldOutType2')
          .d('供应商已将该商品从商城下架，请联系商城管理员');
        break;
      case 3:
        message = intl
          .get('mallf.common.view.soldOutType3')
          .d('您没有该商品采买权限，请联系商城管理员');
        break;
      case 4:
        message = intl.get('mallf.common.view.soldOutType5').d('该商品不可售，请联系供应商');
        break;
      case 5:
        message = intl
          .get('mallf.common.view.soldOutType4')
          .d('供应商设置该商品对当前区域不可售，请联系商城管理员');
        break;
      case 6:
        message = intl
          .get('mallf.common.view.soldOutType6')
          .d('供应商未返回有效的商品价格，请联系商城管理员');

        break;
      case 7:
        message = intl
          .get('mallf.common.view.soldOutType7')
          .d('从供应商获取价格/库存/可售信息超时，请刷新页面重试');
        break;
      case 8:
        message = intl
          .get('mallf.common.view.soldOutType8')
          .d('管理员已将该商品目录禁用，请联系商城管理员');
        break;
      default:
        break;
    }
  } else if (saleEnable === 1 && stockState === 5) {
    message =
      sourceFrom === 'CATA'
        ? intl.get('mallf.common.view.cataStockState5').d('该商品无货，请联系商城管理员')
        : intl
            .get('mallf.common.view.ecStockState5')
            .d('该商品针对当前区域无货，需要供应商补货，请联系商城管理员');
  }
  return message;
}
