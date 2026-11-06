/* eslint-disable no-unused-expressions */
import { DataSet, message } from 'choerodon-ui/pro';
import { isString, isObject, isEmpty } from 'lodash';
import { observable, action, runInAction } from 'mobx';

import request from 'utils/request';
import SwalAlert from 'components/swal';
import { openComfirmModal } from 'utils/modals';
import { getUserCustomDimension } from 'utils/configUtils';
import {
  getUserConfigInfo,
  getStockNumMeaning,
  getCacheAddress,
  generateUrlWithGetParam,
  filterNullValueObject,
} from 'utils/utils';
import {
  fetchProductLabel,
  fetchBudgetLov,
  getCentralizedInfo,
} from 'services/productDetailService';
import { checkSaleBySagm, queryStock } from 'services/homeService';
import intl from 'utils/intl';
import { addNewCart, validAddress } from 'utils/addNewCart';
import { addToCartService } from 'services/productListService';
import { updateBudget } from 'services/cartService';
import { apiGateway } from 'utils/api-config';
import {
  fetchGroupList,
  deleteFavorite,
  clearInvalideProduct,
  fetchCurrentGroup,
  addToSiglCartService,
  fetchMroBudget,
} from './api';

export default class Store extends DataSet {
  // 收藏夹列表
  @observable favoriteGroupList = [];

  // 商品列表
  @observable favoriteProductList = [];

  // 是否在拖拽中的flag
  @observable isDragging = false;

  // loading
  @observable spinning = false;

  // 当前查看的收藏夹
  @observable currentGroup = null;

  // 加购数据
  @observable addCartData = {};

  @observable searchName = '';

  // 价格查询完才能执行加购
  @observable priceSpining = false;

  refresh = false;

  userInfo = {};

  // 异步接口查询出来的sku补充信息, 商品id映射对象
  @observable skuInfoMap = {}; // productId -> {}

  @action
  setSkuInfo(productId, nextSkuInfo) {
    if (!productId) return;
    const prevSkuInfo = this.skuInfoMap[productId] || {};
    this.skuInfoMap[productId] = { ...prevSkuInfo, ...(nextSkuInfo || {}) };
  }

  getSkuInfo(productId, key) {
    return this.skuInfoMap[productId]?.[key];
  }

  favoriteInit() {
    const dataSet = this;
    const {
      budgetSwitch,
      defaultAddress,
      mallType,
      firstRegionId,
      secondRegionId,
      levelPath,
      companyId,
      regionId,
      organizationId,
      addressInfo,
      tenantId,
      tenantNum,
      userId,
      invoiceOrgId,
      purchaseOrgId,
      unitId,
      isNewCart,
    } = getUserConfigInfo();
    this.userInfo = {
      budgetSwitch,
      defaultAddress,
      mallType,
      firstRegionId,
      secondRegionId,
      levelPath,
      companyId,
      regionId,
      organizationId,
      addressInfo,
      tenantId,
      tenantNum,
      userId,
      invoiceOrgId,
      purchaseOrgId,
      unitId,
      isNewCart,
    };
    dataSet.getGroupList();
    dataSet.changeStore('addCartData', {
      ...dataSet.addCartData,
      currentAddress: !isEmpty(defaultAddress) ? defaultAddress : getCacheAddress(),
    });

    // 获取预算值集
    if (+budgetSwitch === 1) {
      fetchBudgetLov().then((res) => {
        if (res) {
          dataSet.changeStore('addCartData', { ...dataSet.addCartData, budgetList: res });
        }
      });
    }
  }

  @action
  changeStore(key, value) {
    if (isString(key) && key in this) {
      this[key] = value;
      return;
    }
    if (isObject(key)) {
      Object.keys(key).forEach((k) => {
        if (isString(k) && k in this) {
          this[k] = key[k];
        }
      });
    }
  }

  getGroupList(page) {
    const dataSet = this;
    dataSet.pageSize = 20;
    dataSet.loadData([]);
    dataSet.refresh = true;
    if (dataSet.currentGroup) {
      dataSet.getCurrentGroupProduct(dataSet.currentGroup.categoryId);
      return;
    }

    const { mallType, firstRegionId, secondRegionId, levelPath, companyId } = this.userInfo;
    const customDimensionMap = getUserCustomDimension();
    this.changeStore('spinning', true);
    const productFavoritesDTO = {
      purchaseType: 'COMPANY',
      firstRegionId,
      secondRegionId,
      levelPath,
      shelfFlag: 1,
      companyId,
      customDimensionMap,
      productName: dataSet.searchName,
      channel: mallType === 'sigl' ? 'PERSONAL' : null,
    };
    fetchGroupList({
      query: page || { page: 0, size: dataSet.pageSize },
      favoritesCategory: {
        channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE',
      },
      productFavoritesDTO,
    })
      .then((res) => {
        const { favoritesCategoryList, productFavoritesDTOPage } = res || {};
        dataSet.refresh = false;
        runInAction(() => {
          dataSet.changeStore({
            favoriteGroupList: favoritesCategoryList || [],
            favoriteProductList: productFavoritesDTOPage,
          });
          if (!dataSet.currentGroup) {
            dataSet.loadData(productFavoritesDTOPage?.content);
            dataSet.getAsyncSkuInfo(productFavoritesDTOPage?.content || []);
          }
        });
      })
      .finally(() => {
        dataSet.changeStore('spinning', false);
        document.querySelector('body').scrollTop = 0;
      });
  }

  getCurrentGroupProduct(id) {
    const dataSet = this;
    dataSet.refresh = true;
    dataSet.loadData([]);
    const { firstRegionId, secondRegionId, levelPath, companyId, mallType } = dataSet.userInfo;
    const customDimensionMap = getUserCustomDimension();
    const productFavoritesDTO = {
      purchaseType: 'COMPANY',
      firstRegionId,
      secondRegionId,
      levelPath,
      shelfFlag: 1,
      companyId,
      customDimensionMap,
      favoriteCategoryId: id,
      productName: dataSet.searchName,
      channel: mallType === 'sigl' ? 'PERSONAL' : null,
    };
    dataSet.changeStore('spinning', true);
    fetchCurrentGroup(productFavoritesDTO)
      .then((res) => {
        dataSet.refresh = false;
        dataSet.pageSize = res.length;
        if (dataSet.currentGroup) {
          dataSet.loadData(res);
          dataSet.getAsyncSkuInfo(res || []);
        }
      })
      .finally(() => {
        dataSet.changeStore('spinning', false);
      });
  }

  getAsyncSkuInfo(content) {
    this.getProductPriceInfo(content);
    this.getProductLabelInfo(content);
    this.getSkuCentrailzeInfo(content);
  }

  getProductPriceInfo(content) {
    if (isEmpty(content)) return;
    const dataSet = this;
    const { regionId, levelPath, organizationId, addressInfo, companyId } = this.userInfo;
    // 查询价格服务可售参数
    const priceParams = {
      regionId,
      skuParamDTOS: content?.map((m) => ({
        quantity: 1,
        skuId: m.productId,
        sourceFrom: m.ecPlatform,
      })),
      ecProductCheckDto: {
        tenantId: organizationId,
        ...addressInfo,
      },
      companyId,
      queryEcPriceFlag: true,
      unitLevelPath: levelPath,
    };
    const stockParams = {
      ...addressInfo,
      tenantId: organizationId,
      batchSkuIds: content.map((g) => ({
        skuId: g.productSource === 'CATA' ? g.skuCode : g.thirdSkuCode,
        supplierCode: g.ecPlatform,
        categoryCode: g.categoryCode,
      })),
    };
    this.changeStore('priceSpining', true);
    Promise.all([checkSaleBySagm(priceParams), queryStock(stockParams)]).then(
      ([prices, stocks]) => {
        this.changeStore('priceSpining', false);
        if (this.refresh) return;
        // 记录价格信息
        content.map((p) => {
          const isFindPrice = prices.find((i) => i.skuId === p.productId);
          const { skuStock, stockState } =
            stocks.result?.find(
              (i) =>
                i.skuId === p.thirdSkuCode || (p.productSource === 'CATA' && i.skuId === p.skuCode)
            ) || {}; // 库存
          if (isFindPrice) {
            const {
              saleAgreementId,
              agreementBusinessType,
              supplierCompanyId,
              sellPrice,
              pointPrice, // 积分
              pointsTypeName,
              paymentType,
              showSupplierName,
              currencySymbol,
              uomName,
              deliveryCycle,
            } = isFindPrice || {};
            const stockNumMeaning = getStockNumMeaning(stockState, skuStock, {
              isReceive: isFindPrice?.agreementBusinessType === 'RECEIVE',
            });
            return {
              ...p,
              stockNumMeaning,
              saleAgreementId,
              agreementBusinessType,
              supplierCompanyId,
              sellPrice,
              pointPrice, // 积分
              pointsTypeName,
              paymentType,
              showSupplierName,
              supplierCompanyName: showSupplierName,
              currencySymbol,
              uomName,
              quantity: p.saleQuantity,
              deliveryCycle,
            };
          } else {
            return p;
          }
        });
        runInAction(() => {
          dataSet.loadData(
            content.map((p) => {
              const isFindPrice = prices.find((i) => i.skuId === p.productId);
              const { skuStock, stockState } =
                stocks.result?.find(
                  (i) =>
                    i.skuId === p.thirdSkuCode ||
                    (p.productSource === 'CATA' && i.skuId === p.skuCode)
                ) || {}; // 库存
              if (isFindPrice) {
                const {
                  saleAgreementId,
                  agreementBusinessType,
                  supplierCompanyId,
                  sellPrice,
                  pointPrice, // 积分
                  pointsTypeName,
                  paymentType,
                  showSupplierName,
                  currencySymbol,
                  uomName,
                  deliveryCycle,
                  operationAuth,
                } = isFindPrice || {};
                const stockNumMeaning = getStockNumMeaning(stockState, skuStock, {
                  isReceive: isFindPrice?.agreementBusinessType === 'RECEIVE',
                });
                return {
                  ...p,
                  stockNumMeaning,
                  saleAgreementId,
                  agreementBusinessType,
                  supplierCompanyId,
                  sellPrice,
                  pointPrice, // 积分
                  pointsTypeName,
                  paymentType,
                  showSupplierName,
                  supplierCompanyName: showSupplierName,
                  currencySymbol,
                  uomName,
                  quantity: p.saleQuantity,
                  deliveryCycle,
                  operationAuth,
                };
              } else {
                return p;
              }
            })
          );
        });
      }
    );
  }

  getProductLabelInfo(content) {
    const dataSet = this;
    if (isEmpty(content)) return;
    const productIds = content.map((m) => m.productId);
    fetchProductLabel(productIds).then((res) => {
      if (this.refresh) return;
      runInAction(() => {
        dataSet.loadData(
          content.map((p) => {
            const findLabel =
              res.find((i) => i.productId === p.productId)?.productLabelDTOList || [];
            return { ...p, labelList: findLabel };
          })
        );
      });
    });
  }

  getSkuCentrailzeInfo(content) {
    const dataSet = this;
    if (isEmpty(content)) return;
    const params = content.map((m) => ({ productId: m.productId }));
    getCentralizedInfo(params).then((res) => {
      if (this.refresh) return;
      content.forEach((p) => {
        const { templateName } = res.find((i) => i.productId === p.productId) || {};
        if (templateName) {
          dataSet.setSkuInfo(p.productId, { centralizedTemplateName: templateName });
        }
      });
    });
  }

  deleteProcut(item) {
    const dataSet = this;
    openComfirmModal({
      title: intl.get('mallf.myFavorite.confirm.title.confirmDelete').d('确认删除'),
      children: intl
        .get('mallf.myFavorite.view.myFavorite.deleteProduct')
        .d('确认从收藏栏移除该商品?'),
      onOk() {
        dataSet.changeStore('spinning', true);
        deleteFavorite(item).then(() => {
          dataSet.getGroupList();
          message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
        });
      },
    });
  }

  batchDelInvalideProcut() {
    const dataSet = this;
    openComfirmModal({
      title: intl.get('mallf.myFavorite.confirm.title.confirmDelAll').d('确认清空'),
      children: intl
        .get('mallf.myFavorite.view.myFavorite.delInvalideProcutDesc')
        .d('确认清空失效商品?'),
      onOk() {
        const { firstRegionId, secondRegionId, levelPath, mallType } = dataSet.userInfo;
        const queryParams = {
          purchaseType: 'COMPANY',
          firstRegionId,
          secondRegionId,
          levelPath,
          shelfFlag: 0,
          favoriteCategoryId: dataSet.currentGroup?.categoryId,
          channel: mallType === 'sigl' ? 'PERSONAL' : null,
        };
        dataSet.changeStore('spinning', true);
        clearInvalideProduct(queryParams).then(() => {
          dataSet.getGroupList();
          message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
        });
      },
    });
  }

  /**
   * lov数据请求url
   * @param {*} lovViewConfig - lov视图配置参数
   */
  handleUrl(lovViewConfig = {}) {
    const { tenantId } = this.userInfo;
    const { lovTypeCode, queryUrl: lovQueryUrl, lovCode } = lovViewConfig;
    const newQueryUrl =
      lovTypeCode === 'URL'
        ? generateUrlWithGetParam(`${apiGateway}${lovQueryUrl}`)
        : generateUrlWithGetParam(`${apiGateway}${lovQueryUrl}`, {
            lovCode,
          });
    return newQueryUrl.indexOf('{organizationId}')
      ? newQueryUrl.replace('{organizationId}', tenantId)
      : newQueryUrl;
  }

  fetchLovData(qdata = {}, viewInfo, budgetItem) {
    const { fieldName } = budgetItem;
    const filterNullQuery = filterNullValueObject({
      ...qdata,
    });
    const { displayField, valueField, queryUrl } = viewInfo;
    const newUrl = generateUrlWithGetParam(queryUrl, filterNullQuery);
    return new Promise((resolve) => {
      request(newUrl).then((res) => {
        if (res.content) {
          // 设置默认值为第一行数据
          const data = res.content[0] || {};
          resolve({
            [fieldName]: data[valueField],
            [`${fieldName}Meaning`]: data[displayField],
          });
        }
      });
    });
  }

  // 查询值集视图配置
  fetchViewinfo(itemId) {
    const dataSet = this;
    const { tenantId, tenantNum, userId } = this.userInfo;
    const { budgetList } = dataSet.addCartData;
    const budgetData = budgetList.map((m) => {
      const { lovCode } = m;
      const url = `/hpfm/v1/${tenantId}/lov-view/info?viewCode=${lovCode}`;
      return new Promise((resolvea) => {
        request(url).then(async (res) => {
          if (res) {
            const { tableFields, queryFields, title, displayField, valueField } = res;
            const newvViewInfo = {
              lovRowKey: valueField,
              queryUrl: dataSet.handleUrl(res),
              columns: tableFields.map((n) => ({
                ...n,
                isQuery: queryFields.map((query) => query.field).includes(n.dataIndex),
              })),
              title,
              displayField,
              valueField,
            };
            let queryParams = {};
            // 水滴筹预算科目二开
            if (tenantNum === 'SRM-SDC') {
              if (lovCode === 'SCUX.SD.BUDGET_ACCOUNT') {
                queryParams = { tenantId, itemId };
              }
              if (lovCode === 'SCUX.SD_SBUD_UNIT') {
                queryParams = { tenantId, userId };
              }
            }
            const n = await dataSet.fetchLovData(queryParams, newvViewInfo, m);
            resolvea(n);
          }
        });
      });
    });
    return Promise.all(budgetData).then((r) => {
      return r;
    });
  }

  /**
   * 加入会员购购物车
   */
  async addToSiglCart({ product, fly }) {
    const { userId } = this.userInfo;
    const dataSet = this;
    const params = {
      productSource: product?.ecPlatform,
      ownerId: userId,
      productId: product.productId,
      quantity: 1,
      cartSource: 'FAVORITES',
    };
    dataSet.changeStore('spinning', true);
    addToSiglCartService(params)
      .then((res) => {
        if (res) {
          if (res.addType === 1) {
            fly();
          } else if (res.addType === 2) {
            SwalAlert(intl.get('mallf.common.noAddress.warning').d('请设置默认收货地址'));
          } else if (res.addType === 3) {
            SwalAlert(intl.get(`mallf.common.model.subscribe`).d('预订'));
          }
        }
      })
      .finally(() => {
        dataSet.changeStore('spinning', false);
      });
  }

  async addToCart({ dimensTemplates, product, ReceiveLovRef, ball = {}, addressRef }) {
    const dataSet = this;
    const { budgetList, currentAddress } = dataSet.addCartData;
    // 水滴筹二开预算带出默认值
    let newBudget = {};
    const {
      tenantNum,
      levelPath,
      companyId,
      tenantId,
      userId,
      invoiceOrgId,
      purchaseOrgId,
      organizationId,
      unitId,
      isNewCart,
      mallType,
    } = this.userInfo;
    if (mallType === 'sigl') {
      dataSet.addToSiglCart({ product, fly: () => ball?.running() });
      return;
    }
    if (tenantNum === 'SRM-SDC' && !isEmpty(budgetList)) {
      const budget = await dataSet.fetchViewinfo(product.itemId);
      budget.forEach((n) => {
        newBudget = { ...newBudget, ...n };
      });
    }
    // 二开预算带出默认值
    if (tenantNum === 'SRM-CSCMRO' && !isEmpty(budgetList)) {
      const data = await fetchMroBudget();
      newBudget = data || {};
    }
    const { addressId, invOrganizationId } = currentAddress || {};
    const params = {
      addressId,
      purchaseType: 'COMPANY',
      quantity: 1,
      invOrganizationId: invOrganizationId || invoiceOrgId,
      purOrganizationId: purchaseOrgId,
      productId: product.productId,
      productSource: product.ecPlatform,
      unitPrice: product.agreementPrice !== 0 ? product.agreementPrice || product.price : 0,
      latestPrice: product.agreementPrice !== 0 ? product.agreementPrice || product.price : 0,
      tenantId,
      companyId,
      organizationId,
      ownerId: userId,
      skuType: 0,
      levelPath,
      budget: JSON.stringify(newBudget),
      unitId,
      cartSource: 'FAVORITES',
    };
    const addressFlag = validAddress({ currentAddress, addressRef, product });
    if (!addressFlag) return;
    if (isNewCart) {
      addNewCart({
        addressRef,
        product,
        dimensTemplates,
        currentAddress,
        supplierCompanyId: product.supplierCompanyId,
        tmpQuantity: 1,
        cartSource: 'FAVORITES',
        ReceiveLovRef,
        setLoading: (val) => dataSet.changeStore('spinning', val),
        fly: () => ball.running(),
      });
      return;
    }
    dataSet.changeStore('spinning', true);
    addToCartService(params)
      .then((res) => {
        if (res) {
          if (res.addType === 1) {
            ball?.running();
            updateBudget([
              {
                ...res,
                budgetInfoList: [
                  {
                    budget: res.budget,
                    quantity: res.quantity,
                  },
                ],
              },
            ]).then(() => {
              ball?.running();
            });
          } else if (res.addType === 2) {
            SwalAlert(intl.get('mallf.myFavorite.noAddress.warning').d('请设置默认收货地址'));
          } else if (res.addType === 3) {
            ball?.running();
            SwalAlert(intl.get(`mallf.myFavorite.model.subscribe`).d('预订'));
          }
        }
      })
      .finally(() => {
        dataSet.changeStore('spinning', false);
      });
  }
}
