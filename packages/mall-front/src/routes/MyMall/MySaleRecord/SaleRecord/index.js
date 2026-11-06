import React, { useState, useEffect, Fragment } from 'react';
import { Form, Row, Col, Modal } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import { CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import NewMyMallSearch from 'components/NewMyMallSearch';
// import SwalAlert from 'components/swal';
import * as HmallConfig from 'utils/api-config';
import { HmallOptions } from 'utils/options';
import * as Hmall from 'utils/utils';
import request from 'utils/request';
import Pagination from 'components/Pagination';
import Loading from 'components/loading';
import Link from 'components/Link';
import Image from 'components/Image';
import Tags from 'components/Tag';
import {
  submitWayBill,
  fetchCancelAfterSale,
  fetchSureMessage,
  sentAfterSaleService,
} from 'services/saleDetailService';
import TabButtons from 'components/TabButtons';
import WayBillModal from '@/routes/SaleDetail/WayBillForm';
import ReasonModal from '@/routes/SaleDetail/ReasonModal';
import useSetState from '@/hooks/useState';
import { afterSaleApplication } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
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
    visible,
    newList,
    record,
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
    ecPlatform: '',
    serviceType: '',
    userId,
    purchaseType: Hmall.getUserConfigInfo().purchaseType,
  });

  useEffect(() => {
    getCounts();
  }, []);

  useEffect(() => {
    getSaleAfterList({ ...queryData, page: 0 });
  }, [currentStatus]);

  function getCounts() {
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/count`; // url
    request(queryUrl, {
      query: { userId, tenantId: organizationId, companyId },
    }).then((res) => {
      setState({ count: res });
    });
  }

  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : Hmall.convertImg(url, 1, code);
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
    const formData = props.form.getFieldsValue();
    const queryParams = {
      ...formData,
      ...queryData,
      ...params,
      displayStatus: currentStatus,
      size: params.size || queryData.size || 10,
    };
    // setQueryData(queryParams);
    const filterNullQuery = Hmall.filterNullValueObject(queryParams);
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/after-sales/list`; // url
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
      title: intl.get(`mallf.mySaleAfter.view.goods.sent`).d('商品发出'),
      content: `${intl.get(`mallf.mySaleAfter.view.isGoods.sent`).d('是否已发出商品')}?`,
      onOk() {
        setState({ loading: true });
        sentAfterSaleService(params)
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
    if (item.sourceCode !== 'CATA') {
      setState({
        record: item,
        reasonVisible: true,
      });
      return false;
    }
    cancelAfterSaleService(item);
  };

  const cancelAfterSaleService = (item, param) => {
    const { sourceCode, afterSaleId } = item || record;
    const parmas =
      sourceCode !== 'CATA'
        ? {
            afterSaleId,
            ...param,
          }
        : { afterSaleId };
    setState({ loading: true });
    fetchCancelAfterSale(parmas)
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
  const handleSureMessage = (afterSaleId) => {
    setState({ loading: true });
    fetchSureMessage(afterSaleId)
      .then((res) => {
        if (res) getSaleAfterList(queryData);
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

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
              {intl.get('mallf.mySaleAfter.view.saleRecord.afterApplicationForm').d('售后申请单')}：
              <span>
                {item.afterSaleNum}
                <CopyButton
                  num={item.afterSaleNum}
                  label={intl
                    .get('mallf.mySaleAfter.view.saleRecord.afterApplicationForm')
                    .d('售后申请单')}
                />
              </span>
              {/* <Link
                to={`${HmallConfig.contextPath}/sale-status?afterSaleId=${item.afterSaleId}`}
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
              {item.poNum && item.poNum !== 'undefined' && (
                <>
                  {intl.get('mallf.mySaleAfter.view.order.srmPoNum').d('商城订单号')}：
                  <Link
                    style={{ color: Hmall.getPrimaryColor() }}
                    to={`${HmallConfig.contextPath}/order-detail?poHeaderId=${item.poHeaderId}`}
                  >
                    {item.poNum}
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
              <span>{item.applicationTime}</span>
            </li>
            {item.refundStatus && (
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
            )}
          </ul>
        </div>
        <div className="detail-info-col">
          <div className="detail-info-left">
            <div className="detail-info-content">
              <Link
                to={`/product-detail?productId=${item.ecProductId || item.productId}&sourceFrom=${
                  item.ecPlatform || 'CATA'
                }`}
              >
                <Image
                  value={HandleImgUrl(item.ecPlatform || 'CATA', item.imagePath)}
                  width={40}
                  height={40}
                />
              </Link>
              <div className="productname">
                <Link
                  to={`/product-detail?productId=${item.productId || item.productId}&sourceFrom=${
                    item.platformCode || 'CATA'
                  }`}
                >
                  {item.productName}
                </Link>
              </div>
              <span className="detail-info-quantity">
                ×{item.realityQuantity || item.applyQuantity}
              </span>
            </div>
          </div>
          <ul className="detail-info-right">
            <li className="detail-info-status">
              <span>
                <p>
                  {intl.get('mallf.mySaleAfter.view.saleRecord.serviceOrderType').d('服务单类型')}：
                  {serviceTypeMapping[item.afsType]}
                </p>
                {item.afterSaleItemList?.length > 0 && getSaleItem(item)}
              </span>
            </li>
            <li className="detail-info-handle">
              <div className="todetail">
                <Link to={`/sale-status?afterSaleId=${item.afterSaleId}`}>
                  <Tags style={{ display: 'inline-block' }} type={afterSaleType}>
                    {item.afterSaleStatusName}
                  </Tags>
                  <p style={{ marginTop: 4 }}>
                    {intl.get('hzero.common.button.details').d('查看详情')}
                  </p>
                </Link>
              </div>
            </li>
            <PermissionWrapper permissionList={[afterSaleApplication]}>
              <li className="detail-info-operate">
                {item.afterSaleStatus === 'WAIT_SENT' && (
                  <div className="operation-btn" onClick={() => sentAfterSale(item)}>
                    {intl.get('mallf.mySaleAfter.view.product.send').d('商品发出')}
                  </div>
                )}
                {['APPROVING', 'WAIT_SENT'].includes(item.afterSaleStatus) &&
                  item.isCanceAfsEnabled && (
                    <div className="operation-btn" onClick={() => cancelAfterSale(item)}>
                      {intl.get('mallf.mySaleAfter.view.cancel.application').d('取消申请')}
                    </div>
                  )}
                {item.afterSaleStatus === 'WAIT_CONFIRM' && (
                  <div
                    className="operation-btn"
                    onClick={() => handleSureMessage(item.afterSaleId)}
                  >
                    {intl.get('mallf.mySaleAfter.view.sure.complete').d('确认完成')}
                  </div>
                )}
                {item.afterSaleStatus === 'WAIT_PROCESS' && isEmpty(item.afterSaleWaybillList) && (
                  <div
                    className="operation-btn"
                    onClick={() => setState({ modalVisible: true, afterSaleId: item.afterSaleId })}
                  >
                    {intl.get('mallf.mySaleAfter.model.submitWaybill').d('提交运单')}
                  </div>
                )}
                {item.afterSaleStatus === 'WAIT_PROCESS' && !isEmpty(item.afterSaleWaybillList) && (
                  <div
                    className="operation-btn"
                    onClick={() =>
                      setState({
                        modalVisible: true,
                        wayBillData: item.afterSaleWaybillList?.find((n) => n.logisticsType === 0),
                      })
                    }
                  >
                    {intl.get('mallf.mySaleAfter.model.fetchWaybill').d('查看运单')}
                  </div>
                )}
                {item?.afterSaleWaybillList?.some((p) => p.logisticsType === 1) && (
                  <div
                    className="operation-btn"
                    onClick={() =>
                      setState({
                        modalVisible: true,
                        wayBillData: item?.afterSaleWaybillList?.find((p) => p.logisticsType === 1),
                      })
                    }
                  >
                    {intl.get('mallf.mySaleAfter.model.check.back.yundan').d('查看商家返件运单')}
                  </div>
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

  /**
   * 退款明细弹框
   */
  function showRefundDetail(item) {
    setState({ visible: true, newList: item.afterSaleItemList || {}, record: { record: item } });
  }

  /**
   * 关闭退款明细弹框
   */
  function handleCancel() {
    setState({ newList: {}, visible: false });
  }

  const searchProps = {
    onSearch: getSaleAfterList,
    configs: [
      {
        defaultFlag: true,
        fieldName: intl.get('mallf.mySaleAfter.view.order.srmPoNum').d('商城订单号'),
        fieldCode: 'poNum',
      },
      {
        fieldName: intl.get('mallf.mySaleAfter.model.search.commodityNames').d('商品名称'),
        fieldCode: 'productName',
      },
      {
        fieldName: intl.get('mallf.mySaleAfter.model.search.requisitionNumber').d('申请单号'),
        fieldCode: 'afterSaleNum',
      },
      {
        fieldName: intl.get('mallf.common.view.message.timeRange').d('时间范围'),
        fieldCode: 'time',
        fieldType: 'Select',
        filedContent: [
          {
            value: '',
            meaning: intl.get('mallf.mySaleAfter.model.search.all').d('全部'),
          },
          {
            value: 'threeMonth',
            meaning: intl.get('mallf.mySaleAfter.model.search.threeMonths').d('三个月'),
          },
          {
            value: 'oneMonth',
            meaning: intl.get('mallf.mySaleAfter.model.search.oneMonth').d('一个月'),
          },
          {
            value: 'oneWeek',
            meaning: intl.get('mallf.mySaleAfter.model.search.oneWeek').d('一周'),
          },
        ],
      },
    ],
  };

  // 填写运单
  const handleSubmit = (params) => {
    const { afterSaleId } = state;
    const newParams = {
      ...params,
      afterSaleId,
      logisticsType: 0,
    };
    submitWayBill(newParams).then((res) => {
      if (res) {
        setState({ modalVisible: false });
        getSaleAfterList(queryData);
      }
    });
  };

  const modalProps = {
    wayBillData,
    modalVisible,
    submitLoading,
    onOk: handleSubmit,
    onCancel: () => setState({ modalVisible: false }),
  };
  const reasonProps = {
    reasonVisible,
    onOk: (param) => cancelAfterSaleService(record, param),
    onCancel: () => setState({ reasonVisible: false }),
  };

  return (
    <div className={style['sale-after-record']}>
      <Row style={{ marginBottom: '15px' }}>
        <Col>
          <TabButtons
            tabList={labelList}
            currentTab={currentStatus}
            setCurrentTab={(e) => setState({ currentStatus: e })}
            count={count}
            customizedCode="MALL-SALERECORD-LIST-TAB"
          />
        </Col>
      </Row>
      <Row style={{ marginBottom: '5px' }}>
        <Col>
          <NewMyMallSearch {...searchProps} />
        </Col>
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
      <Modal
        destroyOnClose
        wrapClassName="hmall-content-Modal"
        width={936}
        title={intl.get('mallf.mySaleAfter.view.saleRecord.refund').d('退款明细')}
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <div className={style['resundDetail-modal']}>
          <div className="resundDetail-content">
            <div className="resundDetail-hint">
              <div className="image">&nbsp;</div>
              <span>
                {intl.get('mallf.mySaleAfter.view.saleRecord.applicationPass').d('申请审核通过')}
                <br />
                {intl.get('mallf.mySaleAfter.view.saleRecord.refundSuccess').d('退款成功')}
              </span>
            </div>
            <div className="resundDetail-list">
              <ul className="resundDetail-list-title">
                <li>&nbsp;</li>
                <li style={{ width: '220px' }}>
                  {intl.get('mallf.mySaleAfter.view.common.productName').d('商品名称')}
                </li>
                <li>{intl.get('mallf.mySaleAfter.view.productNum').d('商品编码')}</li>
                <li>{intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}</li>
                <li>{intl.get('mallf.mySaleAfter.view.saleRecord.refund.amount').d('退款数量')}</li>
                <li>{intl.get('mallf.mySaleAfter.view.saleRecord.refund.status').d('退款状态')}</li>
                <li>{intl.get('mallf.mySaleAfter.view.saleRecord.refund.money').d('退款金额')}</li>
              </ul>
              <ul className="resundDetail-list-info">
                <li>
                  <span>&nbsp;</span>
                </li>
                <li className="goodsname">{record.ecProductName}</li>
                <li>{newList && newList.ecProductNum}</li>
                <li>{newList && newList.price}</li>
                <li>{newList && newList.realityQuantity}</li>
                <li>{record.refundStatus}</li>
                <li className="money">{newList && newList.payPrice}</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
      {modalVisible && <WayBillModal {...modalProps} />}
      {reasonVisible && <ReasonModal {...reasonProps} />}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(SaleRecord);
