/* eslint-disable no-param-reassign */
import React, { useMemo, useRef } from 'react';
import qs from 'qs';
import moment from 'moment';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { Observer } from 'mobx-react';
import SearchBar from 'components/SearchBar';
import { Row, Icon, message, Input, Dropdown, Menu } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import MallExport from 'components/MallExport';
import { orderExport } from 'components/Permission/permissionCode';

import { openOmsAcceptModal, openNotLowestTipsModal, openComfirmModal } from 'utils/modals';
import { getUserConfigInfo, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { getOpenCartFlag } from 'utils/configUtils';
import {
  fetchOmsOrderCentent,
  fetchOrderOtherInfo,
  fetchOrderAgain,
  fetchOmsOrderStatusCount,
  cancelOrderService,
  applyRefundService,
  fetchOperationFlagService,
  revokeApproveService,
} from 'services/orderCenterService';
import { newBuyAgainService } from 'services/newCartService';
import useState from '@/hooks/useState';
import useLoading from '@/hooks/useLoading';
import AssociatedDoc from '@/routes/OMSOrderDetail/AssociatedDoc';
import TabButtons from 'components/TabButtons';
import { RECEIVE_INFORMATION_TABLE, RECEIVE_RECORD_INFO_TABLE } from 'utils/customizeCode';
import { afterBuyAgain } from 'utils/addNewCart';
import swal from 'components/swal';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { openAcceptRecord } from '@/routes/OMSOrderDetail/AcceptRecord';
import AcceptModal from '../common/OmsAcceptModal';
import style from './index.less';
import OrderComponent from './OrderComponent';
import PayModal from '../common/PayModal';
import openComment from '../common/OmsCommentModal/openComment';
import LeaveWordModal from '../common/OmsLeaveWordModal';
import { Context } from '../common/Context';
import CuxFn from '@/cuxTools/cuxFn';
import SearchModal from './SearchModal';
import Selected from './Selected';

const customizeUnitCodeAll = 'MALL.OMS.ORDER.LIST.SEARCH_BAR';
const customizeUnitCode = 'MALL.OMS.ORDER.LIST.SEARCH_BAR_OTHER';
const checkBoxList = ['WAITING_RECEIVE'];
const { TextArea } = Input;

function OrderCenter({ labelList, isOnline, history, customizeTable }) {
  const searchBarRef1 = useRef();
  const searchBarRef2 = useRef();
  const { displayStatus } = qs.parse(location.search.substr(1));
  const currentStatusRef = useRef(displayStatus || '');
  const [state, setState] = useState({
    confirmLoading: false,
    searchVisible: false,
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

  // 用于分页导出的全部订单ids
  const selectOrderIds = useMemo(() => new Selected(), []);

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
    acceptVisible,
    asnLineIds,
    searchVisible,
    textFieldVal,
    AssociatedDocV,
    currentProduct,
    acceptType,
    searchMoreParams,
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

  const { hideFieldList = [], isNewCart, companyId, organizationId } = getUserConfigInfo();

  // 获取查询参数
  const getQueryParams = (page = {}) => {
    const params = filterNullValueObject(
      (currentStatus === '' ? searchBarRef1 : searchBarRef2).current?.getQueryParameter()
    );
    let beginDate;
    let endDate;
    if (params.cecCreatedTime_range) {
      [beginDate, endDate] = params.cecCreatedTime_range?.split(',');
    }
    return filterNullValueObject({
      orderTypeCode,
      mallOrderStatus: currentStatus,
      beginDate,
      endDate,
      ...query,
      ...page,
      ...params,
      mallOrderStatusList: params.mallOrderStatusList_range,
      customizeUnitCode: currentStatus === '' ? customizeUnitCodeAll : customizeUnitCode, // 补充翻页传参 筛选器code
      currentSearchBar: currentStatus === '' ? 1 : 2,
    });
  };

  // 获取导出的查询参数
  const getExportQueryParams = () => {
    return filterNullValueObject({
      ...getQueryParams(),
      orderIds: selectOrderIds.getValueStr(),
    });
  };

  /**
   * 查询全部订单列表
   * @param {Array} 传入参数
   */
  const fetchOrderData = (page = {}, cache = false) => {
    const queryParams = getQueryParams(page);
    const oldTab = currentStatus;
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
        if (res && oldTab === currentStatusRef.current) {
          // 请求时切换分页数据展示问题
          const { content = [], ...paginations } = res;
          // 只有分页才保留勾选
          if (!cache) {
            selectOrderIds.clear();
          }
          console.log('content', content);
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
        document.querySelector('body').scrollTop = 0;
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
                  product.mallOrderEntryStatus === 'FINISH'
                    ? currentOrder.skuAssessmentInfoVO.map?.[entryCode]?.assessmentFlag // 评价flag
                    : null;
                // todo 新的行字段往后加
              }
            });
          });
        }
        return {
          ...o,
          receiverAddress: currentOrder?.orderReceiverAddress || {}, // 收获信息
          purOrderExtra: currentOrder?.omsExtraAddress || {}, // 收单地址
          poMessageUnReadVO: currentOrder?.poMessageUnReadVO || {}, // 供应商留言
          // currentApproverList: currentOrder?.workflowApproveResponseDTO?.currentApproverList || [], // 审批人列表
          orderEntryVOS: newOrderEntryVOS,
        };
      });
      setState({ list: newContent });
      CuxFn({ name: 'OMS-orderList-fn-initData', value: { content: newContent, setState } })(); // 锐捷二开
    });
  }

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
              swal(resp);
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
    const successJump = (resp) => {
      const cartIdList = resp.map((n) => n.cartId);
      history.push({
        pathname: '/cart',
        query: qs.stringify(cartIdList),
      });
    };
    if (isNewCart) {
      const { orderEntryVOS } = subOrders[0];
      const newParams = {
        orderEntryIds: orderEntryVOS.map((item) => {
          return item?.orderEntryId;
        }),
        purCompanyId: companyId,
        openCartFlag: +getOpenCartFlag(),
      };
      newBuyAgainService(newParams)
        .then((res) => {
          const result = openNotLowestTipsModal({
            res,
            onOk: () => {
              toggleLoading('spinning');
              newParams.confirmFlag = 1;
              newBuyAgainService(newParams)
                .then((resp) => {
                  if (resp) {
                    // 又有弱校验 又有强校验时
                    if (result !== 'StrongRule') {
                      afterBuyAgain(resp, successJump);
                    }
                  }
                })
                .finally(() => {
                  toggleLoading('spinning');
                });
            },
          });

          if (result === 'NoRule') {
            afterBuyAgain(res, successJump);
          }
        })
        .finally(() => {
          toggleLoading('spinning');
        });
      return;
    }
    const ids = subOrders.map((n) => ({ poHeaderId: n.poHeaderId }));
    fetchOrderAgain(ids)
      .then((res) => {
        if (res) {
          afterBuyAgain(res, successJump);
        }
      })
      .finally(() => {
        toggleLoading('spinning');
      });
  }

  function onRadioChange(key) {
    setState({
      currentStatus: key,
      checkedList: [],
      mallOrderStatusList: [],
    });
    currentStatusRef.current = key;
    if (searchBarRef1.current && key === '') {
      searchBarRef1.current.handleResetFilter();
    }
    if (searchBarRef2.current && key !== '') {
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
    const openAccept = CuxFn({
      name: 'OMSOrder-fn-openAccept',
      value: { setState, params, type },
    })(async () => {
      await openOmsAcceptModal({
        asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
        acceptType: type,
        fetchOrderData,
        customizeTable,
      });
    });
    await openAccept();
  }
  // 查看接收记录
  function handleOnAcceptRecord({ product }) {
    openAcceptRecord({ product, fetchOrderData, customizeTable });
  }

  // 取消订单
  function handleCancelOrder(params) {
    openComfirmModal({
      title: intl.get(`mallf.common.view.cancelReason`).d('取消原因'),
      children: <TextArea id="orderCancelReason" rows={3} />,
      onOk() {
        const cancelReason = document.getElementById('orderCancelReason').value;
        const { orderCode, objectVersionNumber } = params;
        toggleLoading('spinning');
        cancelOrderService({ orderCode, objectVersionNumber, cancelReason })
          .then((resp) => {
            if (resp) {
              const { number: page, size } = pagination;
              fetchOrderData({ page, size });
              message.success(intl.get('mallf.myOrder.view.cancelActionSuccess').d('操作成功'));
            }
          })
          .finally(() => {
            toggleLoading('spinning');
          });
      },
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

  const acceptModalProps = {
    acceptVisible,
    asnLineIds,
    setState,
    acceptType,
    fetchOrderData,
  };

  const searchModalProps = {
    searchVisible,
    setState,
    textFieldVal,
    loading: loadings.loading,
    searchMoreParams,
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
    const { poNum, createDate, purchaseCompanyId } = order;
    const { number: page, size } = pagination;
    openComment({
      product: { ...product, poNum, createDate, companyId: purchaseCompanyId },
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
        selectOrderIds,
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
        onPageChange: (page) => fetchOrderData(page, true),
        onAccept: handleAccept,
        onAcceptRecord: handleOnAcceptRecord,
        onComment: handleComment,
        onCancelOrder: handleCancelOrder,
        onApplyRefund: handleApplyRefund,
        fetchOrderData,
        handleRevokeApprove,
      }}
    >
      <div className={style['order-center-record']}>
        <TabButtons
          tabList={labelList}
          currentTab={currentStatus}
          setCurrentTab={onRadioChange}
          count={count}
          customizedCode="MALL-OMS-ORDER-LIST-TAB"
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
              headerOther={
                <div className="order-centent-operation-btns">
                  <Observer>
                    {() => (
                      <MallExport
                        exportAsync
                        method="POST"
                        allBody
                        templateCode="SRM_C_SRM_S2FUL_ORDER_MALL_EXPORT"
                        buttonText={
                          selectOrderIds.length > 0
                            ? intl.get('mallf.common.button.selectExportNew').d('勾选导出')
                            : intl.get('hzero.common.view.button.export').d('导出')
                        }
                        requestUrl={`/smodr/v1/${organizationId}/orders/mall-order-export`}
                        queryParams={getExportQueryParams}
                        otherButtonProps={{
                          type: 'c7n-pro',
                          color: 'primary',
                          funcType: 'flat',
                          icon: 'unarchive',
                          permissionList: [orderExport],
                        }}
                      />
                    )}
                  </Observer>
                </div>
              }
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
        {acceptVisible && <AcceptModal {...acceptModalProps} />}
        {searchVisible && <SearchModal {...searchModalProps} />}
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
  unitCode: [RECEIVE_INFORMATION_TABLE, RECEIVE_RECORD_INFO_TABLE],
})(withRouter(OrderCenter));

// export default withRouter(OrderCenter);
