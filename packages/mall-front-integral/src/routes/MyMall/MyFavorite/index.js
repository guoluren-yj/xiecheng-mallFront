import React, { useEffect, useState, Fragment } from 'react';
import { Radio, Form, Row, Col, Input, Icon as HIcon, Spin } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import classnames from 'classnames';
import { connect } from 'dva';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import SwalAlert from 'components/swal';
import Loading from 'components/loading';
import Pagination from 'components/Pagination';
import {
  fetchMyFavoriteList,
  deleteFavorite,
  batchDelete,
  clearProduct,
} from 'services/favoriteCommentService';
import ProductCard from 'components/ProductCard';
import useProductCardConfig from 'hooks/useProductCardConfig';
import { addToCartService } from '@/services/cartService';
import { fetchProductLabel } from 'services/productDetailService';
import { checkSaleBySagm, queryStock } from 'services/homeService';
import styles from './index.less';
import Operate from './Operate';

const comsize = 16;
function MyFavorite(props) {
  const {
    purchaseType,
    regionId,
    organizationId,
    firstRegionId,
    secondRegionId,
    addressInfo,
    levelPath,
    userId,
  } = Hmall.getUserConfigInfo();
  const productCardConfig = useProductCardConfig();
  const { getFieldDecorator } = props.form;
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

  const { dispatch } = props;

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
    // if (firstRegionId) {
    fetchMyFavoriteList(queryParams).then((res) => {
      setInvalidNum(res.totalElements);
    });
    // }
  }, []);

  useEffect(() => {
    // if (firstRegionId) {
    queryMyFavoriteList();
    // }
  }, [radioValue]);

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
      channel: 'PERSONAL',
    };
    clearProduct(queryParams).then((res) => {
      if (res) {
        queryMyFavoriteList();
        setSelectProducts([]);
      }
    });
  };

  /**
   * 加入购物车
   */
  const addToCart = async (product) => {
    const params = {
      productSource: product?.ecPlatform,
      ownerId: userId,
      productId: product.productId,
      quantity: 1,
      cartSource: 'FAVORITES',
    };
    setSpinnig(true);
    addToCartService(params)
      .then((res) => {
        if (res) {
          if (res.addType === 1) {
            dispatch({
              type: 'global/update',
              payload: { showMiniCart: true },
            });
          } else if (res.addType === 2) {
            SwalAlert(intl.get('mallf.common.noAddress.warning').d('请设置默认收货地址'));
          } else if (res.addType === 3) {
            SwalAlert(intl.get(`mallf.common.model.subscribe`).d('预订'));
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
        const productIds = list.map((n) => n.productId);
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
            const { skuStock, stockState } =
              stcokList?.find(
                (s) => s.skuId === (p.productSource === 'CATA' ? p.skuCode : p.thirdSkuCode)
              ) || {}; // 库存
            const isFind = r?.find((i) => i.skuId === p.productId);
            const stockNumMeaning =
              radioValue === 'invalid'
                ? '-'
                : Hmall.getStockNumMeaning(stockState, skuStock, {
                    isReceive: isFind?.agreementBusinessType === 'RECEIVE',
                  });
            const { productLabelDTOList } = labels?.find((i) => i.productId === p.productId) || {};
            if (isFind) {
              return {
                ...p,
                stockNumMeaning,
                supplierCompanyId: isFind.supplierCompanyId,
                sellPrice: isFind.sellPrice,
                showSupplierName: isFind.showSupplierName,
                supplierCompanyName: isFind.showSupplierName,
                currencySymbol: isFind?.currencySymbol,
                pointsTypeName: isFind?.pointsTypeName,
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
    //   `${intl.get('mallf.myMall.view.myFavorite.deleteProduct').d('确认从收藏栏移除该商品')}？`,
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
    //   `${intl.get('mallf.myMall.view.myFavorite.deleteProduct').d('确认从收藏栏移除该商品')}？`,
    //   true
    // ).then((res) => {
    //   if (res.value) {
    //     batchDelete(params).then(() => {
    //       queryMyFavoriteList();
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
              {intl.get('mallf.myMall.view.favorite.effectiveGoods').d('有效商品')}&nbsp;
              <span>{validNum > 999 ? '999+' : validNum}</span>
            </Radio.Button>
            {/* <Divider type="vertical" /> */}
            <Radio.Button value="invalid" disabled={loading}>
              {intl.get('mallf.myMall.view.favorite.failedGoods').d('失效商品')}&nbsp;
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
                  {intl.get('mallf.common.clear.all.validProduct').d('清空失效商品')}
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
                    .get('mallf.myMall.view.search.searchInfoName')
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
            <Spin spinning={spinning}>{productList.map((item) => renderProduct(item))}</Spin>
            <Pagination
              style={{ width: '100%', marginTop: 24 }}
              zeroStart
              showQuickJumper
              {...pagination}
              onForward={queryMyFavoriteList}
            />
          </Fragment>
        ) : (
          <div className="empty-product">
            <div className="info">
              {intl.get('mallf.myMall.view.favorite.noProducts').d('暂无商品')}
            </div>
          </div>
        )}
      </div>
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
