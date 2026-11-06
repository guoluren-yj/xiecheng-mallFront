import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Radio, Form, Row, Col, Input, Icon as HIcon, Spin } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty, compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { updateBudget } from 'services/cartService';
import { getOpenCartFlag } from 'utils/configUtils';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import SwalAlert from 'components/swal';
import Loading from 'components/loading';
import Pagination from 'components/Pagination';
import ProductCard from 'components/ProductCard';
import { ReceiveLov } from 'components/C7nProLov/commons';
import AddressLov from 'components/AddressLov';
import useProductCardConfig from 'hooks/useProductCardConfig';
import {
  fetchMyFavoriteList,
  deleteFavorite,
  batchDelete,
  clearProduct,
} from 'services/favoriteCommentService';
import { fetchProductLabel } from '@/services/productDetailService';
import { addToCartService } from 'services/productListService';
import {
  // fetchSubInvoiceList,
  // fetchSubPurchaseList,
  fetchBudgetLov,
} from 'services/productDetailService';
import { checkSaleBySagm, queryStock } from 'services/homeService';
import { addNewCart, validAddress } from 'utils/addNewCart';
import request from 'utils/request';
import HmallConfig from 'utils/api-config';
import { openComfirmModal } from 'utils/modals';
import styles from './index.less';
import Operate from './Operate';

const comsize = 16;
function MyFavorite(props) {
  const {
    purchaseType,
    regionId,
    firstRegionId,
    secondRegionId,
    levelPath,
    companyId,
    invoiceOrgId,
    purchaseOrgId,
    tenantId,
    organizationId,
    userId,
    addressInfo,
    userInfo: { tenantNum },
    unitId,
    budgetSwitch,
    isNewCart,
    defaultAddress,
  } = Hmall.getUserConfigInfo();
  const productCardConfig = useProductCardConfig();
  const { getFieldDecorator } = props.form;
  const addressRef = useRef();
  const ReceiveLovRef = useRef();
  // const [subInvoice, SetSubInvoice] = useState([]);
  // const [subPurchase, SetSubPurchase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinnig] = useState(false);
  const [manage] = useState(true);
  const [invalidNum, setInvalidNum] = useState('');
  const [selectProducts, setSelectProducts] = useState([]);
  const [validNum, setValidNum] = useState('');
  const [productList, setProductListData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [radioValue, setRadioValue] = useState('valid');
  const [queryData, setQueryData] = useState({
    page: 0,
    size: comsize,
  });
  const [budgetList, setBudgetList] = useState([]);
  const dimensTemplates = useDimensTemplates();
  const [currentAddress, setCurrentAddress] = useState(
    !isEmpty(defaultAddress) ? defaultAddress : Hmall.getCacheAddress()
  );

  const { dispatch } = props;
  // 获取预算值集
  useEffect(() => {
    if (budgetSwitch === '1') {
      fetchBudgetLov().then((res) => {
        if (res) {
          setBudgetList(res);
        }
      });
    }
  }, [budgetSwitch]);

  useEffect(() => {
    // 查询失效数量
    const queryParams = {
      ...queryData,
      size: comsize,
      purchaseType: purchaseType && purchaseType.toUpperCase(),
      firstRegionId,
      secondRegionId,
      levelPath,
      shelfFlag: 0,
    };
    fetchMyFavoriteList(queryParams).then((res) => {
      setInvalidNum(res.totalElements);
    });
  }, []);

  // useEffect(() => {
  //   fetchsubInvoiceList();
  //   fetchsubPurchaseList();
  // }, []);

  useEffect(() => {
    queryMyFavoriteList();
  }, [radioValue]);

  // 查询采购组织和库存组织
  // const fetchsubInvoiceList = () => {
  //   fetchSubInvoiceList().then((res) => {
  //     if (res) {
  //       const { content = [] } = res;
  //       if (content.length > 0) {
  //         SetSubInvoice(content);
  //       }
  //     }
  //   });
  // };
  // const fetchsubPurchaseList = () => {
  //   fetchSubPurchaseList().then((res) => {
  //     if (res) {
  //       const { content = [] } = res;
  //       if (content.length > 0) {
  //         SetSubPurchase(content);
  //       }
  //     }
  //   });
  // };

  const clearAllInvlideProduct = () => {
    const formData = props.form.getFieldsValue();
    const queryParams = {
      ...queryData,
      ...formData,
      size: comsize,
      purchaseType: purchaseType && purchaseType.toUpperCase(),
      firstRegionId,
      secondRegionId,
      levelPath,
      shelfFlag: 0,
    };
    clearProduct(queryParams).then((res) => {
      if (res) {
        queryMyFavoriteList();
        setSelectProducts([]);
      }
    });
  };

  /**
   * lov数据请求url
   * @param {*} lovViewConfig - lov视图配置参数
   */
  function handleUrl(lovViewConfig = {}) {
    const { lovTypeCode, queryUrl: lovQueryUrl, lovCode } = lovViewConfig;
    const newQueryUrl =
      lovTypeCode === 'URL'
        ? Hmall.generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`)
        : Hmall.generateUrlWithGetParam(`${HmallConfig.apiGateway}${lovQueryUrl}`, {
            lovCode,
          });
    return newQueryUrl.indexOf('{organizationId}')
      ? newQueryUrl.replace('{organizationId}', tenantId)
      : newQueryUrl;
  }

  // 查询值集视图配置
  function fetchViewinfo(itemId) {
    const budgetData = budgetList.map((m) => {
      const { lovCode } = m;
      const url = `/hpfm/v1/${tenantId}/lov-view/info?viewCode=${lovCode}`;
      return new Promise((resolvea) => {
        request(url).then(async (res) => {
          if (res) {
            const { tableFields, queryFields, title, displayField, valueField } = res;
            const newvViewInfo = {
              lovRowKey: valueField,
              queryUrl: handleUrl(res),
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
            const n = await fetchLovData(queryParams, newvViewInfo, m);
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
   * 请求Lov数据
   * @param {string} page 分页
   */
  function fetchLovData(qdata = {}, viewInfo, budgetItem) {
    const { fieldName } = budgetItem;
    const filterNullQuery = Hmall.filterNullValueObject({
      ...qdata,
    });
    const { displayField, valueField, queryUrl } = viewInfo;
    const newUrl = Hmall.generateUrlWithGetParam(queryUrl, filterNullQuery);
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

  function fetchMroBudget() {
    const url = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cscro-budget-defaults/get`;
    return request(url, { query: { userId, companyId } });
  }

  /**
   * 加入购物车
   */
  const addToCart = async (product, ball) => {
    // 水滴筹二开预算带出默认值
    let newBudget = {};
    if (tenantNum === 'SRM-SDC' && !isEmpty(budgetList)) {
      const budget = await fetchViewinfo(product.itemId);
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
      purchaseType,
      quantity: 1,
      invOrganizationId: invOrganizationId || invoiceOrgId,
      purOrganizationId: purchaseOrgId,
      productId: product.productId,
      productSource: product.ecPlatform,
      unitPrice: Hmall.numberRender(
        product.agreementPrice !== 0 ? product.agreementPrice || product.price : 0,
        2
      ),
      latestPrice: Hmall.numberRender(
        product.agreementPrice !== 0 ? product.agreementPrice || product.price : 0,
        2
      ),
      tenantId,
      companyId,
      organizationId,
      ownerId: userId,
      skuType: 0,
      levelPath,
      budget: JSON.stringify(newBudget),
      unitId,
      cartSource: 'FAVORITES',
      openCartFlag: getOpenCartFlag() ? 1 : 0,
    };
    const addressFlag = validAddress({ currentAddress, addressRef, product });
    if (!addressFlag) return;
    if (isNewCart) {
      addNewCart({
        product,
        dimensTemplates,
        currentAddress,
        supplierCompanyId: product.supplierCompanyId,
        tmpQuantity: 1,
        cartSource: 'FAVORITES',
        openCartFlag: getOpenCartFlag() ? 1 : 0,
        ReceiveLovRef,
        setLoading: (val) => setSpinnig(val),
        fly: () => {
          ball.running();
          dispatch({
            type: 'global/update',
            payload: { showMiniCart: true },
          });
        },
      });
      return;
    }
    setSpinnig(true);
    addToCartService(params)
      .then((res) => {
        const comOrPerson =
          sessionStorage.getItem('comOrPersonRule') &&
          !!Number(sessionStorage.getItem('comOrPersonRule')); // 1为个人，0为公司
        if (res) {
          if (res.addType === 1) {
            ball.running();
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
              ball.running();
            });
          } else if (res.addType === 2) {
            if (comOrPerson) {
              // 1为个人，0为公司
              // setAddressVisible(true);
            } else {
              // SwalAlert(intl.get('mallf.myFavorite.noAddress.warning').d('请设置默认收货地址'));
            }
            SwalAlert(intl.get('mallf.myFavorite.noAddress.warning').d('请设置默认收货地址'));
          } else if (res.addType === 3) {
            ball.running();
            SwalAlert(intl.get(`mallf.myFavorite.model.subscribe`).d('预订'));
          }
        }
      })
      .finally(() => {
        setSpinnig(false);
      });
  };

  /**
   * 查询收藏商品列表
   * @param {Object} params - 查询条件
   */
  function queryMyFavoriteList(params = {}) {
    let shelfFlag;
    const formData = props.form.getFieldsValue();
    if (radioValue === 'valid') {
      shelfFlag = 1;
    } else {
      shelfFlag = 0;
    }
    const queryParams = {
      ...queryData,
      ...params,
      ...formData,
      size: params.size || comsize,
      purchaseType: purchaseType && purchaseType.toUpperCase(),
      firstRegionId,
      secondRegionId,
      levelPath,
      shelfFlag,
    };
    setLoading(true);
    fetchMyFavoriteList(queryParams)
      .then((res) => {
        if (queryParams.shelfFlag === 1) {
          setValidNum(res.totalElements);
        } else {
          setInvalidNum(res.totalElements);
        }
        const { content: list = [], ...paging } = res;
        // setProductListData(list);
        setPagination(paging);

        // const uomParams = {
        //   productDTOS: list.map((p) => ({ productId: p.productId, sourceFrom: p.ecPlatFrom })),
        //   levelPath,
        //   companyId,
        //   regionId,
        // };
        if (list?.length <= 0) {
          setProductListData(list);
          setLoading(false);
          return;
        }
        // fetchUom(uomParams).then((r) => {
        //   if (r) {
        //     const { result = [], resultMessage, success } = r;
        //     if (!success && resultMessage) {
        //       SwalAlert(resultMessage);
        //       return;
        //     }

        //   }
        // });
        // 查询价格服务可售参数
        const skuParamDTOS = res.content?.map((m) => ({
          quantity: 1,
          skuId: m.productId,
          sourceFrom: m.ecPlatform,
        }));
        const productIds = res.content?.map((m) => m.productId);
        const ecProductCheckDto = {
          tenantId: organizationId,
          ...addressInfo,
        };
        const priceParams = {
          regionId,
          skuParamDTOS,
          ecProductCheckDto,
          queryEcPriceFlag: true,
          unitLevelPath: levelPath,
        };
        const stockParams = {
          ...addressInfo,
          tenantId: organizationId,
          batchSkuIds: list.map((g) => ({
            skuId: g.productSource === 'CATA' ? g.skuCode : g.thirdSkuCode,
            supplierCode: g.ecPlatform,
            categoryCode: g.categoryCode,
          })),
        };
        // 过滤punchOut商品
        // const productIds = list.map((n) => n.productId);
        setProductListData(list);
        Promise.all([
          checkSaleBySagm(priceParams),
          fetchProductLabel(productIds),
          queryStock(stockParams),
        ]).then((result) => {
          const r = result[0] || []; // 价格，供应商
          const labels = result[1] || []; // 标签
          const { result: stcokList = [] } = result[2] || {}; // 库存
          const newData = list.map((p) => {
            const isFind = r?.find((i) => i.skuId === p.productId); // 价格，供应商
            const { skuStock, stockState } =
              stcokList?.find(
                (s) => s.skuId === (p.productSource === 'CATA' ? p.skuCode : p.thirdSkuCode)
              ) || {}; // 库存
            const { productLabelDTOList } = labels?.find((i) => i.productId === p.productId) || {};
            const stockNumMeaning =
              radioValue === 'invalid'
                ? '-'
                : Hmall.getStockNumMeaning(stockState, skuStock, {
                    isReceive: isFind?.agreementBusinessType === 'RECEIVE',
                  });
            if (isFind) {
              return {
                ...p,
                stockNumMeaning,
                saleAgreementId: isFind.saleAgreementId,
                agreementBusinessType: isFind.agreementBusinessType,
                supplierCompanyId: isFind.supplierCompanyId,
                sellPrice: isFind.sellPrice,
                showSupplierName: isFind.showSupplierName,
                supplierCompanyName: isFind.showSupplierName,
                currencySymbol: isFind?.currencySymbol,
                uomName: isFind?.uomName,
                labelList: productLabelDTOList,
                quantity: p.saleQuantity,
                sourceFromCode: p.ecPlatform,
              };
            } else {
              return p;
            }
          });
          setProductListData(newData);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 移除收藏
   * @param {Object} item - 移除商品
   */
  function deleteFavoriteProduct(item) {
    openComfirmModal({
      title: intl.get('mallf.myFavorite.confirm.title.confirmDelete').d('确认删除'),
      children: intl
        .get('mallf.myFavorite.view.myFavorite.deleteProduct')
        .d('确认从收藏栏移除该商品?'),
      onOk() {
        deleteFavorite(item).then(() => {
          queryMyFavoriteList();
        });
      },
    });
    // SwalAlert(
    //   intl.get('mallf.myFavorite.view.myFavorite.deleteProduct').d('确认从收藏栏移除该商品?'),
    //   true
    // ).then((res) => {
    //   if (res.value) {
    //     deleteFavorite(item).then(() => {
    //       queryMyFavoriteList();
    //     });
    //   }
    // });
  }

  /**
   * 有效失效商品切换
   */
  function onRadioChange(e) {
    props.form.resetFields();
    setRadioValue(e.target.value);
    setQueryData({
      ...queryData,
      shelfFlag: Number(!queryData.shelfFlag),
    });
  }

  /**
   * 删除选中的商品
   * @param 选中的商品
   */
  function deleteSelect(params) {
    openComfirmModal({
      title: intl.get('mallf.myFavorite.confirm.title.confirmDelete').d('确认删除'),
      children: intl
        .get('mallf.myFavorite.view.myFavorite.deleteProduct')
        .d('确认从收藏栏移除该商品?'),
      onOk() {
        batchDelete(params).then(() => {
          queryMyFavoriteList();
          setSelectProducts([]);
        });
      },
    });
    // SwalAlert(
    //   intl.get('mallf.myFavorite.view.myFavorite.deleteProduct').d('确认从收藏栏移除该商品?'),
    //   true
    // ).then((res) => {
    //   if (res.value) {
    //     batchDelete(params).then(() => {
    //       queryMyFavoriteList();
    //       setSelectProducts([]);
    //     });
    //   }
    // });
  }

  /**
   * 加载收藏商品列表
   */
  function renderProduct(item) {
    return (
      <div
        className={classnames({
          'product-wrap': true,
          'wrap-invalid': radioValue === 'invalid',
          'wrap-manage': manage && radioValue === 'invalid',
        })}
      >
        {manage && radioValue === 'invalid' && (
          <div
            className={classnames({
              'product-batch': true,
              active: selectProducts.some((p) => p.productId === item.productId),
            })}
            onClick={() => {
              if (selectProducts.some((p) => p.productId === item.productId)) {
                setSelectProducts(selectProducts.filter((p) => p.productId !== item.productId));
              } else {
                setSelectProducts(selectProducts.concat(item));
              }
            }}
          >
            <HIcon type="check" />
          </div>
        )}
        <ProductCard
          productCardConfig={productCardConfig}
          product={item}
          wraperClass="product-wrap-favorite"
        />
        {radioValue === 'valid' ? (
          <>
            <Operate
              dispatch={dispatch}
              item={item}
              deleteFavoriteProduct={deleteFavoriteProduct}
              addToCart={addToCart}
            />
          </>
        ) : (
          <div className="product-invalid">
            <Icon type="block" style={{ fontSize: 12, marginRight: 7 }} />
            {intl.get('mallf.myFavorite.view.favorite.productExpired').d('商品已失效')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles['favorite-container']}>
      <Row style={{ marginBottom: 7 }}>
        <Col span={10}>
          <Radio.Group
            className="favorite-Radio"
            onChange={onRadioChange}
            value={radioValue}
            style={{ float: 'left' }}
            size="large"
          >
            <Radio.Button value="valid" disabled={loading}>
              {intl.get('mallf.myFavorite.view.favorite.effectiveGoods').d('有效商品')}&nbsp;
              <span>{validNum > 999 ? '999+' : validNum}</span>
            </Radio.Button>
            {/* <Divider type="vertical" /> */}
            <Radio.Button value="invalid" disabled={loading}>
              {intl.get('mallf.myFavorite.view.favorite.failedGoods').d('失效商品')}&nbsp;
              <span>{invalidNum > 999 ? '999+' : invalidNum}</span>
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={7} className="btn-options">
          {radioValue === 'invalid' && (
            <div>
              <>
                <span
                  className={classnames({
                    'delete-btn': true,
                    disable: selectProducts.length === 0,
                  })}
                  onClick={() => {
                    if (selectProducts.length === 0) return;
                    deleteSelect(selectProducts);
                  }}
                >
                  <Icon style={{ fontSize: 14, marginTop: -2, marginRight: 5 }} type="delete" />
                  {intl.get('hzero.common.status.delete').d('删除')}
                </span>
                <span
                  className="select-all"
                  onClick={() => {
                    clearAllInvlideProduct();
                  }}
                >
                  <Icon
                    style={{ fontSize: 14, marginTop: -2, marginRight: 5 }}
                    type="delete_sweep"
                  />
                  {intl.get('mallf.myFavorite.clear.all.validProduct').d('清空失效商品')}
                </span>
              </>
            </div>
          )}
        </Col>
        <Col span={7} style={{ textAlign: 'right' }}>
          <Form>
            <Form.Item>
              {getFieldDecorator('productName')(
                <Input.Search
                  placeholder={intl
                    .get('mallf.myFavorite.view.search.searchInfoName')
                    .d('请输入商品名称')}
                  onSearch={() => queryMyFavoriteList()}
                  style={{ width: 250 }}
                />
              )}
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <div className="favorite-list-info">
        {loading ? (
          <Loading />
        ) : productList.length > 0 ? (
          <Fragment>
            <Spin spinning={spinning}>
              <div className="content-list">{productList.map((item) => renderProduct(item))}</div>
            </Spin>
            <Pagination
              style={{ width: '100%', marginTop: 15 }}
              zeroStart
              showQuickJumper
              {...pagination}
              onForward={queryMyFavoriteList}
            />
          </Fragment>
        ) : (
          <div className="empty-product">
            <div className="info">
              {intl.get('mallf.myFavorite.view.favorite.noProducts').d('暂无商品')}
            </div>
          </div>
        )}
      </div>
      <ReceiveLov
        onChange={(data) => {
          const { product, fly } = ReceiveLovRef.current;
          addNewCart({
            product,
            dimensTemplates,
            currentAddress,
            supplierCompanyId: product.supplierCompanyId,
            tmpQuantity: 1,
            cartSource: 'FAVORITES',
            openCartFlag: getOpenCartFlag() ? 1 : 0,
            ReceiveLovRef,
            fly,
            setLoading: (val) => setSpinnig(val),
            currentWarehouse: {
              warehouseId: data.inventoryId,
              warehouseName: data.inventoryName,
              warehouseAddress: data.address,
            },
          });
        }}
        onRef={ReceiveLovRef}
        mode="button"
        className="address-lov"
      />
      <AddressLov
        mode="button"
        className="address-lov"
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
  Form.create({ fieldNameProp: null }),
  formatterCollections({
    code: ['mallf.myFavorite'],
  })
)(MyFavorite);
