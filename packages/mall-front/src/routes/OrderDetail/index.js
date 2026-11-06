import React from 'react';
import classnames from 'classnames';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
import { Steps, Breadcrumb, Col, Row, Popover, Tooltip, Icon, Badge } from 'choerodon-ui';
import { Attachment, DataSet } from 'choerodon-ui/pro';
import { Icon as HIcon } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, compose } from 'lodash';

import {
  myInvoice,
  afterSaleApplication,
  orderAssociatedDoc,
} from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import BudgetInfo from 'components/NewBudgetInfo';
import Tags from 'components/Tag';
import intl from 'utils/intl';
import request from 'utils/request';
import Link from 'components/Link';
import Loading from 'components/loading';
import FillInfo from 'components/FillInfo';
import * as HmallConfig from 'utils/api-config';
import * as Hmall from 'utils/utils';
import swalAlert from 'components/swal';
import LogisticsDrawer from 'components/LogisticsDrawer';
import Image from 'components/Image';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { batchGetCodes } from 'services/api';
import { fetchBudgetLov } from 'services/productDetailService';
import { fetchConfirm, fetchOrderAgain } from 'services/orderCenterService';
import styles from './index.less';
import AssociatedDoc from './AssociatedDoc';
import AcceptRecord from './AcceptRecord';
import CommentModal from '@/routes/MyMall/OMSOrder/common/CommentModal';
import AcceptModal from '@/routes/MyMall/OMSOrder/common/AcceptModal';
import InvoiceModal from '@/routes/MyMall/OMSOrder/common/InvoiceModal';
import LeaveWordModal from '@/routes/MyMall/OMSOrder/common/LeaveWordModal';
import NeededDateContent from './NeededDate/Content';
import NeededDateHeader from './NeededDate/Header';

const headerCode = 'MALL.BEFORE.ORDER.HEADER.SUPPLY';
const ECLineCode = 'MALL.BEFORE.ORDER.EC.LINE.SUPPLY';
const CATALineCode = 'MALL.BEFORE.ORDER.LINE.SUPPLY';

class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      orderData: {},
      AssociatedDocV: false,
      AcceptRecordV: false,
      currentProduct: {},
      invoiceVisible: false,
      colSpan: 8,
      budgetList: [],
      budgetSelectList: [],
      commentVisible: false,
      commentProduct: {},
      leaveWordVisible: false,
      srmPoHeaderId: '',
    };
  }

  headerDs = new DataSet();

  tableDs = new DataSet();

  componentDidMount() {
    const { poHeaderId } = qs.parse(this.props.location.search.substr(1));
    const { budgetSwitch } = Hmall.getUserConfigInfo();
    this.fetchOrderDetail(poHeaderId); // 查询详情
    if (budgetSwitch === '1') this.getBudgetInfo();
  }

  // 预算值集查询
  getBudgetInfo = () => {
    fetchBudgetLov().then((res) => {
      if (res) {
        let selectLovCodeObj = {};
        res
          .filter((item) => item.componentType === 'SELECT')
          .forEach((n) => {
            const { lovCode } = n;
            selectLovCodeObj = { ...selectLovCodeObj, [lovCode]: lovCode };
          });
        this.setState({
          budgetList: res,
        });
        if (!isEmpty(selectLovCodeObj)) {
          batchGetCodes(selectLovCodeObj).then((resp) => {
            if (resp) {
              this.setState({
                budgetSelectList: resp,
              });
            }
          });
        }
      }
    });
  };

  custInit = () => {
    const { separateInitCustUnit } = this.props;
    const { platformCode } = this.state;
    separateInitCustUnit({
      code: headerCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: this.headerDs,
      },
    });
    separateInitCustUnit({
      code: platformCode !== 'CATA' && platformCode !== 'MANUAL' ? ECLineCode : CATALineCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: this.tableDs,
      },
    });
  };

  // 查询订单详情
  fetchOrderDetail = (poHeaderId) => {
    const { organizationId } = Hmall.getUserConfigInfo();
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/po-headers/${organizationId}/detail?poHeaderId=${poHeaderId}`;
    this.setState({
      loading: true,
    });
    request(queryUrl, {
      query: { customizeUnitCode: `${headerCode},${ECLineCode},${CATALineCode}` },
    })
      .then((res) => {
        if (res) {
          this.setState({
            orderData: res,
            platformCode: res.poLineList?.[0]?.poLineList?.[0]?.platformCode,
            colSpan: res.poLineList?.[0]?.poLineList?.[0]?.platformCode !== 'CATA' ? 6 : 8,
          });
        }
      })
      .catch(() => {
        this.setState({ orderData: {} });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
        this.custInit();
      });
  };

  // 图片地址处理
  HandleImgUrl(code, url) {
    return code === 'CATA' ? url : Hmall.convertImg(url, 1, code);
  }

  /**
   * 展开收起
   */
  toggleIogistics = () => {
    this.setState({
      display: !this.state.display,
    });
  };

  /**
   * 再次购买
   */
  onAgainOrder = (params) => {
    fetchOrderAgain(params).then((res) => {
      if (res) {
        this.props.dispatch({
          type: 'global/update',
          payload: { showMiniCart: true },
        });
      }
    });
  };

  toggleModalAssociatedDoc = (product) => {
    this.setState({
      AssociatedDocV: !this.state.AssociatedDocV,
      currentProduct: product,
    });
  };

  toggleModalAcceptRecord = (product) => {
    this.setState({
      AcceptRecordV: !this.state.AcceptRecordV,
      currentProduct: product,
    });
  };

  toggleInvoiceModal = (product) => {
    this.setState({
      invoiceVisible: !this.state.invoiceVisible,
      currentProduct: product,
    });
  };

  handleComment = (product) => {
    const { poNum, createDate } = this.state.orderData;
    this.setState({
      commentVisible: true,
      commentProduct: { ...product, poNum, createDate },
    });
  };

  /**
   * 接收预览
   * @param {*} params 收货/批量收货查询参数
   * @param {*} type 收货/批量收货(''/'batch')
   */
  handleAccept = (params = []) => {
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
        uomPrecision,
      } = n;
      return {
        asnLineId,
        productId,
        productNum,
        imagePath,
        platformCode,
        creationDate,
        freightLineLocationId,
        freightReceiveList,
        poLineId,
        uomPrecision,
      };
    });
    const newFreightReceiveList = params.map((n) => ({ asnLineId: n.freightLineLocationId }));
    this.setState({
      asnLineIds: [...newParams, ...newFreightReceiveList],
      acceptVisible: true,
    });
  };

  status = (product) => {
    let subStatus;
    switch (product.subStatus) {
      case 'CANCELLED':
        subStatus = 'cancel';
        break;
      case 'FINISH':
        subStatus = 'success';
        break;
      case 'REJECT':
        subStatus = 'failed';
        break;
      case 'PRODUCT_REJECT':
        subStatus = 'failed';
        break;
      default:
        subStatus = 'info';
        break;
    }
    return subStatus;
  };

  /**
   * 商品列表
   */
  renderProducts = (list) => {
    return (
      <div className="product-wrapper">
        <div className="product-detail-info-title">
          {intl.get(`mallf.myOrder.view.productInformation`).d('商品信息')}
        </div>
        <div className="product-header">
          <div className="product-header-left">
            <span
              className="product-info"
              style={
                list?.some((p) => p.poLineList?.some((i) => !!i.userName)) ? { width: 244 } : {}
              }
            >
              {intl.get(`mallf.myOrder.view.productInformation`).d('商品信息')}
            </span>
            <span className="product-num">
              {intl.get('mallf.myOrder.view.productCode').d('商品编码')}
            </span>
            <NeededDateHeader />
            <span className="product-price">
              {intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}
            </span>
            <span className="product-quantity">
              {intl.get(`mallf.orderDetail.view.productNum.order`).d('数量')}
            </span>
            <span className="product-total">
              {intl.get('mallf.common.view.line.amount.price').d('行金额(含税)')}
            </span>
            <span className="product-status">{intl.get('hzero.common.status').d('状态')}</span>
          </div>
          <div className="operate">
            {intl.get(`mallf.orderDetail.view.operating`).d('操作')}
            {/* <Tooltip
              title={intl.get('mallf.myOrder.view.order.orderAgain').d('再来一单')}
              placement="top"
            >
              <Icon
                type="add_shopping_cart-o"
                style={{
                  fontSize: 12,
                  lineHeight: '18px',
                  cursor: 'pointer',
                  float: 'right',
                  color: Hmall.getPrimaryColor(),
                }}
                onClick={() => this.onAgainOrder([{ poHeaderId }])}
              />
            </Tooltip> */}
          </div>
        </div>
        {list?.map((item) => {
          const { srmPoNum, srmPoHeaderId, poLineList } = item;
          const subList = {};
          const isEC = poLineList?.[0].platformCode !== 'CATA';
          if (isEC) {
            item.poLineList.forEach((x) => {
              if (subList[x.poSubNum]) {
                subList[x.poSubNum] = subList[x.poSubNum].concat(x);
              } else {
                subList[x.poSubNum] = [x];
              }
            });
          }
          return (
            <>
              {srmPoNum && (
                <div className="product-po-num">
                  <span>
                    {intl.get('mallf.myMall.view.catalog.purchaseOrderNum').d('采购订单号')}：
                    {srmPoNum}
                  </span>
                  {srmPoHeaderId && (
                    <span>
                      <Badge size="small" count={item?.poMessageUnread?.unreadCount}>
                        <Icon
                          size={16}
                          type="message2"
                          onClick={() => this.setState({ leaveWordVisible: true, srmPoHeaderId })}
                        />
                      </Badge>
                    </span>
                  )}
                </div>
              )}
              {isEC
                ? Object.keys(subList).map((poSubNum) => {
                    return subList[poSubNum].map((product, index) => {
                      return this.renderSubProduct({ product, index, subList: subList[poSubNum] });
                    });
                  })
                : poLineList.map((product, index) => {
                    return this.renderSubProduct({ product, index });
                  })}
            </>
          );
        })}
      </div>
    );
  };

  renderSubProduct = ({ product, index, subList = [] }) => {
    const { poSubNum, poSubHeaderId, platformCode } = product;
    const { hideFieldList } = Hmall.getUserConfigInfo();
    const {
      orderData: { poNum },
      budgetList,
      budgetSelectList,
    } = this.state;
    const logisticsProps = {
      poSubNum,
      poSubHeaderId,
      ecPlatformCode: platformCode,
    };
    const { custConfig: unitConfig } = this.props;
    return (
      <div className="product-list">
        <div className="product-list-left">
          <div className="product-list-line">
            <div className="product-info" style={product.userName ? { width: 244 } : {}}>
              <Link
                disabled={!!product.qtHeaderNo}
                to={`/product-detail?productId=${product.productId}&sourceFrom=${product.platformCode}`}
              >
                <Image
                  value={this.HandleImgUrl(product.platformCode, product.imagePath)}
                  width={36}
                  height={36}
                />
              </Link>
              <div className="product-name">
                <Link
                  title={product.productName}
                  disabled={!!product.qtHeaderNo}
                  className="product-name-label"
                  to={`/product-detail?productId=${product.productId}&sourceFrom=${product.platformCode}`}
                >
                  {product.productName}
                </Link>
                <p className="product-remark">
                  <span className="product-remark-label">
                    {intl.get('mallf.myOrder.view.remark.info').d('备注信息')}：
                  </span>
                  <Popover content={product.remark}>
                    <span>
                      {product.remark?.length > 15
                        ? `${product.remark.substring(0, 15)}...`
                        : product.remark}
                    </span>
                  </Popover>
                </p>
              </div>
            </div>
            <span className="product-num">{product.productNum}</span>
            <NeededDateContent product={product} />
            <span
              className="product-price price-color"
              title={Hmall.numberRender(product.skuType === 0 ? product.price : 0)}
            >
              {product?.currencySymbol || ''}
              {Hmall.numberRender(product.skuType === 0 ? product.price : 0)}
              {/* <p>{product.currencyCode}</p> */}
            </span>
            <span className="product-quantity">{product.quantity}</span>
            <span
              className="product-total"
              title={`${product?.currencySymbol || ''}${Hmall.numberRender(
                product.orderAmount,
                product.financialPrecision,
                true
              )}`}
            >
              {product?.currencySymbol || ''}
              {Hmall.numberRender(product.orderAmount, product.financialPrecision, true)}
            </span>
            <span className="product-status">
              <p>
                <Tags
                  title={product.subStatusName}
                  style={{ margin: 0, display: 'inline-block', maxWidth: '100%' }}
                  type={this.status(product)}
                >
                  {product.subStatusName}
                </Tags>
                {product.denialReason && ['REJECT', 'CANCELLED'].includes(product.subStatus) && (
                  <Tooltip
                    title={`${intl.get('mallf.myOrder.view.denial.reason').d('拒绝原因')}：${
                      product.denialReason
                    }`}
                    placement="top"
                  >
                    <HIcon
                      style={{ marginLeft: '6px', color: '#F56649' }}
                      type="exclamation-circle"
                      size={14}
                    />
                  </Tooltip>
                )}
              </p>
            </span>
          </div>
        </div>
        <div className="product-list-right">
          <div>
            {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
              hideFieldList &&
              !hideFieldList.includes('LOGISTICS') && (
                <div className="right-btn">
                  <LogisticsDrawer {...logisticsProps}>
                    {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
                  </LogisticsDrawer>
                </div>
              )}
            {product.srmInvoiceFlag === 1 && (
              <PermissionWrapper permissionList={myInvoice}>
                <div className="right-btn" onClick={() => this.toggleInvoiceModal(product)}>
                  {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                </div>
              </PermissionWrapper>
            )}
            {!isEmpty(budgetList) && (
              <div className="right-btn">
                <span>
                  <BudgetInfo
                    remainingVisible={false}
                    disabled
                    budgetData={product}
                    budgetList={budgetList}
                    budgetSelectList={budgetSelectList}
                    editBudget={(n) => n}
                  />
                </span>
              </div>
            )}
            <PermissionWrapper permissionList={[orderAssociatedDoc]}>
              <div className="right-btn" onClick={() => this.toggleModalAssociatedDoc(product)}>
                {intl.get('mallf.myOrder.view.associated.doc').d('关联单据')}
              </div>
            </PermissionWrapper>
            {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) && (
              <div className="right-btn" onClick={() => this.toggleModalAcceptRecord(product)}>
                {intl.get('mallf.myOrder.view.receiving.records').d('接收记录')}
              </div>
            )}
            <FillInfo
              dataSet={this.tableDs}
              cSupply={this.props.cSupply}
              unitConfig={unitConfig}
              dataSource={product}
              code={platformCode === 'CATA' ? CATALineCode : ECLineCode}
              className="right-btn"
            />
          </div>
          <div>
            <>
              {product.waitAssessFlag === 1 && (
                <div className="right-btn" onClick={() => this.handleComment(product)}>
                  {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                </div>
              )}
              {product.waitAssessFlag === 2 && (
                <div className="right-btn" onClick={() => this.handleComment(product)}>
                  {intl.get('mallf.common.view.goto.addComment').d('追加评论')}
                </div>
              )}
              {product.waitAssessFlag === 3 && (
                <div className="right-btn" onClick={() => this.handleComment(product)}>
                  {intl.get('mallf.common.view.goto.commentView').d('查看评论')}
                </div>
              )}
              {/* {!(platformCode !== 'CATA' && index > 0) &&
                (!isEmpty(product.receiveList) || !isEmpty(product.freightReceiveList)) &&
                hideFieldList &&
                !hideFieldList.includes('ACCEPTANCE') && (
                  <div
                    className="right-btn"
                    onClick={() => {
                      if (platformCode !== 'CATA' && index === 0) {
                        this.handleAccept(subList);
                      } else {
                        this.handleAccept([product]);
                      }
                    }}
                  >
                    {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                  </div>
                )} */}
              {!(platformCode !== 'CATA' && index > 0) &&
                product.enableMallReceiveCheck !== '-1' &&
                hideFieldList &&
                !hideFieldList.includes('ACCEPTANCE') && (
                  <Tooltip
                    title={
                      product.enableMallReceiveCheck === '0'
                        ? intl
                            .get('mallf.myOrder.view.nosurport.accept')
                            .d('此商品不支持在商城接收')
                        : null
                    }
                    placement="bottom"
                  >
                    <div
                      onClick={() => {
                        if (product.enableMallReceiveCheck === '1') {
                          if (platformCode !== 'CATA' && index === 0) {
                            this.handleAccept(subList);
                          } else {
                            this.handleAccept([product]);
                          }
                        }
                      }}
                      className={classnames([
                        'right-btn',
                        { disabled: product.enableMallReceiveCheck === '0' },
                      ])}
                    >
                      {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                    </div>
                  </Tooltip>
                )}
              {!!product.afterSaleFlag && (
                <PermissionWrapper permissionList={[afterSaleApplication]}>
                  <Link
                    className="right-btn"
                    to={`/sale-detail?poLineId=${product.poLineId}&poNum=${poNum}&productNum=${product.productNum}&poSubNum=${product.poSubNum}`}
                  >
                    {intl.get('mallf.myOrder.view.afterSales.application').d('售后申请')}
                  </Link>
                </PermissionWrapper>
              )}
            </>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 确认收货
   */
  confirm = () => {
    const { ecPoSubNum, ecPlatformCode } = qs.parse(this.props.location.search.substr(1));
    fetchConfirm({ ecPoSubNum, ecPlatformCode }).then((res) => {
      if (res.success) {
        swalAlert(intl.get('mallf.orderDetail.view.orderDetail.confirmReceipt').d('确认收货成功'));
      } else {
        swalAlert(res.resultMsg);
      }
    });
    this.props.history.push(`/refresh`);
  };

  changeState = (data) => {
    this.setState(data);
  };

  render() {
    const {
      orderData = {},
      loading,
      AssociatedDocV,
      AcceptRecordV,
      currentProduct,
      acceptVisible,
      asnLineIds,
      invoiceVisible,
      colSpan,
      platformCode,
      commentVisible,
      commentProduct,
      leaveWordVisible,
      srmPoHeaderId,
    } = this.state;
    const { poHeaderId } = qs.parse(this.props.location.search.substr(1));
    const { custConfig: unitConfig } = this.props;
    const { poNum, orderStatusDetails = [], poLineList, count, ...order } = orderData;
    const { financialPrecision, currencySymbol } = poLineList?.[0]?.poLineList?.[0] || {};
    const currentStep = orderStatusDetails.map((step) => step.flag).indexOf(1);
    const commentModalProps = {
      commentVisible,
      setState: (val) => this.setState(val),
      commentProduct,
      fetchOrderData: () => this.fetchOrderDetail(poHeaderId),
    };
    return (
      <div className={styles['order-detail-container']}>
        {loading || this.props.custLoading ? (
          <Loading />
        ) : (
          <>
            <Breadcrumb className="order-detail-breadcrumb" separator=">">
              <Breadcrumb.Item href="/">
                {intl.get('mallf.myOrder.view.homePage').d('首页')}
              </Breadcrumb.Item>
              <Breadcrumb.Item href="/my-mall/my-order">
                {intl.get('mallf.myOrder.view.orderCenter').d('订单中心')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${intl.get(`mallf.orderDetail.view.order.detailNum`).d('订单')}: ${poNum}`}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="order-detail-list container">
              {orderStatusDetails?.length > 0 && (
                <Steps className="order-detail-steps" current={currentStep === 3 ? 4 : currentStep}>
                  {orderStatusDetails.map((step) => (
                    <Steps.Step title={step.text} />
                  ))}
                </Steps>
              )}
              <div className="service-list">
                <div className="service-list-header">
                  {intl.get(`mallf.orderDetail.view.orderDetail.detail`).d('订单信息')}
                </div>
                <div className="service-list-content">
                  <Row gutter={12}>
                    <Col span={colSpan}>
                      <Row className="list-title">
                        {intl
                          .get(`mallf.orderDetail.view.orderDetail.recInformation`)
                          .d('收货人信息')}
                      </Row>
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.orderDetail.view.orderDetail.recipient`).d('收货人')}：
                        </span>
                        <span className="label-content">{order.receivingContactName}</span>
                      </Row>
                      <Row>
                        <span className="label">
                          {intl
                            .get(`mallf.orderDetail.view.orderDetail.contactInformation`)
                            .d('联系方式')}
                          ：
                        </span>
                        <span className="label-content">{order.receivingMobile}</span>
                      </Row>
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.orderDetail.view.orderDetail.recAddress`).d('收货地址')}
                          ：
                        </span>
                        <span className="label-content">{order.receivingAddress}</span>
                      </Row>
                    </Col>
                    <Col span={colSpan}>
                      <Row className="list-title">
                        {intl
                          .get(`mallf.orderDetail.view.orderDetail.payInformation`)
                          .d('付款信息')}
                      </Row>
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.orderDetail.view.orderDetail.payTime`).d('支付时间')}：
                        </span>
                        <span className="label-content">{order.paymentTime || '-'}</span>
                      </Row>
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.orderDetail.view.orderDetail.payMethod`).d('付款方式')}：
                        </span>
                        <span className="label-content">{order.paymentTypeName}</span>
                      </Row>
                      <Row>
                        <span className="label">
                          {intl
                            .get(`mallf.orderDetail.view.orderDetail.totalPrice`)
                            .d('商品金额(含税)')}
                          ：
                        </span>
                        <span className="label-content">
                          {order?.currencySymbol || ''}
                          {Hmall.numberRender(order.orderAmount, financialPrecision, true)}
                        </span>
                      </Row>
                    </Col>
                    {platformCode !== 'CATA' && (
                      <Col span={colSpan}>
                        <Row className="list-title">
                          {intl.get(`mallf.orderDetail.view.orderDetail.invoiceInfo`).d('发票信息')}
                        </Row>
                        <Row>
                          <span className="label">
                            {intl
                              .get(`mallf.orderDetail.view.orderDetail.invoiceType`)
                              .d('发票类型')}
                            ：
                          </span>
                          <span className="label-content">{order.invoiceTypeName}</span>
                        </Row>
                        <Row>
                          <span className="label">
                            {intl
                              .get(`mallf.orderDetail.view.orderDetail.invoiceHeader`)
                              .d('发票抬头')}
                            ：
                          </span>
                          <span className="label-content">{order.selectedInvoiceTitleName}</span>
                        </Row>
                        <Row>
                          <span className="label">
                            {intl
                              .get(`mallf.orderDetail.view.orderDetail.invoiceContent`)
                              .d('发票内容')}
                            ：
                          </span>
                          <span className="label-content">{order.invoiceContentName}</span>
                        </Row>
                      </Col>
                    )}
                    <Col span={colSpan}>
                      <Row className="list-title">
                        {intl.get('mallf.myOrder.view.other.information').d('其他信息')}
                      </Row>
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.orderDetail.view.orderDetail.orderTime`).d('下单时间')}：
                        </span>
                        <span className="label-content">{order.creationDate}</span>
                      </Row>
                      {/* <Row>
                        <span className="label">
                          {intl.get('mallf.myMall.model.requestDate').d('需求日期')}：
                        </span>
                        <span className="label-content">{order.neededDate}</span>
                      </Row> */}
                      <Row>
                        <span className="label">
                          {intl.get(`mallf.myOrder.model.remark`).d('备注')}：
                        </span>
                        <Popover overlayStyle={{ width: '400px' }} content={order.remark}>
                          <span className="label-content order-remark">{order.remark}</span>
                        </Popover>
                      </Row>
                      <Row>
                        <Col span={8} className="oprate-btns">
                          <Attachment
                            readOnly
                            showHistory
                            viewMode="popup"
                            funcType="link"
                            labelLayout="float"
                            value={order?.attachmentUuid}
                            bucketName="private-bucket"
                            bucketDirectory="mall-front"
                          />
                        </Col>
                        <Col span={6}>
                          <FillInfo
                            dataSet={this.headerDs}
                            cSupply={this.props.cSupply}
                            unitConfig={unitConfig}
                            dataSource={order}
                            code={headerCode}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
              {this.renderProducts(poLineList)}
              <div className="product-footer">
                <p className="product-footer-num">
                  <span className="footer-num-label">
                    {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
                  </span>
                  <span className="footer-num-price">
                    {currencySymbol || ''}
                    {Hmall.numberRender(order.productTotalAmount, financialPrecision, true)}
                  </span>
                </p>
                <p className="product-footer-num">
                  <span className="footer-num-label">
                    {
                      <Tooltip
                        title={
                          <>
                            <p style={{ marginBottom: 5 }}>
                              {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:
                              {currencySymbol || ''}
                              {Hmall.numberRender(order.freight, financialPrecision, true)}
                            </p>
                            <p r-if={order.installPrice}>
                              {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
                              {currencySymbol || ''}
                              {Hmall.numberRender(order.installPrice, financialPrecision, true)}
                            </p>
                          </>
                        }
                      >
                        <Icon
                          type="help"
                          style={{
                            fontSize: 14,
                            marginRight: 6,
                            marginTop: -4,
                            color: 'rgba(0,0,0,0.50)',
                          }}
                        />
                      </Tooltip>
                    }
                    {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
                  </span>
                  <span className="footer-num-price">
                    {currencySymbol || ''}
                    {Hmall.numberRender(order.freight, financialPrecision, true)}
                  </span>
                </p>
                <p className="product-footer-all-num" style={{ marginTop: 10 }}>
                  <span className="footer-num-label">
                    <strong>
                      {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}
                    </strong>
                    {intl
                      .getHTML(`mallf.myOrder.model.common.totalItems`, {
                        value: count,
                      })
                      .d(
                        <span>
                          共<b>{count}</b>件商品
                        </span>
                      )}
                    :
                  </span>
                  <span className="footer-num-price price-color">
                    {poLineList?.[0]?.poLineList?.[0]?.currencySymbol || ''}
                    {Hmall.numberRender(order.orderAmount, financialPrecision, true)}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
        {commentVisible && <CommentModal {...commentModalProps} />}
        {AssociatedDocV && (
          <AssociatedDoc
            toggleModal={this.toggleModalAssociatedDoc}
            visible={AssociatedDocV}
            product={currentProduct}
            poHeaderId={poHeaderId}
          />
        )}
        {AcceptRecordV && (
          <AcceptRecord
            toggleModal={this.toggleModalAcceptRecord}
            visible={AcceptRecordV}
            product={currentProduct}
          />
        )}
        {acceptVisible && (
          <AcceptModal
            {...{
              acceptVisible,
              asnLineIds,
              setState: this.changeState,
              acceptType: '',
              fetchOrderData: () => this.fetchOrderDetail(poHeaderId),
            }}
          />
        )}
        {invoiceVisible && (
          <InvoiceModal
            poNum={poNum}
            visible={invoiceVisible}
            toggleModal={this.toggleInvoiceModal}
            product={currentProduct}
          />
        )}
        {leaveWordVisible && (
          <LeaveWordModal
            srmPoHeaderId={srmPoHeaderId}
            leaveWordVisible={leaveWordVisible}
            setState={(vis) => this.setState(vis)}
            order={orderData}
          />
        )}
      </div>
    );
  }
}

export default compose(
  c7nCustomize({ unitCode: [headerCode, ECLineCode, CATALineCode] }),
  connect(({ global }) => ({
    showMiniCart: global.showMiniCart,
  })),
  formatterCollections({ code: ['mallf.orderDetail', 'mallf.myOrder'] })
)(OrderDetail);
