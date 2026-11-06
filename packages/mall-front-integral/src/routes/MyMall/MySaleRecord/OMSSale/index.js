import React, { useState, Fragment, useRef } from 'react';
import { Form, Row, Modal } from 'hzero-ui';
import { Icon } from 'choerodon-ui';

import { CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
// import Search from 'components/MyMallSearch';
import Searchbar from 'components/SearchBar';
// import SwalAlert from 'components/swal';
import * as HmallConfig from 'utils/api-config';
import { HmallOptions } from 'utils/options';
import * as Hmall from 'utils/utils';
import request from 'utils/request';
import { openComfirmModal } from 'utils/modals';
import Pagination from 'components/Pagination';
import Loading from 'components/loading';
import Link from 'components/Link';
import Image from 'components/Image';
import Tags from 'components/Tag';
// import Swal from 'components/swal';
import TabButtons from 'components/TabButtons';
import {
  submitomsWayBill,
  fetchomsCancelAfterSale,
  fetchomsSureMessage,
  sentAfterSaleomsService,
} from 'services/saleDetailService';
import { applyRefundService } from 'services/orderCenterService';
import WayBillModal from 'mall-front/lib/routes/OMSSaleDetail/WayBillForm';
import ReasonModal from 'mall-front/lib/routes/OMSSaleDetail/ReasonModal';
import useSetState from 'hooks/useState';
import { Button } from 'choerodon-ui/pro';
import style from './index.less';

function SaleRecord(props) {
  const [state, setState] = useSetState({
    orderData: [],
    loading: false,
    currentStatus: '',
    count: {},
    pagination: {},
    visible: false,
    newList: {},
    record: {},
    wayBillData: {},
    modalVisible: false,
    submitLoading: false,
    reasonVisible: false,
  });
  const {
    orderData,
    loading,
    currentStatus,
    count,
    pagination,
    // visible,
    // newList,
    record,
    consignmentCode,
    cecFromCode,
    orderId,
    orderEntryId,
    wayBillData,
    modalVisible,
    submitLoading,
    reasonVisible,
  } = state;
  const { organizationId, userId, companyId } = Hmall.getUserConfigInfo();
  const { serviceTypeMapping } = HmallOptions();
  const [queryData] = useState({
    page: 0,
    size: 10,
    time: '',
    poNum: '',
    ecProductName: '',
    afterSaleNum: '',
    afterSaleStatus: '',
    cecFromCode: '',
    serviceType: '',
    userId,
    companyId,
    purchaseType: Hmall.getUserConfigInfo().purchaseType,
  });
  const searchBarRef = useRef();

  function getCounts() {
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/member-count`; // url
    request(queryUrl, {
      query: { userId, tenantId: organizationId, companyId },
    }).then((res) => {
      setState({ count: res });
    });
  }

  const labelList = [
    {
      countName: 'allNum',
      label: intl.get('mallf.myMall.view.order.allOrders').d('全部订单'),
      status: '',
    },
    {
      countName: 'submit',
      label: intl.get('mallf.common.status.submitted').d('已提交'),
      status: 'SUBMIT',
    },
    {
      countName: 'pending',
      label: intl.get('mallf.common.status.pendding').d('处理中'),
      status: 'PENDDING',
    },
    {
      countName: 'finish',
      label: intl.get('mallf.myMall.view.order.FINISH').d('已完成'),
      status: 'FINISH',
    },
  ];

  /**
   * 获取售后列表
   */
  function getSaleAfterList(params = {}) {
    getCounts();
    const formData = props.form.getFieldsValue();
    const searchBarParams = searchBarRef.current?.getQueryParameter();
    const queryParams = {
      ...formData,
      ...queryData,
      ...params,
      ...searchBarParams,
      displayStatus: currentStatus,
      size: params.size || queryData.size || 10,
      customizeUnitCode: 'MALL.SALEAFTER.APPLICATION.LIST.SEARCH.BAR.MEMBER',
    };
    // setQueryData(queryParams);
    const filterNullQuery = Hmall.filterNullValueObject(queryParams);
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/member-list`; // url
    const newUrl = Hmall.generateUrlWithGetParam(queryUrl, filterNullQuery); // 为url拼接参数
    setState({ loading: true });
    request(newUrl)
      .then((res) => {
        const { content: data, ...paginationData } = res;
        setState({
          orderData: data,
          pagination: paginationData,
        });
      })
      .finally(() => {
        setState({ loading: false });
      });
  }

  /**
   * 商品发出
   */
  const sentAfterSale = (item = {}) => {
    const params = {
      ...item,
      afterSaleStatus: 'WAIT_PROCESS',
    };
    Modal.confirm({
      title: intl.get(`mallf.common.view.goods.sent`).d('商品发出'),
      content: `${intl.get(`mallf.common.view.isGoods.sent`).d('是否已发出商品')}?`,
      onOk: () => {
        setState({ loading: true });
        sentAfterSaleomsService(params)
          .then((res) => {
            if (res) getSaleAfterList(queryData);
          })
          .finally(() => {
            setState({ loading: false });
          });
      },
      onCancel() {},
    });
  };

  /**
   * 取消售后
   */
  const cancelAfterSale = (item) => {
    if (item.orderTypeCode === 'EC') {
      setState({
        record: item,
        reasonVisible: true,
      });
      return false;
    }
    omsCancelAfterSale(item);
  };

  const omsCancelAfterSale = (item, param) => {
    const { orderTypeCode, afterSaleId } = item || record;
    const parmas =
      orderTypeCode === 'EC'
        ? {
            afterSaleId,
            ...param,
          }
        : { afterSaleId };
    setState({ loading: true });
    fetchomsCancelAfterSale(parmas)
      .then((res) => {
        if (res) getSaleAfterList(queryData);
      })
      .finally(() => {
        setState({
          loading: false,
          reasonVisible: false,
        });
      });
  };

  /**
   * 确认售后完成
   */
  const handleSureMessage = (afterSaleId, id) => {
    setState({ loading: true });
    fetchomsSureMessage({ afterSaleId, orderId: id })
      .then((res) => {
        if (res) getSaleAfterList(queryData);
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

  // 申请退款
  function handleApplyRefund(params) {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmRefundTitle').d('确认退款'),
      border: false,
      children: (
        <span>{intl.get('mallf.mySaleAfter.view.confirmApplyRefund').d('确定申请退款？')}</span>
      ),
      onOk: () => {
        setState({ loading: true });
        applyRefundService([{ paymentId: params.toRefundPaymentId }])
          .then((resp) => {
            if (resp) {
              getSaleAfterList(queryData);
            }
          })
          .finally(() => {
            setState({ loading: false });
          });
      },
    });
  }

  /**
   * 订单列表
   */
  function renderOrder(item) {
    let afterSaleType;
    switch (item.afterSaleStatus) {
      case 'CANCELED':
        afterSaleType = 'cancel';
        break;
      case 'FINISH':
        afterSaleType = 'success';
        break;
      case 'REJECT':
        afterSaleType = 'failed';
        break;
      case 'PRODUCT_REJECT':
        afterSaleType = 'failed';
        break;
      default:
        afterSaleType = 'info';
        break;
    }
    return (
      <div className="order-detail">
        <div className="order-number-header">
          <ul>
            <li>
              {intl.get('mallf.myMall.view.saleRecord.afterApplicationForm').d('售后申请单')}：
              <span>
                <Link
                  style={{ color: Hmall.getPrimaryColor() }}
                  to={`/sigl/oms-sale-status?afterSaleId=${item.afterSaleId}&afterSaleCode=${item.afterSaleCode}`}
                >
                  {item.afterSaleCode}
                </Link>
                <CopyButton
                  style={{ top: 3 }}
                  num={item.afterSaleCode}
                  label={intl
                    .get('mallf.myMall.view.saleRecord.afterApplicationForm')
                    .d('售后申请单')}
                />
              </span>
              {/* <Link
                to={`${HmallConfig.contextPath}/oms-sale-status?afterSaleId=${item.afterSaleId}&afterSaleCode=${item.afterSaleCode}`}
              >
                {item.afterSaleNum}
              </Link> */}
            </li>
            {/* {item.poSubNum && (
              <li>
                {intl.get('mallf.common.view.E-commerceSub').d('子订单')}：{item.poSubNum}
              </li>
            )} */}
            <li>
              {item.orderCode && item.orderCode !== 'undefined' && (
                <>
                  {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：
                  <Link
                    style={{ color: Hmall.getPrimaryColor() }}
                    to={`/sigl/oms-order-detail?orderId=${item.orderId}`}
                  >
                    {item.orderCode}
                  </Link>
                </>
              )}
            </li>
            {/* <li>
              {intl.get('mallf.common.view.E-commerce').d('电商')}：
              <span>{item.productSource || '-'}</span>
            </li> */}
            <li>
              {intl.get('mallf.myMall.view.saleRecord.applicationTime').d('申请时间')}：
              <span>{item.creationDate}</span>
            </li>
            {/* {item.refundStatus && (
              <React.Fragment>
                <span
                  className="sale-click-detail"
                  onClick={() => {
                    showRefundDetail(item);
                  }}
                >
                  {intl.get('mallf.myMall.view.saleRecord.refund').d('退款明细')}
                </span>
              </React.Fragment>
            )} */}
          </ul>
        </div>
        <div className="detail-info-col">
          <div className="detail-info-left">
            <div className="detail-info-content">
              <Link
                to={`/sigl/product-detail?productId=${item.skuId}&sourceFrom=${
                  item.cecFromCode || 'CATA'
                }`}
              >
                <Image
                  value={item.afterSaleEntryList?.[0]?.productImagePath}
                  width={40}
                  height={40}
                />
              </Link>
              <div className="productname">
                <Link
                  to={`/sigl/product-detail?productId=${item.skuId}&sourceFrom=${
                    item.cecFromCode || 'CATA'
                  }`}
                >
                  {item.skuName}
                </Link>
              </div>
              <span className="detail-info-quantity">
                ×{item.afterSaleEntryList?.[0]?.applyQuantityMeaning}
              </span>
            </div>
          </div>
          <ul className="detail-info-right">
            <li className="detail-info-status">
              <span>
                <p title={item.afterSaleTypeMeaning}>
                  {intl.get('mallf.myMall.view.saleRecord.serviceOrderType').d('服务单类型')}：
                  {item.afterSaleTypeMeaning}
                </p>
                {item.afterSaleItemList?.length > 0 && getSaleItem(item)}
              </span>
            </li>
            <li className="detail-info-handle">
              <div className="todetail">
                {/* <Link
                  to={`/sigl/oms-sale-status?afterSaleId=${item.afterSaleId}&afterSaleCode=${item.afterSaleCode}`}
                > */}
                <Tags
                  style={{
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                  type={afterSaleType}
                  className="info"
                  title={item.afterSaleStatusMeaning}
                >
                  {item.afterSaleStatusMeaning}
                </Tags>
                {/* <p style={{ marginTop: 4 }}>
                    {intl.get('hzero.common.button.details').d('查看详情')}
                  </p>
                </Link> */}
              </div>
            </li>
            <li className="detail-info-operate">
              {item.afterSaleStatus === 'WAIT_SENT' && (
                <>
                  {item.cecFromCode === 'CATA' || item.pickWareType === 'PICK_UP' ? (
                    <div className="operation-btn" onClick={() => sentAfterSale(item)}>
                      {intl.get('mallf.common.view.product.send').d('商品发出')}
                    </div>
                  ) : (
                    <div
                      className="operation-btn"
                      onClick={() =>
                        setState({
                          modalVisible: true,
                          afterSaleId: item.afterSaleId,
                          wayBillData: [],
                        })
                      }
                    >
                      {intl.get('mallf.common.view.product.send').d('商品发出')}
                    </div>
                  )}
                </>
              )}
              {item.canCancelFlag === 1 && (
                <div className="operation-btn" onClick={() => cancelAfterSale(item)}>
                  {intl.get('mallf.common.view.cancel.application').d('取消申请')}
                </div>
              )}
              {item.afterSaleStatus === 'WAIT_CONFIRM' && (
                <div
                  className="operation-btn"
                  onClick={() => handleSureMessage(item.afterSaleId, item.orderId)}
                >
                  {intl.get('mallf.common.view.sure.complete').d('确认完成')}
                </div>
              )}
              {item.afterSaleStatus === 'WAIT_PROCESS' &&
                !item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                  <>
                    {(item.cecFromCode === 'CATA' || item.pickWareType === 'PICK_UP') && (
                      <div
                        className="operation-btn"
                        onClick={() =>
                          setState({
                            modalVisible: true,
                            afterSaleId: item.afterSaleId,
                            cecFromCode: item?.cecFromCode,
                          })
                        }
                      >
                        {intl.get('mallf.common.model.submitWaybill').d('提交运单')}
                      </div>
                    )}
                  </>
                )}
              {item.afterSaleStatus === 'WAIT_PROCESS' &&
                item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                  <div
                    className="operation-btn"
                    onClick={() =>
                      setState({
                        modalVisible: true,
                        cecFromCode: item?.cecFromCode,
                        orderId: item?.orderId,
                        orderEntryId: item?.afterSaleEntryList?.[0].orderEntryId,
                        wayBillData: item?.afterSaleWaybillList?.find(
                          (p) => p.logisticsType === 'RETURN'
                        ),
                      })
                    }
                  >
                    {intl.get('mallf.common.model.fetchWaybill').d('查看运单')}
                  </div>
                )}
              {item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RENEW') && (
                <Button
                  className="operation-btn operation-btn-flat"
                  funcType="flat"
                  onClick={() =>
                    setState({
                      modalVisible: true,
                      orderId: item?.orderId,
                      orderEntryId: item?.afterSaleEntryList?.[0].orderEntryId,
                      wayBillData: item?.afterSaleWaybillList?.find(
                        (p) => p.logisticsType === 'RENEW'
                      ),
                    })
                  }
                >
                  {intl.get('mallf.common.model.check.back.yundan').d('查看商家返件运单')}
                </Button>
              )}
              {!!item.toRefundPaymentId && (
                <div className="operation-btn" onClick={() => handleApplyRefund(item)}>
                  {intl.get('mallf.common.view.applyRefund').d('申请退款')}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  function getSaleItem(item) {
    const m = item.afterSaleItemList?.find((i) => i.afsType === item.afsType) || {};
    const failQuantity = item.applyQuantity - item.realityQuantity;
    return (
      <div key={m.afterSaleItemId}>
        <p>实际售后类型: {serviceTypeMapping[m.afsType]}</p>
        <p>
          <span style={{ marginRight: 16 }}>
            <Icon type="check_circle" className="success" /> {m.realityQuantity}
          </span>
          <span>
            <Icon type="cancel" className="danger" /> {failQuantity}
          </span>
        </p>
      </div>
    );
  }

  // const searchProps = {
  //   onOk: getSaleAfterList,
  //   optionsType: [
  //     {
  //       value: 'orderCode',
  //       meaning: intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号'),
  //     },
  //     {
  //       value: 'productName',
  //       meaning: intl.get('mallf.myMall.model.search.commodityNames').d('商品名称'),
  //     },
  //     {
  //       value: 'afterSaleNum',
  //       meaning: intl.get('mallf.myMall.model.search.requisitionNumber').d('申请单号'),
  //     },
  //   ],
  //   optionsTime: [
  //     {
  //       value: '',
  //       meaning: intl.get('mallf.myMall.model.search.all').d('全部'),
  //     },
  //     {
  //       value: 'threeMonth',
  //       meaning: intl.get('mallf.myMall.model.search.threeMonths').d('三个月'),
  //     },
  //     {
  //       value: 'oneMonth',
  //       meaning: intl.get('mallf.myMall.model.search.oneMonth').d('一个月'),
  //     },
  //     {
  //       value: 'oneWeek',
  //       meaning: intl.get('mallf.myMall.model.search.oneWeek').d('一周'),
  //     },
  //   ],
  // };

  // 填写运单
  const handleSubmit = (params) => {
    const { afterSaleId } = state;
    const newParams = {
      ...params,
      afterSaleId,
    };
    submitomsWayBill(newParams).then((res) => {
      if (res) {
        setState({ modalVisible: false });
        getSaleAfterList(queryData);
      }
    });
  };

  const modalProps = {
    cecFromCode,
    orderId,
    orderEntryId,
    consignmentCode,
    wayBillData,
    modalVisible,
    submitLoading,
    onOk: handleSubmit,
    onCancel: () => setState({ modalVisible: false }),
  };
  const reasonProps = {
    reasonVisible,
    onOk: (param) => omsCancelAfterSale(record, param),
    onCancel: () => setState({ reasonVisible: false }),
  };

  return (
    <div className={style['sale-after-record']}>
      <Row style={{ marginBottom: '10px', height: '40px' }}>
        <TabButtons
          tabList={labelList}
          currentTab={currentStatus}
          setCurrentTab={(e) => {
            searchBarRef.current.handleResetFilter();
            setState({ currentStatus: e });
          }}
          count={count}
        />
      </Row>
      <Row>
        <Searchbar
          handleSearch={({ params }) => getSaleAfterList({ ...params })}
          searchCode="MALL.SALEAFTER.APPLICATION.LIST.SEARCH.BAR.MEMBER"
          searchBarRef={(ref) => {
            searchBarRef.current = ref;
          }}
          // style={{width: '100%'}}
        />
      </Row>
      <div className="orderCenter-container">
        <div
          className="orderList"
          style={{ padding: 0, minHeight: `${window.innerHeight - 263}px` }}
        >
          {loading ? (
            <Loading />
          ) : orderData.length > 0 ? (
            <Fragment>
              {orderData.map((item) => renderOrder(item))}
              <Pagination
                showSizeChanger
                style={{ width: '100%', marginTop: 24 }}
                zeroStart
                showQuickJumper
                {...pagination}
                onForward={getSaleAfterList}
              />
            </Fragment>
          ) : (
            <div className="empty-order-list">
              <div className="info">
                {intl.get('mallf.myMall.view.noAfterSalesInfo').d('暂无售后信息')}
              </div>
            </div>
          )}
        </div>
      </div>
      {modalVisible && <WayBillModal {...modalProps} />}
      {reasonVisible && <ReasonModal {...reasonProps} />}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(SaleRecord);
