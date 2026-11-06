import React, { useEffect, useState, useRef } from 'react';
import { Checkbox, Tooltip, Modal, Icon, Popover, InputNumber, Button, Spin } from 'choerodon-ui';
import { NumberField, Table, DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { connect } from 'dva';
import { isEmpty, sum } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getUserConfigInfo, priceNumberRender, getPrecision } from 'utils/utils';
import Link from 'components/Link';
import Icons from 'components/Icons';
import Image from 'components/Image';
import Loading from 'components/loading';
import SwalAlert from 'components/swal';
import Search from 'components/NewMyMallSearch';
import {
  fetchShoppingBasket,
  fetchDefaultAddress,
  addToCart,
} from 'services/shoppingBasketService';
import { tableDs } from './tableDs';
import styles from './index.less';
import Operate from './Operate';

const { Sidebar } = Modal;

function ShoppingBasket(props) {
  const {
    companyId,
    purchaseOrgId,
    invoiceOrgId,
    levelPath,
    regionId,
    addressInfo,
    organizationId,
  } = getUserConfigInfo();
  const [loading, setLoading] = useState(false);
  const [spining, setSpining] = useState(false);
  const [pagination, setPagination] = useState({});
  const [basketList, setBasketList] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [basketNum, setBasketNum] = useState(1);
  const [visible, setVisible] = useState(false);
  const { dispatch } = props;

  const tableDataSet = useRef(new DataSet(tableDs(basketList))).current;

  const searchProps = {
    onSearch: queryShoppingBasket,
    configs: [
      {
        defaultFlag: true,
        fieldCode: 'productName',
        fieldName: intl.get('mallf.myMall.model.search.commodityNames').d('商品名称'),
      },
      {
        fieldCode: 'basketName',
        fieldName: intl.get(`mallf.common.view.buyPackageName`).d('采购套餐名称'),
      },
    ],
  };

  // 图片地址处理
  function HandleImgUrl(code, url) {
    // return code === 'CATA' ? url : Hmall.convertImg(url, 1, code);
    return url;
  }

  useEffect(() => {
    queryDefaultAddress();
  }, []);

  /**
   * 查询购物篮
   * @param {Object} params - 查询条件
   */
  function queryShoppingBasket(params = {}, defautlAddressId) {
    const { page = 0, ...other } = params;
    const requestAddressId = defautlAddressId || addressId;
    const queryParams = {
      page,
      size: 0,
      time_db: new Date().getTime(),
    };
    const bodyParams = {
      ...other,
      regionId,
      levelPath,
      enabledFlag: 1,
      addressId: requestAddressId,
      ecProductCheckDto: { ...addressInfo, tenantId: organizationId },
    };
    if (!(invoiceOrgId && purchaseOrgId)) {
      SwalAlert(
        `${intl.get('mallf.common.view.no.organization').d('请联系管理员维护采买组织或库存组织')}!`
      );
      return;
    }
    setLoading(true);
    fetchShoppingBasket(queryParams, bodyParams)
      .then((res) => {
        const { content: list = [], ...paginations } = res;
        list.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.productData = handleProductList(item.basketAssignList);
          // eslint-disable-next-line no-param-reassign
          item.toggle = false;
        });
        // 默认设置购物篮有效商品为选中状态
        const filterList = list.map((item) => {
          const { productData = {} } = item;
          const { indexList = [] } = productData;
          return {
            ...item,
            productData: {
              ...productData,
              indexList: indexList.map((p) => ({ ...p, checked: false })),
            },
          };
        });
        setBasketList(filterList);
        setPagination(paginations);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 查询默认地址
   */
  function queryDefaultAddress(params = {}) {
    const queryParams = {
      ...params,
      companyId,
      addressType: 'RECEIVER',
      time_db: new Date().getTime(),
    };
    fetchDefaultAddress(queryParams).then((res) => {
      if (res) {
        const { content = [] } = res;
        const { addressId: defautlAddressId } = content[0] || {};
        setAddressId(defautlAddressId);
        queryShoppingBasket({}, defautlAddressId);
      }
    });
  }

  /**
   * 加入购物车
   * @param {Object} item - 商品
   */
  function addCart(params = []) {
    const precisionCheck = params.some((item) => {
      return item.shoppingCartList.some((p) => {
        return (
          p.purchaseQuantity &&
          String(p.purchaseQuantity).split('.')?.[1]?.length > (p.uomPrecision || 0)
        );
      });
    });
    if (precisionCheck) return;
    if (addressId) {
      setSpining(true);
      addToCart(params, addressId)
        .then((res) => {
          if (res) {
            dispatch({
              type: 'global/update',
              payload: { showMiniCart: true },
            });
          } else {
            SwalAlert(res.message);
          }
        })
        .finally(() => {
          setSpining(false);
        });
    } else {
      SwalAlert(
        intl.get('mallf.myMall.view.basket.addCartFailed').d('当前账号无默认地址，请维护地址！')
      );
    }
  }

  async function handleBatchAddcart() {
    const flag = await tableDataSet.validate(true);
    const params = tableDataSet.selected.map((s) => s.toData());
    if (flag) {
      addCart(params);
      setVisible(false);
    }
  }

  function handleOpenModal() {
    const dsData = basketList.map((basket) => {
      const {
        basketName,
        productData: { indexList },
      } = basket;
      const checkList = indexList.filter((n) => n.checked);
      return {
        basketName,
        purchaseQuantity: checkList.length,
        productTotalNum: sum(checkList.map((n) => n.purchaseQuantity || 0)),
        marketBasketQuantity: 1,
        shoppingCartList: checkList,
      };
    });
    setVisible(true);
    tableDataSet.loadData(dsData);
  }

  function handleProductList(list = []) {
    return {
      indexList: list, // 当前购物篮渲染的商品
      current: 1, // 当前页码
      pageSize: 999999999, // 每页显示条数
      totalPage: 1, // 总页数
    };
  }

  /**
   * 收起/展开商品
   */
  function toggleBasket(index) {
    const newList = [...basketList];
    newList[index].toggle = !newList[index].toggle;
    setBasketList(newList);
  }

  // 有效期处理
  function handleTime(time) {
    return time && time.split(' ')[0].slice(0, 10);
  }

  /**
   * 购物篮商品选中/取消
   */
  const toggleChecked = (checked, params = {}) => {
    const { index = -1, id = '' } = params;
    if (index >= 0) {
      const { productData = {} } = basketList[index] || [];
      const { indexList } = productData;
      const ind = indexList.findIndex((item) => item.productId === id);
      if (ind !== -1) {
        indexList[ind] = { ...indexList[ind], checked };
        basketList[index] = { ...basketList[index], indexList };
        setBasketList([...basketList]);
      }
    }
  };

  function handleChangeNum(val, index, productIndex) {
    const newBasketList = basketList;
    newBasketList[index].productData.indexList[productIndex].purchaseQuantity = val;
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
      title: intl.get('mallf.myMall.view.sureNum').d('确认数量'),
      width: 460,
      content: (
        <div className="content-modal-confirm">
          {intl
            .getHTML('mallf.common.shoppingbasket.confirm.Num', {
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
        <div style={{ display: 'flex' }}>
          <InputNumber
            value={basketNum}
            style={{ width: 120 }}
            label={intl.get('mallf.common.model.basketNum').d('采购套餐数量')}
            min={1}
            max={999999999}
            step={1}
            precision={0}
            onChange={(val) => setBasketNum(val)}
          />
          <div className="popover-basket-footer">
            <Button className="basket-footer-add" onClick={() => handleAddCart(checkedList)}>
              {intl.get('mallf.common.model.addToCart').d('加入购物车')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  /**
   * 加载购物篮列表
   */
  function renderBasket(item, index) {
    const {
      basketName,
      startDate,
      endDate,
      remark,
      toggle,
      effectiveDays,
      productData: { indexList = [] },
    } = item;
    const checkedList = indexList.filter((p) => p.checked); // 勾选的数据
    const isAddCart = checkedList.length > 0; // 是否可以加入购物车
    const countDownDays = moment(endDate).diff(moment(startDate), 'days');
    let countDown = 'count-down-green';
    if (countDownDays > 2 && countDownDays < 8) {
      countDown = 'count-down-yellow';
    } else if (countDownDays < 3) {
      countDown = 'count-down-red';
    }
    const allCheckFlag =
      !isEmpty(indexList.filter((p) => p.productFlag)) &&
      indexList.filter((p) => p.productFlag).every((p) => p.checked);
    return (
      <div className="basket-list-info">
        <div className="basket-title">
          <div className="left">
            <Checkbox
              className="checked-box-all"
              disabled={indexList.every((p) => p.productFlag === 0)}
              checked={allCheckFlag}
              onChange={(e) => {
                const newList =
                  basketList[index]?.productData?.indexList?.map((p) => ({
                    ...p,
                    checked: +p.productFlag ? e.target.checked : false,
                  })) || [];
                setBasketList((prev) => {
                  const newPrev = [...prev];
                  newPrev[index] = {
                    ...newPrev[index],
                    indexList: newList,
                    productData: { ...newPrev[index].productData, indexList: newList },
                  };
                  return newPrev;
                });
              }}
            />
            <span className="basket-user">
              {basketName} ({indexList.length})
            </span>
            <Tooltip
              title={
                <>
                  <div>
                    {intl.get('mallf.common.view.countDown').d('倒计时')}：{effectiveDays}
                    {intl.get('hzero.common.date.unit.day').d('天')}
                  </div>
                  <div>
                    <span>
                      {intl.get(`mallf.myMall.view.basket.validityPeriod`).d('有效期')}：
                      {handleTime(startDate)} - {handleTime(endDate)}
                    </span>
                  </div>
                </>
              }
              placement="top"
            >
              <span className={`basket-time ${countDown}`}>
                <Icon type="update" className="update-icon" />
                {effectiveDays}
                {intl.get('hzero.common.date.unit.day').d('天')}
              </span>
            </Tooltip>
            <div className="basket-remark">{remark || ''}</div>
          </div>
          <div className={isAddCart ? 'addcart' : 'no-addcart'}>
            {isAddCart ? (
              <Popover
                title={null}
                placement="bottom"
                onVisibleChange={(v) => {
                  if (!v) setBasketNum(1);
                }}
                content={renderContent(checkedList)}
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
        <div className={`basket-list ${toggle ? '' : 'basket-fold'}`}>
          {indexList.map((product, productIndex) => {
            const { uomPrecision } = product;
            const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
            return (
              <div
                className={`basket-item ${product.productFlag === 1 ? '' : 'basket-item-disabled'}`}
              >
                <Checkbox
                  disabled={product.productFlag === 0}
                  className="checked-box"
                  checked={product.productFlag === 1 && product.checked}
                  onChange={(e) =>
                    toggleChecked(e.target.checked, { index, id: product.productId })
                  }
                />
                <Link
                  className="product-link"
                  to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceFrom}`}
                >
                  <div className="image-container">
                    <Image
                      value={HandleImgUrl(product.sourceFrom, product.imagePath)}
                      width={38}
                      height={38}
                      defaultChecked
                      showCheckbox
                    />
                  </div>
                  <div title={product.productName} className="product-name">
                    {product.productName}
                    <div className="product-price">
                      {priceNumberRender(product.price, product?.defaultPrecision)}
                    </div>
                  </div>
                </Link>
                {product.productFlag === 1 ? (
                  <NumberField
                    min={defaultValue}
                    step={defaultValue}
                    // max={999999999}
                    precision={uomPrecision}
                    onChange={(val) =>
                      handleChangeNum(val < 999999999 ? val : 999999999, index, productIndex)
                    }
                    value={product.purchaseQuantity || 1}
                    style={{ width: 80 }}
                    formatter={(value) => {
                      if (!isNaN(+value) && String(value)?.endsWith('0')) {
                        return +value;
                      } else {
                        return value;
                      }
                    }}
                  />
                ) : (
                  <p style={{ color: '#999' }}>
                    {intl.get(`mallf.myMall.view.basket.productExpired`).d('商品已失效')}
                  </p>
                )}
                <Operate product={product} addCart={addCart} />
              </div>
            );
          })}
        </div>
        <div className="toggle-btn" onClick={() => toggleBasket(index)}>
          {indexList.length > 6 ? (
            toggle ? (
              <span>
                {intl.get(`mallf.myMall.view.basket.lessProduct`).d('收起商品')}
                <Icons size="12" type="pull" />
              </span>
            ) : (
              <span>
                {intl.get(`mallf.myMall.view.basket.moreProduct`).d('展开商品')}
                <Icons size="12" type="down" />
              </span>
            )
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }

  const columns = [
    {
      name: 'basketName',
    },
    {
      name: 'purchaseQuantity',
    },
    {
      name: 'productTotalNum',
    },
    {
      name: 'marketBasketQuantity',
      editor: () => <NumberField step={1} min={1} clearButton={false} />,
    },
  ];

  const batchAddCartFlag = basketList?.some((b) => b.indexList?.some((i) => i.checked));
  const AddCartButoon = observer(({ dataSet }) => {
    return (
      <Button
        funcType="raised"
        className="c7n-btn-primary"
        onClick={handleBatchAddcart}
        disabled={dataSet.selected.length < 1}
      >
        {intl.get('mallf.common.model.addToCart').d('加入购物车')}
      </Button>
    );
  });
  return (
    <div className={styles['basket-container']}>
      <div className="basket-header">
        <div className="basket">
          {intl.get(`mallf.myMall.view.basket.buyPackage`).d('采购套餐')}（
          {pagination.totalElements}）
        </div>
      </div>
      <div className="basket-top">
        <Button
          icon="add_shopping_cart-o"
          onClick={() => handleOpenModal()}
          disabled={!batchAddCartFlag}
        >
          {intl.get('mallf.common.view.batchAddCart').d('批量加入购物车')}
        </Button>
        <Search style={{ flex: 1 }} {...searchProps} />
      </div>
      <div className="basket-content">
        {loading ? (
          <Loading />
        ) : basketList.length > 0 ? (
          <Spin spinning={spining}>
            {basketList.map((item, index) => renderBasket(item, index))}
            {/* <div className="basket-list-page">
              <Pagination
                zeroStart
                showQuickJumper
                {...pagination}
                onForward={queryShoppingBasket}
              />
            </div> */}
          </Spin>
        ) : (
          <div className="empty-product">
            <div className="info">
              {intl.get(`mallf.common.view.buyPackageNull`).d('暂无采购套餐')}
            </div>
          </div>
        )}
      </div>
      <Sidebar
        title={intl.get('mallf.common.view.batchAddCart').d('批量加入购物车')}
        visible={visible}
        // onOk={handleBatchAddcart}
        onCancel={() => setVisible(false)}
        // okText={intl.get('mallf.common.model.addToCart').d('加入购物车')}
        closable
        footer={[
          <AddCartButoon dataSet={tableDataSet} />,
          <Button
            funcType="raised"
            className="c7n-modal-btn-cancel"
            onClick={() => setVisible(false)}
          >
            {intl.get('hzero.common.btn.cancel').d('取消')}
          </Button>,
        ]}
      >
        <Table dataSet={tableDataSet} columns={columns} />
      </Sidebar>
    </div>
  );
}

export default connect()(ShoppingBasket);
