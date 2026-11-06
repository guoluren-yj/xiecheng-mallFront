import React, { useState, Fragment, useRef } from 'react';
import { Form, Row } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { Tooltip, Button } from 'choerodon-ui/pro';

import { CopyButton, TagRender } from 'utils/renderer';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { openComfirmModal } from 'utils/modals';
import Searchbar from 'components/SearchBar';
// import SwalAlert from 'components/swal';
import * as HmallConfig from 'utils/api-config';
import { HmallOptions } from 'utils/options';
import * as Hmall from 'utils/utils';
import request from 'utils/request';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import Pagination from 'components/Pagination';
import Loading from 'components/loading';
import Link from 'components/Link';
import Image from 'components/Image';
// import Tags from 'components/Tag';
// import Swal from 'components/swal';
import {
  submitomsWayBill,
  fetchomsCancelAfterSale,
  fetchomsSureMessage,
  sentAfterSaleomsService,
} from 'services/saleDetailService';
import TabButtons from 'components/TabButtons';
import { applyRefundService } from 'services/orderCenterService';
// import WayBillModal from '@/routes/OMSSaleDetail/WayBillForm';
import ReasonModal from '@/routes/OMSSaleDetail/ReasonModal';
import { afterSaleApplication } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import CuxWrapper from '@/cuxTools/CuxWrapper';
import CuxFn from '@/cuxTools/cuxFn';

import style from './index.less';
import useSetState from '@/hooks/useState';
import openWayBillModal from '../openWayBillModal';

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
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/count`; // url
    request(queryUrl, {
      query: { userId, tenantId: organizationId, companyId },
    }).then((res) => {
      setState({ count: res });
    });
  }

  const labelList = [
    {
      countName: 'allNum',
      label: intl.get('mallf.mySaleAfter.view.order.allOrders').d('全部订单'),
      status: '',
    },
    {
      countName: 'submit',
      label: intl.get('mallf.mySaleAfter.status.submitted').d('已提交'),
      status: 'SUBMIT',
    },
    {
      countName: 'pending',
      label: intl.get('mallf.mySaleAfter.status.pendding').d('处理中'),
      status: 'PENDDING',
    },
    {
      countName: 'finish',
      label: intl.get('mallf.mySaleAfter.view.order.FINISH').d('已完成'),
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
      customizeUnitCode: 'MALL.SALEAFTER.APPLICATION.LIST.SEARCH.BAR',
    };
    // setQueryData(queryParams);
    const filterNullQuery = Hmall.filterNullValueObject(queryParams);
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/aftersales/list`; // url
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
        document.querySelector('body').scrollTop = 0;
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
    const children = (
      <CuxWrapper path="MySaleRecord/OMSSale/sentAfterSale/children" value={{ params }}>
        {intl.get(`mallf.mySaleAfter.view.isGoods.sent`).d('是否已发出商品')}?
      </CuxWrapper>
    );

    openComfirmModal({
      title: intl.get(`mallf.mySaleAfter.view.goods.sent`).d('商品发出'),
      border: false,
      children,
      onOk: async () => {
        const flag = await CuxFn({
          name: 'MySaleRecord-fn-sentAfterSaleOnOk',
          value: params,
        })();
        if (!flag) return false;
        setState({ loading: true });
        sentAfterSaleomsService(params)
          .then((res) => {
            if (res) getSaleAfterList(queryData);
          })
          .finally(() => {
            setState({ loading: false });
          });
      },
    });
    // Modal.confirm({
    //   title: intl.get(`mallf.mySaleAfter.view.goods.sent`).d('商品发出'),
    //   children: `${intl.get(`mallf.mySaleAfter.view.isGoods.sent`).d('是否已发出商品')}?`,
    //   onOk: () => {
    //     setState({ loading: true });
    //     sentAfterSaleomsService(params)
    //       .then((res) => {
    //         if (res) getSaleAfterList(queryData);
    //       })
    //       .finally(() => {
    //         setState({ loading: false });
    //       });
    //   },
    //   onCancel() {},
    // });
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

  // 商品发出 查看运单 modal
  const handleCommoditySendsOut = (otherProps) => {
    const modalProps = {
      cecFromCode,
      orderId,
      orderEntryId,
      wayBillData,
      modalVisible,
      submitLoading,
      onOk: handleSubmit,
      ...otherProps,
    };
    openWayBillModal(modalProps);
  };
  // const modalProps = {
  //   cecFromCode,
  //   orderId,
  //   orderEntryId,
  //   wayBillData,
  //   modalVisible,
  //   submitLoading,
  //   onOk: handleSubmit,
  // };

  /**
   * 订单列表
   */
  function renderOrder(item = {}) {
    let afterSaleType;
    switch (item.afterSaleStatus) {
      case 'CANCELED':
        afterSaleType = 'failure';
        break;
      case 'FINISH':
        afterSaleType = 'success';
        break;
      case 'REJECT':
      case 'INTERNAL_REJECT':
        afterSaleType = 'danger';
        break;
      case 'PRODUCT_REJECT':
        afterSaleType = 'danger';
        break;
      default:
        afterSaleType = 'warning';
        break;
    }
    const {
      applyPackageQuantityMeaning,
      applyPackageQuantity,
      applyQuantity,
      applyQuantityMeaning,
      skuType,
    } = item.afterSaleEntryList?.[0] || {};
    const realQuantity =
      skuType === 'CUSTOM'
        ? applyPackageQuantityMeaning || applyPackageQuantity
        : applyQuantityMeaning || applyQuantity;
    return (
      <div className="order-detail">
        <div className="order-number-header">
          <ul>
            <li>
              {intl.get('mallf.mySaleAfter.view.saleRecord.afterApplicationForm').d('售后申请单')}：
              <span>
                <Link
                  style={{ color: Hmall.getPrimaryColor() }}
                  to={`/oms-sale-status?afterSaleId=${item.afterSaleId}&afterSaleCode=${item.afterSaleCode}`}
                >
                  {item.afterSaleCode}
                </Link>
                <CopyButton
                  style={{ top: -3 }}
                  num={item.afterSaleCode}
                  label={intl
                    .get('mallf.mySaleAfter.view.saleRecord.afterApplicationForm')
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
                {intl.get('mallf.mySaleAfter.view.E-commerceSub').d('子订单')}：{item.poSubNum}
              </li>
            )} */}
            <li>
              {item.orderCode && item.orderCode !== 'undefined' && (
                <>
                  {intl.get('mallf.mySaleAfter.view.order.srmPoNum').d('商城订单号')}：
                  <Link
                    style={{ color: Hmall.getPrimaryColor() }}
                    to={`${HmallConfig.contextPath}/oms-order-detail?orderId=${item.orderId}`}
                  >
                    {item.orderCode}
                  </Link>
                </>
              )}
            </li>
            {/* <li>
              {intl.get('mallf.mySaleAfter.view.E-commerce').d('电商')}：
              <span>{item.productSource || '-'}</span>
            </li> */}
            <li>
              {intl.get('mallf.mySaleAfter.view.saleRecord.applicationTime').d('申请时间')}：
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
                  {intl.get('mallf.mySaleAfter.view.saleRecord.refund').d('退款明细')}
                </span>
              </React.Fragment>
            )} */}
          </ul>
        </div>
        <div className="detail-info-col">
          <div className="detail-info-left">
            <div className="detail-info-content">
              <div r-if={item.cecFromCode === 'MANUAL'}>
                {getMamanualRequestImg({ width: '40px', height: '40px' })}
              </div>
              <Link
                r-if={item.cecFromCode !== 'MANUAL'}
                to={`/product-detail?productId=${item.skuId}&sourceFrom=${
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
                  disabled={item.cecFromCode === 'MANUAL'}
                  to={`/product-detail?productId=${item.skuId}&sourceFrom=${
                    item.cecFromCode || 'CATA'
                  }`}
                >
                  {item.skuName}
                </Link>
              </div>
              <span className="detail-info-quantity">×{realQuantity}</span>
            </div>
          </div>
          <ul className="detail-info-right">
            <li className="detail-info-status">
              <span>
                <p title={item.afterSaleTypeMeaning}>
                  {intl.get('mallf.mySaleAfter.view.saleRecord.serviceOrderType').d('服务单类型')}：
                  {item.afterSaleTypeMeaning}
                </p>
                {item.afterSaleItemList?.length > 0 && getSaleItem(item)}
              </span>
            </li>
            <li className="detail-info-handle">
              <div className="todetail">
                {/* <Link
                  to={`/oms-sale-status?afterSaleId=${item.afterSaleId}&afterSaleCode=${item.afterSaleCode}`}
                > */}
                {TagRender({
                  text: item.afterSaleStatusMeaning,
                  type: afterSaleType,
                  style: { maxWidth: '100px', marginRight: 0 },
                  icon: !isEmpty(item?.processErrorInfos) && ( // 申请报错改造为后端控制 - processErrorInfos
                    <Tooltip title={item.afterSaleStatusMeaning} placement="top" />
                  ),
                })}
                {/* <Tags
                  style={{
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                  type={afterSaleType}
                  // className="info"
                  title={item.afterSaleStatusMeaning}
                >
                  {item.afterSaleStatusMeaning}
                </Tags> */}
                {/* <p style={{ marginTop: 4 }}>
                    {intl.get('hzero.common.button.details').d('查看详情')}
                  </p> */}
                {/* </Link> */}
              </div>
            </li>
            <PermissionWrapper permissionList={[afterSaleApplication]}>
              <li className="detail-info-operate">
                {item.afterSaleStatus === 'WAIT_SENT' && (
                  <>
                    {['CATA', 'MANUAL'].includes(item.cecFromCode) ||
                    item.pickWareType === 'PICK_UP' ? (
                      <Button
                        r-title
                        className="operation-btn-primary"
                        funcType="raised"
                        onClick={() => sentAfterSale(item)}
                      >
                        {intl.get('mallf.mySaleAfter.view.product.send').d('商品发出')}
                      </Button>
                    ) : (
                      <Button
                        r-title
                        className="operation-btn-primary"
                        funcType="raised"
                        onClick={() => {
                          setState({
                            afterSaleId: item.afterSaleId,
                            wayBillData: [],
                          });
                          handleCommoditySendsOut({
                            afterSaleId: item.afterSaleId,
                            wayBillData: [],
                          });
                        }}
                      >
                        {intl.get('mallf.mySaleAfter.view.product.send').d('商品发出')}
                      </Button>
                    )}
                  </>
                )}
                {item.canCancelFlag === 1 && (
                  <Button
                    r-title
                    className="operation-btn-flat"
                    funcType="flat"
                    onClick={() => cancelAfterSale(item)}
                  >
                    {intl.get('mallf.mySaleAfter.view.cancel.application').d('取消申请')}
                  </Button>
                )}
                {item.afterSaleStatus === 'WAIT_CONFIRM' && (
                  <Button
                    r-title
                    className="operation-btn-primary"
                    funcType="raised"
                    onClick={() => handleSureMessage(item.afterSaleId, item.orderId)}
                  >
                    {intl.get('mallf.mySaleAfter.view.sure.complete').d('确认完成')}
                  </Button>
                )}
                {item.afterSaleStatus === 'WAIT_PROCESS' &&
                  !item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                    <>
                      {(['CATA', 'MANUAL'].includes(item.cecFromCode) ||
                        item.pickWareType === 'PICK_UP') && (
                        <Button
                          r-title
                          className="operation-btn-primary"
                          funcType="raised"
                          onClick={() => {
                            setState({
                              // modalVisible: true,
                              afterSaleId: item.afterSaleId,
                              cecFromCode: item?.cecFromCode,
                              wayBillData: [],
                            });
                            handleCommoditySendsOut({
                              afterSaleId: item.afterSaleId,
                              cecFromCode: item?.cecFromCode,
                              wayBillData: [],
                            });
                          }}
                        >
                          {intl.get('mallf.mySaleAfter.model.submitWaybill').d('提交运单')}
                        </Button>
                      )}
                    </>
                  )}
                {item.afterSaleStatus === 'WAIT_PROCESS' &&
                  item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                    <Button
                      r-title
                      className="operation-btn-primary"
                      funcType="raised"
                      onClick={() => {
                        const otherProps = {
                          cecFromCode: item?.cecFromCode,
                          orderId: item?.orderId,
                          orderEntryId: item?.afterSaleEntryList?.[0].orderEntryId,
                          wayBillData: item?.afterSaleWaybillList?.find(
                            (p) => p.logisticsType === 'RETURN'
                          ),
                        };
                        setState(otherProps);
                        handleCommoditySendsOut(otherProps);
                      }}
                    >
                      {intl.get('mallf.mySaleAfter.model.fetchWaybill').d('查看运单')}
                    </Button>
                  )}
                {item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RENEW') && (
                  <Button
                    r-title
                    className="operation-btn-flat"
                    funcType="flat"
                    onClick={() => {
                      const otherProps = {
                        orderId: item?.orderId,
                        orderEntryId: item?.afterSaleEntryList?.[0].orderEntryId,
                        wayBillData: item?.afterSaleWaybillList?.find(
                          (p) => p.logisticsType === 'RENEW'
                        ),
                      };
                      setState(otherProps);
                      handleCommoditySendsOut(otherProps);
                    }}
                  >
                    {intl.get('mallf.mySaleAfter.model.check.back.yundan').d('查看商家返件运单')}
                  </Button>
                )}
                {!!item.toRefundPaymentId && (
                  <Button
                    r-title
                    className="operation-btn-flat"
                    funcType="flat"
                    onClick={() => handleApplyRefund(item)}
                  >
                    {intl.get('mallf.mySaleAfter.view.applyRefund').d('申请退款')}
                  </Button>
                )}
              </li>
            </PermissionWrapper>
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
  //       meaning: intl.get('mallf.mySaleAfter.view.order.srmPoNum').d('商城订单号'),
  //     },
  //     {
  //       value: 'productName',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.commodityNames').d('商品名称'),
  //     },
  //     {
  //       value: 'afterSaleNum',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.requisitionNumber').d('申请单号'),
  //     },
  //   ],
  //   optionsTime: [
  //     {
  //       value: '',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.all').d('全部'),
  //     },
  //     {
  //       value: 'threeMonth',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.threeMonths').d('三个月'),
  //     },
  //     {
  //       value: 'oneMonth',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.oneMonth').d('一个月'),
  //     },
  //     {
  //       value: 'oneWeek',
  //       meaning: intl.get('mallf.mySaleAfter.model.search.oneWeek').d('一周'),
  //     },
  //   ],
  // };

  // 填写运单
  const handleSubmit = (params) => {
    submitomsWayBill(params).then((res) => {
      if (res) {
        getSaleAfterList(queryData);
      }
    });
  };

  const { afterSaleCode } = record;
  const reasonProps = {
    reasonVisible,
    afterSaleCode,
    onOk: (param) => omsCancelAfterSale(record, param),
    onCancel: () => setState({ reasonVisible: false }),
  };

  return (
    <div className={style['sale-after-record']}>
      <Row style={{ marginBottom: '15px' }}>
        {/* <Col span={12}> */}
        <TabButtons
          tabList={labelList}
          currentTab={currentStatus}
          setCurrentTab={(e) => {
            searchBarRef.current.handleResetFilter();
            setState({ currentStatus: e });
          }}
          count={count}
          customizedCode="MALL-OMS-SALERECORD-LIST-TAB"
        />
        {/* </Col> */}
      </Row>

      <Searchbar
        handleSearch={({ params }) => getSaleAfterList({ ...params })}
        searchCode="MALL.SALEAFTER.APPLICATION.LIST.SEARCH.BAR"
        searchBarRef={(ref) => {
          searchBarRef.current = ref;
        }}
      />

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
                style={{ width: '100%', marginTop: 15 }}
                zeroStart
                showQuickJumper
                {...pagination}
                onForward={getSaleAfterList}
              />
            </Fragment>
          ) : (
            <div className="empty-order-list">
              <div className="info">
                {intl.get('mallf.mySaleAfter.view.noAfterSalesInfo').d('暂无售后信息')}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* {modalVisible && <WayBillModal {...modalProps} />} */}
      {reasonVisible && <ReasonModal {...reasonProps} />}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(SaleRecord);
