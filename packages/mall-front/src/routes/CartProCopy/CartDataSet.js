import React from 'react';
import { DataSet, Message } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isEmpty, cloneDeep } from 'lodash';
import { toJS, observable, action } from 'mobx';
import ResizeObserver from 'resize-observer-polyfill';
import {
  updateCustomService,
  fetchProductDimService,
  updateQualityCartService,
  deleteLinesService,
  changeCompareService,
  deleteCompareService,
  collectProductService,
  updatePunchoutAddressService,
} from 'services/newCartService';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import {
  getStockConfig,
  getUserConfigInfo,
  getCurrentUserId,
  filterNullValueObject,
  getStorage,
  calcValidatePack,
  getPrecision,
} from 'utils/utils';
import { getOpenCartFlag, getViewTypeStorageKey } from 'utils/configUtils';
import SwalAlert from 'components/swal';
import cuxOverwrite from '@/cuxTools/cuxOverwrite';
import CuxFn from '@/cuxTools/cuxFn';
import { recordsFilter, getSameRecords, getSortCartList, checkRecordSame } from './func';
import { groupField, checkValueField, cartGroupType } from './enum';
import loadCartData, { getDimensionTemplateDTO } from './loadCartData';

// 注意不要添加DataSet原有的属性和方法
export default class CartDataSet extends DataSet {
  // 初次加载控制
  @observable cartLoading = true;

  @observable isCartEmpty = false;

  @observable tabelColumns = [];

  @observable tabelGroups = [];

  constructor(dataSetProps, cartDataSetProps) {
    super(dataSetProps);
    const { events = {}, params = {} } = cartDataSetProps;

    const { unitId, unitCode, unitName, companyId, cartPageSize = 30 } = getUserConfigInfo();
    this.cartPage = 0; // 记录当前页
    this.cartSize = 0; // 记录当前大小
    this.cartTotal = null; // 记录当前总数
    this.hasMoreProduct = true; // 滚动查询查询
    this.cartData = []; // 记录查询出来的数据
    this.cartResp = {}; // 请求结果记录
    this.againCartIds = []; // 再来一单购物车id
    this.backCartIds = []; // 返回购物车的ids
    this.updatePoRecords = []; // 记录修改地址po商品
    this.cartColumns = []; // 表头字段
    // this.validateTypes = this.getValidateType();

    this.setCartParams({
      unitId,
      unitCode,
      unitName,
      companyId,
      ...params,
    }); // 参数
    this.cartEvents = events; // 事件
    this.cartPageSize = cartPageSize; // 分页大小

    this.loadCartData = this.loadCartData.bind(this);
    this.queryCartData = this.queryCartData.bind(this);
    this.fetchSingleCart = this.fetchSingleCart.bind(this);
    this.deleteCartRecords = this.deleteCartRecords.bind(this);
    this.setAgainCartIds = this.setAgainCartIds.bind(this);
    this.setUpdatePoRecords = this.setUpdatePoRecords.bind(this);
    this.setState('checkCartChoosed', 0);
  }

  getSkuSourceMeaning(cart) {
    if (+cart.manualFlag === 1) {
      return intl.get('mallf.cart.view.manual').d('手工');
    } else if (+cart.receiveFlag === 1) {
      return intl.get('mallf.cart.view.receive').d('领用');
    } else if (+cart.punchoutFlag === 1) {
      return 'punchout';
    } else if (cart.productSource !== 'CATA') {
      return intl.get('mallf.cart.view.order.E-commerce').d('电商');
    } else {
      return intl.get('mallf.common.view.common.CATA').d('目录化');
    }
  }

  // 需要校验的类型
  @cuxOverwrite({ name: 'Cart/CartDataSet/getValidateType' })
  getValidateType(_record) {
    if (getOpenCartFlag()) {
      const dataSet = this;
      const validaTypes = {
        linkType: (record) => {
          const validateSkuType = this.getSkuSourceMeaning(record.toData());
          const selectedSkuType = this.getSkuSourceMeaning(dataSet.selected[0]?.toData() || {});
          return intl
            .get(`mallf.common.view.porduct.chooseSameLink`, {
              newType: validateSkuType,
              oldType: selectedSkuType,
            })
            .d(
              `${validateSkuType}商品和${selectedSkuType}商品，因业务不同故使用的链路不一致无法同时勾选!`
            );
        },
        currencyCode: intl
          .get(`mallf.common.view.porduct.chooseSameCurrency`)
          .d('只能选择相同币种的商品！'),
      };
      const record = _record || dataSet.selected[0] || dataSet.get(0);
      if (record && record.get('linkType') === 'ORDER') {
        validaTypes.receiveFlag = intl
          .get(`mallf.cart.view.porduct.chooseSameReceive`)
          .d('领用商品和采购商品不可同时勾选！');
      }
      return validaTypes;
    }
    return {
      centralizedFlag: intl
        .get('mallf.cart.view.chooseSameRuleProduct')
        .d('只能选择相同业务类型的商品'),
      receiveFlag: intl
        .get(`mallf.cart.view.porduct.chooseSameReceive`)
        .d('领用商品和采购商品不可同时勾选！'),
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
  }

  // 设置再来一单购物车id集
  setAgainCartIds(againCartIds) {
    this.againCartIds = againCartIds;
  }

  // 设置返回购物车id集
  setBackCartIds(cartList = []) {
    const viewType = getStorage(getViewTypeStorageKey()) || 1;
    if (viewType === 2 || viewType === 4) {
      this.backCartIds = cartList.reduce((ids, r) => {
        const cartLines = r.cartColumnValueList || [];
        if (cartLines.length > 0) {
          return ids.concat(
            cartLines.map((m) => `${r.cartId}_${m.headerNum || 1}_${m.lineNum || 1}`)
          );
        } else {
          ids.push(r.cartId);
          return ids;
        }
      }, []);
    } else {
      this.backCartIds = cartList.map((m) => m.cartId);
    }
  }

  // 设置更新地址po商品记录
  setUpdatePoRecords(records) {
    this.updatePoRecords = records;
  }

  // 触发参数事件回调
  execEvents = (eventKey, args) => {
    const events = this.cartEvents || {};
    if (typeof events[eventKey] === 'function') {
      events[eventKey](args);
    }
  };

  // 数据分组处理，加载ds数据
  @action
  @cuxOverwrite({ name: 'Cart/CartDataSet/loadCartData' })
  loadCartData(list, setting = {}) {
    const { needCheck, checkAll, fetchSingle } = setting || {};
    const dataSet = this;
    const isCheckChoose = dataSet.getState('checkCartChoosed') === 1;
    const selectSku = dataSet.selected.map((p) => p.toData());
    let newList = cloneDeep(list);
    if (isCheckChoose && fetchSingle) {
      // 勾上查看已选
      newList = newList.filter((cart) => selectSku.some((line) => line.cartId === cart.cartId));
      if (dataSet.getState('cartViewType') === 2) {
        newList.forEach((cart, i) => {
          newList[i].cartColumnValueList = cart.cartColumnValueList.filter((p) => {
            const currentLines = selectSku.filter((line) => line.cartId === cart.cartId);
            return currentLines.some(
              (line) => line.headerNum === p.headerNum && line.lineNum === p.lineNum
            );
          });
        });
      }
    }
    const lastResp = this.cartResp || {};
    loadCartData(this, { ...lastResp, content: newList });
    // 购物车数据变更，重新计算底部维度
    const lastScroll = dataSet.getState('startScroll') || 0;
    // 用于底部监听计算滚动deps
    dataSet.setState('startScroll', lastScroll + 1);
    if (checkAll) {
      dataSet.batchSelect(dataSet.records);
    } else if (needCheck) {
      dataSet.batchSelect(
        dataSet.records.filter((r) => {
          return (
            !r.get(groupField.groupFlag) &&
            selectSku.some((p) => {
              // 订单链路按分配头勾选
              const isOrder = p.linkType === 'ORDER';
              // 同一个分配头
              const isSameAssign =
                p.cartId === r.get('cartId') && (p.headerNum || 1) === (r.get('headerNum') || 1);
              return dataSet.getState('cartViewType') === 1
                ? p.cartId === r.get('cartId')
                : p[groupField.__cartId] === r.get(groupField.__cartId) ||
                    (isOrder && isSameAssign);
            })
          );
        })
      );
    }
  }

  // 再来一单商品置顶
  checkAgainCartsData = (cartList) => {
    const againIds = this.againCartIds;
    if (!isEmpty(againIds)) {
      const cartIsAgain = (cart) =>
        againIds.some((s) => s === cart.cartId || Number(s) === cart.cartId);
      const againCarts = cartList.filter(cartIsAgain);
      const newCartList = getSortCartList(cartList, againCarts);
      this.loadCartData(newCartList);
      this.againCartIds = [];
    } else {
      this.loadCartData(cartList, { needCheck: true });
    }
  };

  // 切换购物车视图
  changeViewType = (val) => {
    this.execEvents('changeViewType', val);
  };

  cartToJSONData = () => {
    return recordsFilter(
      this,
      () => true,
      (m) => {
        const n = m;
        Object.keys({
          ...groupField,
          ...checkValueField,
        }).forEach((f) => {
          delete n[groupField[f]];
        });
        return m;
      }
    );
  };

  // 勾选校验
  cartSelectValidate = (record) => {
    const dataSet = this;
    const selectSku = recordsFilter(dataSet.selected);
    if (selectSku.length < 1) return true;
    if (!record) return false;
    const validateTypes = this.getValidateType();
    const flag = Object.keys(validateTypes).some((type) => {
      if (record.get(type) !== selectSku?.[0]?.[type]) {
        const validateMsg = validateTypes[type];
        SwalAlert(typeof validateMsg === 'function' ? validateMsg(record) : validateMsg);
      }
      return record.get(type) !== selectSku?.[0]?.[type];
    });
    return !flag;
  };

  // 购物车勾选逻辑处理
  cartSelect = (record) => {
    const dataSet = this;
    const selectFlag = this.cartSelectValidate(record);
    if (selectFlag) {
      // 二开埋点：勾选联动扩展，满足二开条件的其他行全部勾选上
      CuxFn({ name: 'CartProCopy-fn-onCartSelect', value: { dataSet, record } })(() =>
        dataSet.select(record)
      )();
    }
  };

  // 批量勾选｜全选筛选逻辑, po商品就是有效的
  filterSameRecord = (record) => {
    return record.get('invalidFlag') === 1 && !getStockConfig(record.toJSONData());
  };

  // po分组头勾选事件
  cartPoBatchSelect = (records) => {
    const dataSet = this;
    const selectFlag = this.cartSelectValidate(records[0]);
    if (selectFlag) {
      dataSet.batchSelect(records);
    }
  };

  // 分组头勾选事件
  cartBatchSelect = (records) => {
    const dataSet = this;
    const [sameRecords, isAllSelected] = getSameRecords({
      records,
      filter: this.filterSameRecord,
      sameFields: Object.keys(dataSet.getValidateType(records[0])),
      sameRecord: records[0],
    });

    if (isAllSelected) {
      dataSet.batchUnSelect(sameRecords);
    } else {
      const selectFlag = this.cartSelectValidate(sameRecords[0]);
      if (selectFlag) {
        dataSet.batchSelect(sameRecords);
      }
    }
  };

  // 全选事件,仅仅有其他商品时才会出现
  cartSelectAll = () => {
    const dataSet = this;
    const [sameRecords, isAllSelected] = getSameRecords({
      records: dataSet,
      filter: this.filterSameRecord,
      sameFields: Object.keys(dataSet.getValidateType()),
      sameRecord: dataSet.selected[0],
    });
    dataSet.unSelectAll();
    if (!isAllSelected) {
      dataSet.batchSelect(sameRecords);
    }
  };

  setCartParams(nextParams = {}) {
    const prevParams = this.cartParams || {};
    this.cartParams = { ...prevParams, ...nextParams };
  }

  isEqualCart(prev, next) {
    return prev.cartId === next.cartId;
  }

  // 查询单条，回填购物车
  async fetchSingleCart(record) {
    const dataSet = this;
    const cartId = record.get('cartId');
    try {
      dataSet.status = 'loading';
      const res = await fetchProductDimService({
        ...this.cartParams,
        cartId,
        cartGroupType: cartGroupType[dataSet.getState('groupType')],
      });
      if (res) {
        const { content, templateResultDTOList } = res;
        const newCartInfo = (content || []).find((f) => this.isEqualCart(f, record.toData())) || {};
        const dimensionTemplateDTO = getDimensionTemplateDTO(templateResultDTOList, newCartInfo);
        const newCartData = this.cartData.map((cartItem) =>
          this.isEqualCart(cartItem, record.toData())
            ? { ...newCartInfo, dimensionTemplateDTO }
            : cartItem
        );
        this.cartData = newCartData;
        this.loadCartData(newCartData, { needCheck: true, fetchSingle: true });
      }
    } finally {
      dataSet.status = 'ready';
    }
  }

  // 查询方法 loadMore加载更多， startScroll是否触发CartFooter固定计算, param其他查询参数
  async queryCartData({ loadMore = false, startScroll = false } = {}, param) {
    const dataSet = this;
    dataSet.execEvents('cartInit');
    // 下拉是否执行请求
    const page = this.cartPage;
    const total = this.cartTotal;
    const noMore = total !== null && !this.hasMoreProduct;
    if (loadMore && noMore) return false;
    // 参数，现状通过改变size来请求全量数据,后续是否可以通过改变page来增量请求数据
    const params = {
      ...this.cartParams,
      cartGroupType: cartGroupType[dataSet.getState('groupType')],
      productName: dataSet.getState('productName'),
      centralizedTableFlag: dataSet.basketType === 'order' ? 1 : null,
      page: 0,
      size: (page + 1) * this.cartPageSize,
    };

    // 二开埋点：扩展查询条件（从 dataSet state 中读取自定义查询值）
    const cuxParams = CuxFn({
      name: 'CartProCopy-fn-queryCartParams',
      value: { dataSet, params },
    })(() => ({}))();

    try {
      dataSet.status = 'loading';
      const res = await fetchProductDimService({ ...params, ...cuxParams, ...param });
      if (res) {
        // 记录请求结果
        this.curResp = res;
        const { totalElements, numberOfElements, content, cartColumnList } = res;
        this.cartPage = page + 1;
        this.cartSize = params.size;
        this.cartTotal = totalElements;
        this.hasMoreProduct = numberOfElements < totalElements;
        this.cartColumns = cartColumnList || [];
        this.cartData = this.interceptCartData(content || []);
        this.cartResp = res;
        this.execEvents('cartInit', { data: this.cartData });
        // 有再来一单商品就置顶再来一单商品，无则正常加载
        this.checkAgainCartsData(this.cartData || []);
        // 返回购物车数据存在
        if (!isEmpty(this.backCartIds)) {
          this.checkChoosed(true);
          this.setBackCartIds([]);
        }
        // 开启滚动会触发计算底部滚动事件
        if (startScroll) {
          const lastScroll = dataSet.getState('startScroll') || 0;
          // 用于底部监听计算滚动deps
          dataSet.setState('startScroll', lastScroll + 1);
        }
      }
    } finally {
      dataSet.status = 'ready';
      this.execEvents('cartFinally', { data: this.cartData });
    }
  }

  // 对与queryCartData方法查出来的数据做出一些处理
  interceptCartData = (data) => {
    return data;
  };

  // 校验勾选数据该字段是否一样
  selectedIsGroup = (fieldName) => {
    const selectData = recordsFilter(this.selected);
    const firstSelect = selectData[0];
    if (!firstSelect) return false;
    return !selectData.some((s) => !checkRecordSame(firstSelect, s, fieldName));
  };

  getCurrentDimValue = ({ code, record }) => {
    return record.currentDimValue?.cartDimValueList?.find((p) => p.dimensionCode === code)?.value;
  };

  // 获取删除和修改数量的参数
  getFetchParams = (records, otherParams = {}) => {
    const otherKeys = Object.keys(otherParams || {});
    const { companyId } = getUserConfigInfo();
    return records.map((p) => {
      const item = {
        cartId: p.cartId,
        companyId,
        ownerId: getCurrentUserId(),
        productId: p.productId,
        productSource: p.sourceFrom,
        punchoutFlag: p.punchoutFlag,
        receiveFlag: p.receiveFlag,
        supplierCompanyId: p.supplierCompanyId,
        templateId: p.templateId,
        tenantId: p.tenantId,
        unitId: p.unitId,
        manualFlag: p.manualFlag,
        itemId: p.itemId,
        itemCode: p.itemCode,
        templateUpdateFlag: p.templateUpdateFlag,
        ...otherParams,
      };
      if (!isEmpty(otherKeys)) {
        otherKeys.forEach((key) => {
          item[key] = item[key](p);
        });
      }
      return this.changeParams(filterNullValueObject(item));
    });
  };

  // 移除记录
  removeCartRecords = (records, deleteProduct) => {
    let newData = [...this.cartData];
    records.forEach((record) => {
      if (deleteProduct) {
        // 删除整个商品
        newData = newData.filter((p) => p.cartId !== record.get('cartId'));
      } else {
        // 删除行
        const { headerNum, lineNum } = record.get(['headerNum', 'lineNum']);
        newData = newData
          .map((product) => {
            // 是否为当前购物车行
            const isCurrentCart = product.cartId === record.get('cartId');
            const newLines = product.cartColumnValueList.filter(
              (line) =>
                !isCurrentCart || !(line.headerNum === headerNum && line.lineNum === lineNum)
            );
            if (isEmpty(newLines)) {
              return null;
            } else {
              let totalQuantity = 0;
              const newCartColumnValueList = product.cartColumnValueList.filter((line) => {
                const flag =
                  !isCurrentCart || !(line.headerNum === headerNum && line.lineNum === lineNum);
                if (flag) {
                  totalQuantity = math.plus(
                    totalQuantity,
                    line.cartDimValueList?.find((p) => p.dimensionCode === 'quantity')?.value
                  );
                }
                return flag;
              });
              return {
                ...product,
                totalQuantity,
                cartColumnValueList: newCartColumnValueList,
              };
            }
          })
          .filter(Boolean);
      }
    });
    this.cartData = newData;
    if (isEmpty(newData)) {
      this.isCartEmpty = true;
    }
    this.loadCartData(this.cartData, { needCheck: true });
  };

  // 删除请求
  async deleteCartRecords(records, deleteProduct) {
    const dataSet = this;
    if (!records || records.length < 1) return;
    dataSet.status = 'loading';
    try {
      const deleteSkus = this.getFetchParams(recordsFilter(records), {
        deleteAllFlag: () => (deleteProduct ? 1 : null),
        cartColumnValueList: (record) => (deleteProduct ? [] : [record.currentDimValue]),
      });
      const res = await deleteLinesService(deleteSkus);
      if (res) {
        this.removeCartRecords(records, deleteProduct);
        dataSet.setState('checkCartChoosed', dataSet.selected.length > 0 ? 1 : 0);
      }
    } finally {
      dataSet.status = 'ready';
    }
  }

  // 更新po商品地址请求
  updatePoAddress = async (addressId) => {
    const dataSet = this;
    const records = this.updatePoRecords;
    const params = {
      addressId,
      cartList: recordsFilter(records).map((n) => {
        const { errorMessage, errorCode, ...other } = n;
        return other;
      }),
    };
    try {
      dataSet.status = 'loading';
      const res = await updatePunchoutAddressService(params);
      if (res.some((n) => n.errorMessage)) {
        records.forEach((record) => {
          if (record.get('qtHeaderNo')) {
            // cartId唯一判断
            const findRes = res.find(
              (f) => f.qtHeaderNo === record.get('qtHeaderNo') && f.cartId === record.get('cartId')
            );
            if (findRes) record.set(findRes);
          }
        });
        dataSet.status = 'ready';
      } else {
        this.queryCartData();
      }
    } finally {
      // dataSet.status = 'ready';
    }
  };

  // 对一些参数进行处理（更改数量、定制品）
  changeParams(params) {
    return params;
  }

  // 更新定制品请求
  updateCustom = async (params) => {
    const dataSet = this;
    dataSet.status = 'loading';
    try {
      const { cartColumnValueList, ...otherParams } = params;
      await updateCustomService(this.changeParams(otherParams));
    } catch {
      dataSet.status = 'ready';
    }
    if (dataSet.current.get('templateUpdateFlag')) {
      dataSet.queryCartData();
    } else {
      dataSet.fetchSingleCart(dataSet.current);
    }
  };

  // 购物车数量变更请求
  updateCartQuantity = async ({ value, oldValue, name, record, minLimit, maxLimit }) => {
    const dataSet = this;
    const cartInfo = record.toJSONData();
    const {
      cartId,
      uomPrecision,
      taxIncludedPrice,
      minPackageQuantity,
      manualFlag,
      centralizedFlag,
    } = cartInfo;
    dataSet.setState('quantityChangeCartId', cartId); // 阻止下单，以及其他行数量变更
    const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
    const min = centralizedFlag // 拼单商品 最小为包装量
      ? calcValidatePack(defaultUomPrec, minPackageQuantity)
        ? minPackageQuantity
        : defaultUomPrec
      : manualFlag
      ? defaultUomPrec
      : minLimit || defaultUomPrec;
    let newValue = value;

    // 不是数值，设置回原值
    if (math.isNaN(newValue)) {
      record.set(name, oldValue);
      dataSet.setState('quantityChangeCartId', null);
      return;
    }
    // 小于最小值
    if (math.lt(newValue, min)) {
      newValue = min;
    }
    // 大于最大值
    if (math.gt(newValue, maxLimit)) {
      newValue = maxLimit;
    }

    // 价格隐藏
    if (taxIncludedPrice === '***') {
      newValue = math.toFixed(newValue, uomPrecision) || minLimit;
    }

    // 购买量大于最小采购量时才判断最小包装量
    // 是否满足最小包装量
    const isPackage = math.mod(newValue, minPackageQuantity || 1) === 0;
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
      record.set(name, oldValue);
      dataSet.setState('quantityChangeCartId', null);
      return;
    }

    // 已选中商品币种
    // const [firstSelect] = recordsFilter(dataSet.selected);
    // 币种相同，同时...,则自动选中
    // const isSelected =
    //   !getStockConfig(cartInfo) && firstSelect && firstSelect.currencyCode === currencyCode;

    try {
      const params = dataSet.current?.toData();
      const [fetchParam] = this.getFetchParams([params], {
        cartColumnValueList: (r) => {
          if (dataSet.getState('cartViewType') === 1) {
            return r.cartColumnValueList.map((line) => {
              const qualityValue = line.cartDimValueList.find(
                (p) => p.dimensionCode === 'quantity'
              );
              return {
                ...line,
                cartDimValueList: [
                  {
                    ...qualityValue,
                    value: newValue,
                  },
                ],
              };
            });
          }
          const lineData =
            r.cartColumnValueList?.find(
              (line) => line.headerNum === r.headerNum && line.lineNum === r.lineNum
            ) ||
            r.currentDimValue ||
            {};
          const qualityValue = lineData.cartDimValueList?.find(
            (p) => p.dimensionCode === 'quantity'
          );
          return [
            {
              ...lineData,
              cartDimValueList: [
                {
                  ...qualityValue,
                  value: newValue,
                },
              ],
            },
          ];
        },
        customizedProductLineList: (r) => r.customizedProductLineList,
      });
      dataSet.status = 'loading';
      await updateQualityCartService(fetchParam);
      if (record.get('templateUpdateFlag')) {
        this.queryCartData();
      } else {
        this.fetchSingleCart(record);
      }
    } catch {
      record.set(name, oldValue);
    } finally {
      // dataSet.status = 'ready';
      dataSet.setState('quantityChangeCartId', null);
    }
  };

  // 替换比价单商品请求
  replaceCompare = async ({ record, productId, compareSku }) => {
    const dataSet = this;
    record.setState('compareLoading', true);
    dataSet.status = 'loading';
    let replaceResp;
    try {
      replaceResp = await changeCompareService(compareSku, productId);
    } finally {
      dataSet.status = 'ready';
      record.setState('compareLoading', false);
      if (replaceResp) {
        dataSet.queryCartData();
      }
    }
  };

  getCurrentCompareData = (cartItem) => {
    const dataSet = this;
    const { currentDimValue, productCompareList } = cartItem;
    const unitLevelPathDim = currentDimValue?.cartDimValueList?.find(
      (u) => u.dimensionCode === 'levelPath'
    );
    const addressIdDim = currentDimValue?.cartDimValueList?.find(
      (u) => u.dimensionCode === 'addressId'
    );
    return dataSet.getState('cartViewType') === 2
      ? productCompareList?.filter(
          (p) => p.addressId === addressIdDim?.value && p.unitLevelPath === unitLevelPathDim?.value
        )
      : productCompareList;
  };

  // 删除比价单请求(仅支持删除手动比价)
  deleteCompare = async ({ record }) => {
    const dataSet = this;
    const list = record.get('productCompareList') || [];
    if (list.length > 0) {
      const params = this.getCurrentCompareData(record.toData())
        .filter((f) => +f.autoFlag !== 1)
        .map((c) => ({
          compareId: c.compareId,
        }));
      openComfirmModal({
        title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
        border: false,
        children: (
          <span>
            {intl.get(`mallf.cart.model.confirm.deleteCompareProduct`).d('确认删除比价单？')}
          </span>
        ),
        onOk: () => {
          dataSet.status = 'loading';
          deleteCompareService(params)
            .then(() => {
              dataSet.queryCartData();
              Message.success(
                intl.get(`mallf.cart.model.success.deleteCompareProduct`).d('比价单删除成功')
              );
            })
            .finally(() => {
              dataSet.status = 'ready';
            });
        },
      });
    }
  };

  // 收藏购物车商品请求
  collectCartSku = async ({ record }) => {
    const cartSku = record.toJSONData();
    collectProductService(cartSku).then(
      Message.success(intl.get(`mallf.cart.view.cart.hasCollected`).d('已加入收藏'))
    );
  };

  // 获取勾选的原始数据
  getCheckedCartData = (selectSku) => {
    const dataSet = this;
    const preReqSku = []; // 存储预采商品默认为勾选商品
    selectSku.forEach((product) => {
      if (dataSet.getState('cartViewType') === 1) {
        preReqSku.push({ ...product, deleteAllFlag: 1 });
      } else {
        const hasCurrentProduct = preReqSku.find((p) => this.isEqualCart(p, product));
        if (hasCurrentProduct) {
          hasCurrentProduct.cartColumnValueList = [
            ...hasCurrentProduct.cartColumnValueList,
            product.currentDimValue,
          ];
        } else {
          preReqSku.push({
            ...product,
            ...(dataSet.cartData.find((p) => this.isEqualCart(p, product)) || {}),
            cartColumnValueList: [product.currentDimValue],
          });
        }
      }
    });
    return preReqSku;
  };

  // 查看已选
  checkChoosed = (defaultShowCheck) => {
    const dataSet = this;
    const needCheck = defaultShowCheck || dataSet.getState('checkCartChoosed') === 0;
    const selectSku = recordsFilter(dataSet.selected);
    if (isEmpty(selectSku)) return;
    dataSet.setState('checkCartChoosed', needCheck ? 1 : 0);
    this.loadCartData(needCheck ? this.getCheckedCartData(selectSku) : this.cartData, {
      needCheck: true,
    });
    const lastScroll = dataSet.getState('startScroll') || 0;
    // 用于底部监听计算滚动deps
    dataSet.setState('startScroll', lastScroll + 1);
  };

  // 获取当前维度某个维度的value
  getDimValue = (record, name) => {
    return toJS(
      record
        .get('currentDimValue')
        ?.cartDimValueList.slice()
        ?.find((p) => p.dimensionCode === name)
    );
  };

  // // 监听表格dom改变
  tableObserver;

  // // 添加事件，表格切换视图时dom改变后，关闭spin
  initTableObserver = () => {
    const cartTableBody = document.querySelector('.cart-pro-body-box .c7n-pro-table-tbody');
    if (cartTableBody) {
      this.tableObserver = new ResizeObserver(() => {
        this.setViewSpinning(false);
      });
      this.tableObserver.observe(cartTableBody);
    }
  };

  // // 切换视图spinning控制
  setViewSpinning = (spinning) => {
    const viewSpin = document.querySelector('.cart-pro-body-box-spinning');
    if (!this.tableObserver) {
      this.initTableObserver();
    }
    if (viewSpin) {
      viewSpin.style.display = spinning ? 'block' : 'none';
      setTimeout(() => {
        viewSpin.style.display = 'none';
      }, 1000);
    }
  };
}
