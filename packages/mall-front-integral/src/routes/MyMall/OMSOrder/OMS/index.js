/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef } from 'react';
import qs from 'qs';
import moment from 'moment';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import SearchBar from 'components/SearchBar';
import { Row, Icon, message, Dropdown, Menu } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { getUserConfigInfo, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { openComfirmModal, openOmsAcceptModal } from 'utils/modals';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import {
  cancelOrderService,
  applyRefundService,
  fetchOrderOtherInfo,
  fetchOperationFlagService,
  revokeApproveService,
} from 'mall-front/lib/services/orderCenterService';
import {
  fetchOmsOrderCentent,
  fetchOmsOrderStatusCount,
  fetchOrderAgain,
} from '@/services/orderCenterService';
import Swal from 'components/swal';
import { queryIdpValue, queryUnifyIdpValue } from 'services/api';
import useState from 'hooks/useState';
import useLoading from 'hooks/useLoading';
import AssociatedDoc from 'mall-front/lib/routes/OMSOrderDetail/AssociatedDoc';
import CuxFn from 'mall-front/lib/cuxTools/cuxFn';
import { RECEIVE_INFORMATION_TABLE_SIGL } from 'utils/customizeCode';
import { afterBuyAgain } from 'utils/addNewCart';

import style from './index.less';
import OrderComponent from './OrderComponent';
import SearchModal from './SearchModal';
import AcceptModal from '../common/OmsAcceptModal';
import ButtonList from '../common/ButtonList';
import PayModal from '../common/PayModal';
import openComment from '../common/OmsCommentModal/openComment';
import LeaveWordModal from '../common/OmsLeaveWordModal';
import { Context } from '../common/Context';

const customizeUnitCodeAll = 'MALL.OMS.ORDER.LIST.SEARCH_BAR_MEMBER';
const customizeUnitCode = 'MALL.OMS.ORDER.LIST.SEARCH_BAR_MEMBER_OTHER';
const checkBoxList = ['WAITING_RECEIVE'];

function OrderCenter({ labelList, isOnline, history, customizeTable }) {
  const searchBarRef1 = useRef();
  const searchBarRef2 = useRef();
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
      orderCode: intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号'),
      skuName: intl.get('mallf.myOrder.view.productName').d('商品名称'),
      srmOrderCode: intl.get('mallf.myOrder.view.catalog.purchaseOrderNum').d('采购订单号'),
      reqNum: intl.get('mallf.myOrder.model.purchaseApplicationNum').d('采购申请号'),
      cecOrderCode: intl.get('mallf.myOrder.model.search.parentOrderNumber').d('父订单号'),
      ecConsignmentCode: intl.get('mallf.myOrder.model.search.childOrderNumber').d('子订单号'),
      supplierCompanyName: intl.get('mallf.myOrder.view.supplier').d('供应商'),
      createDate: intl.get('mallf.myOrder.order.complete.time').d('下单时间'),
      logisticOrderNum: intl.get(`mallf.myOrder.view.common.shipmentNum`).d('物流单号'),
    }, // 搜索字段名
    payVisible,
    AssociatedDocV: false,
    currentProduct: {},
    srmOrderId,
    leaveWordVisible,
    typeList: [],
    orderStatusList: [],
    orderTypeCode: '',
    mallOrderStatusList: [],
    canRevokeList: [],
  });

  const [loadings, toggleLoading] = useLoading({ spinning: false });

  // 默认查询6个月之内的数据
  const cecCreatedTimeRange = useMemo(() => {
    return [
      moment(new Date()).subtract(6, 'M').format(DATETIME_MIN),
      moment(new Date()).format(DATETIME_MAX),
    ];
  }, []);

  const {
    currentStatus,
    list,
    pagination,
    query,
    count,
    searchVisible,
    acceptVisible,
    textFieldVal,
    asnLineIds,
    AssociatedDocV,
    currentProduct,
    acceptType,
    searchMoreParams,
    label,
    payVisible,
    srmOrderId,
    leaveWordVisible,
    typeList,
    orderStatusList,
    orderTypeCode,
    mallOrderStatusList,
    canRevokeList,
  } = state;

  const checkedList = useMemo(() => {
    let cList = [];
    list.forEach((p) => {
      cList = [
        ...cList,
        ...p.orderEntryVOS
          .map((m) => ({ ...m, supplierCompanyName: p.supplierCompanyName }))
          .filter((m) => m.checked),
      ];
    });
    return cList;
  }, [list]);

  const checkedPayList = useMemo(() => {
    return list.filter((l) => l.checked);
  }, [list]);

  const { hideFieldList = [] } = getUserConfigInfo();

  useEffect(() => {
    fetchTypeList();
  }, []);

  useEffect(() => {
    const code = isOnline ? 'S2FUL.MALL_ORDER_STATUS' : 'S2FUL.MALL_ORDER_STATUS_WITHOUT_PAY';
    queryUnifyIdpValue(code).then((res) => {
      setState({
        orderStatusList: res,
      });
    });
  }, [currentStatus]);

  /**
   * 查询全部订单列表
   * @param {Array} 传入参数
   */
  const fetchOrderData = (page = {}) => {
    const params = filterNullValueObject(
      (currentStatus === '' ? searchBarRef1 : searchBarRef2).current?.getQueryParameter()
    );
    let beginDate;
    let endDate;
    if (params.cecCreatedTime_range) {
      [beginDate, endDate] = params.cecCreatedTime_range?.split(',');
    }

    const queryParams = {
      orderTypeCode,
      mallOrderStatus: currentStatus,
      beginDate,
      endDate,
      ...query,
      ...page,
      ...params,
      mallOrderStatusList: params.mallOrderStatusList_range,
      customizeUnitCode: currentStatus === '' ? customizeUnitCodeAll : customizeUnitCode,
      currentSearchBar: currentStatus === '' ? 1 : 2,
    };
    if (queryParams.mallOrderStatus === '' && page.currentSearchBar === 2) return;

    fetchOmsOrderStatusCount().then((res) => {
      // 更新列表就要更新count
      if (res) {
        setState({ count: res });
      }
    });
    setState({
      checkedList: [],
    });
    toggleLoading({ loading: true });
    fetchOmsOrderCentent(queryParams)
      .then((res) => {
        if (res) {
          const { content = [], ...paginations } = res;
          setState({
            list: content || [],
            pagination: paginations,
          });
          getOrderOtherInfo(content || []);
          handleOperationFlag(content || []);
        }
      })
      .finally(() => {
        toggleLoading({ loading: false });
        setState({ searchVisible: false });
      });
  };

  function getOrderOtherInfo(data) {
    if (isEmpty(data)) return;
    fetchOrderOtherInfo({ idString: data?.map((o) => o.orderId)?.join(',') }).then((res) => {
      const newContent = data?.map((o) => {
        const currentOrder = res?.[o?.orderCode] || {};
        const newOrderEntryVOS = [...o.orderEntryVOS];
        if (currentOrder?.skuAssessmentInfoVO?.map) {
          Object.keys(currentOrder.skuAssessmentInfoVO.map).forEach((entryCode) => {
            newOrderEntryVOS.forEach((product) => {
              if (+product.entryCode === +entryCode) {
                product.assessmentFlag =
                  currentOrder.skuAssessmentInfoVO.map?.[entryCode]?.assessmentFlag; // 评价flag
                // todo 新的行字段往后加
              }
            });
          });
        }
        return {
          ...o,
          receiverAddress: currentOrder?.orderReceiverAddress, // 收获信息
          purOrderExtra: currentOrder?.omsExtraAddress, // 收单地址
          poMessageUnReadVO: currentOrder?.poMessageUnReadVO, // 供应商留言
          // todo 新的头字段往后加
          orderEntryVOS: newOrderEntryVOS,
        };
      });
      setState({ list: newContent });
      CuxFn({ name: 'OMS-orderList-fn-initData', value: { content: newContent, setState } })(); // 锐捷二开
    });
  }

  // 订单类型
  const fetchTypeList = () => {
    queryIdpValue('S2FUL.ORDER_TYPE').then((res) => {
      setState({
        typeList: res,
      });
    });
  };

  /**
   * 处理工作流审批撤销按钮
   * @param {array} content 订单查询接口列表
   */
  function handleOperationFlag(content) {
    // 过滤出工作流审批
    const workflowApproveList = content.filter((n) => n.approveType === 'WORKFLOW_APPROVAL');
    if (workflowApproveList.length > 0) {
      const { approveMethod } = workflowApproveList[0];
      // 审批方式为BATCH时，参数用batchNum，为ORDER用orderCode
      const batchKey = approveMethod === 'BATCH' ? 'batchNum' : 'orderCode';
      const params = workflowApproveList.map((n) => n[batchKey]);
      fetchOperationFlagService(params).then((res) => {
        if (res) {
          // 可以撤销批次号/订单号集合
          const numList = Object.keys(res).filter((n) => {
            const { REVOKE } = res[n] || {};
            return REVOKE;
          });
          setState({ canRevokeList: numList });
        }
      });
    }
  }

  /**
   * 撤销工作流审批
   * @param {any} order 订单行
   */
  function handleRevokeApprove(order = {}) {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      children: (
        <>
          {intl
            .get('mallf.myOrder.view.revokeApprove.confirm')
            .d('是否确认撤销审批?撤销后您仍可再次提交发起审批')}
          <br />
          {intl.get('mallf.myOrder.view.onlyWorkflowCanRevoke').d('(仅工作流审批发起人可执行撤销)')}
        </>
      ),
      onOk: () => {
        const params = order[order.approveMethod === 'BATCH' ? 'batchNum' : 'orderCode'];
        toggleLoading('spinning');
        revokeApproveService(params)
          .then((resp) => {
            if (isEmpty(resp)) {
              const { number: page, size } = pagination;
              fetchOrderData({ page, size });
              message.success(intl.get('mallf.myOrder.view.cancelActionSuccess').d('操作成功'));
            } else {
              Swal(resp);
            }
          })
          .finally(() => {
            toggleLoading('spinning');
          });
      },
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
          const successJump = (resp) => {
            const cartIdList = resp.map((n) => n.cartId);
            history.push({
              pathname: '/sigl/cart',
              query: qs.stringify(cartIdList),
            });
          };

          afterBuyAgain(res, successJump);
        }
      })
      .finally(() => {
        toggleLoading('spinning');
      });
  }

  function onRadioChange(e) {
    setState({
      currentStatus: e.target.value,
      checkedList: [],
      mallOrderStatusList: [],
    });
    if (searchBarRef1.current && e.target.value === '') {
      searchBarRef1.current.handleResetFilter();
    }
    if (searchBarRef2.current && e.target.value !== '') {
      searchBarRef2.current.handleResetFilter();
    }
  }

  // const handleSearchChange = debounce(val => {
  //   setState({ textFieldVal: val, searchMoreParams: { orderCode: val } });
  // }, 1000);

  // function resetSearch() {
  //   setState({
  //     textFieldVal: '',
  //     searchMoreParams: {},
  //     orderTypeCode: '',
  //     mallOrderStatusList: [],
  //   });
  // }

  /**
   * 接收预览
   */
  async function handleAccept(params = [], type = '') {
    if (params.length === 0) return;
    await openOmsAcceptModal({
      asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
      acceptType: type,
      fetchOrderData,
      customizeTable,
    });
    // setState({
    //   asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
    //   acceptVisible: true,
    //   acceptType: type,
    // });
  }

  // 取消订单
  function handleCancelOrder(params) {
    Swal(intl.get('mallf.common.view.confirmCancelOrder').d('确定取消订单'), true).then((res) => {
      if (res.value) {
        toggleLoading('spinning');
        const { orderCode, objectVersionNumber } = params;
        cancelOrderService({ orderCode, objectVersionNumber })
          .then((resp) => {
            if (resp) {
              fetchOrderData();
              message.success(intl.get('mallf.common.view.cancelActionSuccess').d('操作成功'));
            }
          })
          .finally(() => {
            toggleLoading('spinning');
          });
      }
    });
  }

  // 申请退款
  function handleApplyRefund(params) {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmRefundTitle').d('确认退款'),
      border: false,
      children: (
        <span>{intl.get('mallf.mySaleAfter.view.confirmApplyRefund').d('确定申请退款？')}</span>
      ),
      onOk: () => {
        toggleLoading('spinning');
        applyRefundService([{ paymentId: params.toRefundPaymentId }])
          .then((resp) => {
            if (resp) {
              fetchOrderData();
            }
          })
          .finally(() => {
            toggleLoading('spinning');
          });
      },
    });
  }

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

  const payModalProps = {
    visible: payVisible,
    toggleModal: togglePayModal,
    checkedPayList,
  };

  // // 批量支付
  // function handleBatchPay() {
  //   if (checkedPayList.length === 0) return;
  //   togglePayModal();
  // }

  function togglePayModal() {
    setState({
      payVisible: !payVisible,
    });
  }

  function handleComment(product, order) {
    const { poNum, createDate, purchaseCompanyId, paymentModel } = order;
    const { number: page, size } = pagination;
    openComment({
      product: { ...product, poNum, createDate, companyId: purchaseCompanyId, paymentModel },
      successCallback: () => fetchOrderData({ page, size }),
    });
  }

  // 全选
  function handleCheck() {
    const newList = JSON.parse(JSON.stringify(list));
    if (currentStatus === 'WAITING_RECEIVE') {
      newList.forEach((n) => {
        n.orderEntryVOS.forEach((p) => {
          if (p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1) {
            p.checked = true;
          }
        });
        if (
          n.orderEntryVOS.some(
            (p) => p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1
          )
        ) {
          n.checked = true;
        }
      });
    }
    setState({ list: newList });
  }

  // 反选
  function handleCheckReverse() {
    const newList = JSON.parse(JSON.stringify(list));
    if (currentStatus === 'WAITING_RECEIVE') {
      newList.forEach((n) => {
        n.orderEntryVOS.forEach((p) => {
          if (p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1) {
            p.checked = !p.checked;
          }
        });
        if (
          n.orderEntryVOS.some(
            (p) => p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1
          )
        ) {
          n.checked = n.orderEntryVOS.every((x) => x.checked);
        }
      });
    }
    setState({ list: newList });
  }

  const headerOther = (
    <div
      r-if={
        currentStatus === 'WAITING_RECEIVE' &&
        hideFieldList &&
        !hideFieldList.includes('ACCEPTANCE')
      }
      className="order-centent-operation-btns"
    >
      <Button
        disabled={checkedList.length === 0}
        color="primary"
        funcType="flat"
        icon="move_to_inbox"
        onClick={() => handleAccept(checkedList, 'batch')}
        className="batch-receive-btn"
        style={{ maxWidth: 126 }}
      >
        {intl.get('mallf.myOrder.order.bulk.goods').d('批量收货')}
      </Button>
      <Dropdown
        overlay={
          <Menu className={style['order-centent-operation-Menu']}>
            <Menu.Item>
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
            </Menu.Item>
            <Menu.Item>
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
            </Menu.Item>
          </Menu>
        }
      >
        <Button icon="more_horiz" color="primary" funcType="flat" style={{ lineHeight: '32px' }} />
      </Dropdown>
    </div>
  );

  return (
    <Context.Provider
      value={{
        currentStatus,
        pagination,
        checkBoxList,
        setState,
        list,
        label,
        checkedList,
        isOnline,
        loading: loadings.loading,
        spinning: loadings.spinning,
        AssociatedDocV,
        typeList,
        orderStatusList,
        isOMS: true,
        orderTypeCode,
        mallOrderStatusList,
        canRevokeList,
        onAgainOrder: handleAgainOrder,
        onPageChange: fetchOrderData,
        onAccept: handleAccept,
        onComment: handleComment,
        onCancelOrder: handleCancelOrder,
        onApplyRefund: handleApplyRefund,
        fetchOrderData,
        handleRevokeApprove,
      }}
    >
      <div className={style['order-center-record']}>
        <ButtonList
          labelList={labelList}
          loadings={loadings}
          onRadioChange={onRadioChange}
          currentStatus={currentStatus}
          count={count}
        />
        <Row className="order-centent-operation">
          <div
            style={{
              display: currentStatus === '' ? 'block' : 'none',
              float: 'left',
              width: '100%',
            }}
          >
            <SearchBar
              searchBarRef={(ref) => {
                searchBarRef1.current = ref;
              }}
              handleSearch={({ params }) =>
                fetchOrderData({
                  ...params,
                  customizeUnitCode: customizeUnitCodeAll,
                  currentSearchBar: 1,
                })
              }
              searchCode={customizeUnitCodeAll}
              headerOther={headerOther}
              searchBarConfig={{
                fieldProps: {
                  cecCreatedTime: {
                    defaultValue: () => cecCreatedTimeRange,
                  },
                },
              }}
            />
          </div>
          <div
            style={{
              display: currentStatus !== '' ? 'block' : 'none',
              float: 'left',
              width: '100%',
            }}
          >
            <SearchBar
              searchBarRef={(ref) => {
                searchBarRef2.current = ref;
              }}
              handleSearch={({ params }) =>
                fetchOrderData({ ...params, customizeUnitCode, currentSearchBar: 2 })
              }
              searchCode={customizeUnitCode}
              headerOther={headerOther}
              searchBarConfig={{
                fieldProps: {
                  cecCreatedTime: {
                    defaultValue: () => cecCreatedTimeRange,
                  },
                },
              }}
            />
          </div>
        </Row>
        <OrderComponent />
        {searchVisible && <SearchModal {...searchModalProps} />}
        {acceptVisible && <AcceptModal {...acceptModalProps} />}
        {payVisible && <PayModal {...payModalProps} />}
        {AssociatedDocV && (
          <AssociatedDoc
            cecFromCode={currentProduct.cecFromCode}
            toggleModal={() => setState({ AssociatedDocV: !AssociatedDocV })}
            visible={AssociatedDocV}
            product={currentProduct}
          />
        )}
        {leaveWordVisible && (
          <LeaveWordModal
            srmOrderId={srmOrderId}
            leaveWordVisible={leaveWordVisible}
            setState={(vis) => setState(vis)}
            // order={}
          />
        )}
      </div>
    </Context.Provider>
  );
}
export default c7nCustomize({
  unitCode: [RECEIVE_INFORMATION_TABLE_SIGL],
})(withRouter(OrderCenter));
// export default withRouter(OrderCenter);
