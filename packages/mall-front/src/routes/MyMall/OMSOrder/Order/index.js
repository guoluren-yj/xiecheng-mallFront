/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo } from 'react';
import qs from 'qs';
import classNames from 'classnames';
import { Row, Col, message, Icon } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { debounce, isEmpty } from 'lodash';

import intl from 'utils/intl';
import {
  fetchConfirm,
  fetchOrderAgain,
  fetchOrderCentent,
  fetchOrderStatusCount,
} from 'services/orderCenterService';
import SwalAlert from 'components/swal';
import Icons from 'components/Icons';
import { getUserConfigInfo } from 'utils/utils';
import useState from '@/hooks/useState';
import useLoading from '@/hooks/useLoading';

import TabButtons from 'components/TabButtons';
import { afterBuyAgain } from 'utils/addNewCart';
import style from './index.less';
import OrderComponent from './OrderComponent';
import SearchModal from './SearchModal';
import AcceptModal from '../common/AcceptModal';
import Search from '../common/Search';
import SearchInfo from '../common/SearchInfo';
import { Context } from '../common/Context';
import CommentModal from '../common/CommentModal';
import AcceptRecord from '@/routes/OrderDetail/AssociatedDoc';

const checkBoxList = ['WAITING_PAY', 'WAITING_RECEIVE'];

function OrderCenter({ labelList, history }) {
  const { displayStatus } = qs.parse(location.search.substr(1));
  const [state, setState] = useState({
    confirmLoading: false,
    searchVisible: false,
    acceptVisible: false,
    currentStatus: displayStatus || '',
    list: [],
    receiveList: [],
    pagination: {},
    count: {
      allNum: 0,
      pending: 0,
      waitSent: 0,
      waitReceive: 0,
      assess: 0,
    },
    query: {
      page: 0,
      size: 10,
    },
    textFieldVal: '',
    asnLineIds: [],
    checkedList: [],
    acceptType,
    searchMoreParams: {},
    label: {
      poNum: intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号'),
      productName: intl.get('mallf.myOrder.view.productName').d('商品名称'),
      srmPoNum: intl.get('mallf.myOrder.view.catalog.purchaseOrderNum').d('采购订单号'),
      prNum: intl.get('mallf.myOrder.model.purchaseApplicationNum').d('采购申请号'),
      ecPoNum: intl.get('mallf.myOrder.model.search.parentOrderNumber').d('父订单号'),
      poSubNum: intl.get('mallf.myOrder.model.search.childOrderNumber').d('子订单号'),
      supplierCompanyName: intl.get('mallf.myOrder.view.supplier').d('供应商'),
      createDate: intl.get('mallf.myOrder.order.complete.time').d('下单时间'),
    }, // 搜索字段名
    AcceptRecordV: false,
    currentProduct: {},
  });

  const { hideFieldList } = getUserConfigInfo();

  const [loadings, toggleLoading] = useLoading({ spinning: false });

  const {
    currentStatus,
    list,
    pagination,
    query,
    count,
    receiveList,
    searchVisible,
    acceptVisible,
    commentVisible,
    commentProduct,
    textFieldVal,
    asnLineIds,
    AcceptRecordV,
    currentProduct,
    acceptType,
    searchMoreParams,
    label,
  } = state;

  const checkedList = useMemo(() => {
    let cList = [];
    list.forEach((p) => {
      cList = [...cList, ...p.poLineList.filter((m) => m.checked)];
    });
    return cList;
  }, [list]);

  useEffect(() => {
    fetchOrderData();
  }, [currentStatus, searchMoreParams]);

  /**
   * 查询全部订单列表
   * @param {Array} 传入参数
   */
  const fetchOrderData = (params = {}) => {
    const queryParams = {
      displayStatus: currentStatus,
      ...query,
      ...searchMoreParams,
      ...params,
    };
    setState({
      params: { ...query, ...params },
      checkedList: [],
    });
    toggleLoading({ loading: true });
    fetchOrderCentent(queryParams)
      .then((res) => {
        if (res) {
          const { content = [], ...paginations } = res;
          setState({
            list: content || [],
            pagination: paginations,
          });
        }
      })
      .finally(() => {
        toggleLoading({ loading: false });
        setState({ searchVisible: false });
        document.querySelector('body').scrollTop = 0;
      });
    fetchOrderStatusCount().then((res) => {
      if (res) {
        setState({ count: res });
      }
    });
  };

  /**
   * 确认收货
   * @params {Object} 传入参数
   */
  function handleConfirm(params) {
    toggleLoading('loading');
    fetchConfirm(params)
      .then((res) => {
        if (res) {
          if (res.success) {
            message.success(
              intl.get('mallf.myOrder.view.orderCenter.confirmReceipt').d('确认收货成功')
            );
            fetchOrderData();
          } else {
            SwalAlert(res.resultMsg);
          }
        }
      })
      .finally(() => {
        toggleLoading('loading');
      });
  }

  /**
   * 再来一单
   * @subOrders {Array} 子订单数据
   */
  function handleAgainOrder(subOrders) {
    toggleLoading('spinning');
    fetchOrderAgain(subOrders)
      .then((res) => {
        if (res) {
          afterBuyAgain(res, (resp) => {
            const cartIdList = resp.map((n) => n.cartId);
            history.push({
              pathname: '/cart',
              query: qs.stringify(cartIdList),
            });
          });
        }
      })
      .finally(() => {
        toggleLoading('spinning');
      });
  }

  function onRadioChange(e) {
    setState({
      currentStatus: e,
      checkedList: [],
    });
  }

  const handleSearchChange = debounce((val) => {
    setState({ textFieldVal: val, searchMoreParams: { poNum: val } });
  }, 1000);

  function resetSearch() {
    setState({ textFieldVal: '', searchMoreParams: {} });
  }

  /**
   * 接收预览
   * @param {*} params 收货/批量收货查询参数
   * @param {*} type 收货/批量收货(''/'batch')
   */
  function handleAccept(params = [], type = '') {
    if (params.length === 0) return;
    const newParams = params.map((n) => {
      const {
        asnLineId,
        productId,
        productNum,
        imagePath,
        platformCode,
        creationDate,
        freightLineLocationId,
        freightReceiveList,
        poLineId,
        poNum,
        uomPrecision,
      } = n;
      return {
        uomPrecision,
        asnLineId,
        productId,
        productNum,
        imagePath,
        platformCode,
        creationDate,
        freightLineLocationId,
        freightReceiveList,
        poLineId,
        poNum,
      };
    });
    const newFreightReceiveList = params.map((n) => ({ asnLineId: n.freightLineLocationId }));
    setState({
      asnLineIds: [...newParams, ...newFreightReceiveList],
      acceptVisible: true,
      acceptType: type,
    });
  }

  function handleComment(product, order) {
    const { poNum, createDate } = order;
    setState({
      commentVisible: true,
      commentProduct: { ...product, poNum, createDate },
    });
  }

  /**
   * 全选反选
   */
  // function handleCheckAllOrNo(checked) {
  //   let newCheckedList = [];
  //   const newList = list.map(item => {
  //     const { poLineList = [] } = item;
  //     const newPoLineList = poLineList.map(n => ({
  //       ...n,
  //       checked: !isEmpty(n.receiveList) && checked,
  //     }));
  //     newCheckedList = [...newCheckedList, ...newPoLineList.filter(m => m.checked)];
  //     return {
  //       ...item,
  //       poLineList: newPoLineList,
  //     };
  //   });
  //   setState({ list: newList, checkedList: newCheckedList });
  // }

  const orderCenterProps = {
    list,
    receiveList,
    pagination,
    currentStatus,
    setState,
    loading: loadings.loading,
    spinning: loadings.spinning,
    onConfirm: handleConfirm,
    onPageChange: fetchOrderData,
    onAgainOrder: handleAgainOrder,
    onAccept: handleAccept,
    onComment: handleComment,
  };

  const searchModalProps = {
    searchVisible,
    setState,
    textFieldVal,
    loading: loadings.loading,
    searchMoreParams,
  };

  const acceptModalProps = {
    acceptVisible,
    asnLineIds,
    setState,
    acceptType,
    fetchOrderData,
  };

  const commentModalProps = {
    commentVisible,
    setState,
    commentProduct,
    fetchOrderData,
  };

  // 全选
  const handleCheck = () => {
    const newList = JSON.parse(JSON.stringify(list));
    if (currentStatus === 'WAITING_RECEIVE') {
      newList.forEach((n) => {
        n.poLineList.forEach((p) => {
          if (p.enableMallReceiveCheck === '1') {
            p.checked = true;
          }
        });
        if (n.poLineList.some((i) => i.enableMallReceiveCheck === '1')) {
          // 只要是可勾选的头就给他勾选
          n.checked = true;
        }
      });
    } else {
      newList.forEach((n) => {
        n.checked = true;
      });
    }
    setState({ list: newList });
  };

  // 反选
  const handleCheckReverse = () => {
    const newList = JSON.parse(JSON.stringify(list));
    if (currentStatus === 'WAITING_RECEIVE') {
      newList.forEach((n) => {
        if (n.poLineList.some((i) => i.enableMallReceiveCheck === '1')) {
          // 只处理可勾选的头
          n.poLineList.forEach((p) => {
            if (p.enableMallReceiveCheck === '1') {
              p.checked = !p.checked;
            }
          });
          const enP = n.poLineList.filter((i) => i.enableMallReceiveCheck === '1'); // 可勾选的商品
          if (!isEmpty(enP)) {
            // 只要是可勾选的头就给他勾选
            n.checked = enP.every((x) => x.checked);
          }
        }
      });
    } else {
      newList.forEach((n) => {
        n.checked = !n.checked;
      });
    }
    setState({ list: newList });
  };
  return (
    <Context.Provider value={{ checkBoxList, setState, list, label, AcceptRecordV }}>
      <div className={style['order-center-record']}>
        <TabButtons
          tabList={labelList}
          currentTab={currentStatus}
          setCurrentTab={onRadioChange}
          count={count}
          customizedCode="MALL-ORDER-LIST-TAB"
        />
        <Row className="order-centent-operation">
          <Search
            textFieldVal={textFieldVal}
            handleSearchChange={handleSearchChange}
            resetSearch={resetSearch}
          />
          <Col span={7} style={{ float: 'right' }}>
            {checkBoxList.includes(currentStatus) &&
              hideFieldList &&
              !hideFieldList.includes('ACCEPTANCE') && (
                <div className="order-centent-operation-btns">
                  {currentStatus === 'WAITING_RECEIVE' && (
                    <div
                      className={classNames({
                        'order-centent-operation-button': true,
                        disable: checkedList.length === 0,
                        accept: true,
                      })}
                      onClick={() => handleAccept(checkedList, 'batch')}
                    >
                      <Icons type="library_receive" />
                      <span>{intl.get('mallf.myOrder.order.bulk.goods').d('批量收货')}</span>
                    </div>
                  )}
                  {currentStatus === 'WAITING_PAY' && (
                    <div
                      className={classNames({
                        'order-centent-operation-button': true,
                        disable: false,
                        accept: true,
                      })}
                      onClick={() => {}}
                    >
                      <Icons type="library_receive" />
                      <span>{intl.get('mallf.myOrder.order.batch.pay').d('批量支付')}</span>
                    </div>
                  )}
                  <div
                    className={classNames({
                      'order-centent-operation-button': true,
                      disable: false,
                      accept: true,
                    })}
                    onClick={() => {
                      handleCheckReverse();
                    }}
                  >
                    <Icon type="indeterminate_check_box" />
                    <span>{intl.get('mallf.myOrder.button.reverse.selectAll').d('反选')}</span>
                  </div>
                  <div
                    className={classNames({
                      'order-centent-operation-button': true,
                      disable: false,
                      accept: true,
                    })}
                    onClick={() => {
                      handleCheck();
                    }}
                  >
                    <Icon type="check_box" />
                    <span>{intl.get('hzero.common.button.selectAll').d('全选')}</span>
                  </div>
                </div>
              )}
          </Col>
        </Row>
        <Row className="search-info-content">
          <SearchInfo searchMoreParams={searchMoreParams} label={state.label} setState={setState} />
        </Row>
        <OrderComponent {...orderCenterProps} />
        {searchVisible && <SearchModal {...searchModalProps} />}
        {acceptVisible && <AcceptModal {...acceptModalProps} />}
        {commentVisible && <CommentModal {...commentModalProps} />}
        {AcceptRecordV && (
          <AcceptRecord
            toggleModal={() => {
              setState({ AcceptRecordV: !AcceptRecordV });
            }}
            visible={AcceptRecordV}
            product={currentProduct}
          />
        )}
      </div>
    </Context.Provider>
  );
}

export default withRouter(OrderCenter);
