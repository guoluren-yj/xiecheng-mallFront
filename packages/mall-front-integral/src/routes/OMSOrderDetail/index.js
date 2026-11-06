import React from 'react';
import qs from 'qs';
import classnames from 'classnames';
import { Steps, Popover, Tooltip, Icon } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { connect } from 'dva';
// import withCustomize from 'srm-front-scuz/lib/OldCustomize';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { isEmpty } from 'lodash';

import { myInvoice, orderAssociatedDoc } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import BreadCrumbs from 'components/BreadCrumbs';
import { CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import request from 'utils/request';
import Link from 'components/Link';
import Loading from 'components/loading';
import * as HmallConfig from 'utils/api-config';
import * as Hmall from 'utils/utils';
import { openOmsAcceptModal } from 'utils/modals';
import Image from 'components/Image';
import { SiglPrice } from 'components/LabelPreview';
import OverflowTip from 'components/OverflowTip';
import { fetchOrderAgain, toPayServise } from 'services/orderCenterService';
import formatterCollections from 'utils/intl/formatterCollections';
import AssociatedDoc from 'mall-front/lib/routes/OMSOrderDetail/AssociatedDoc';
import { TagRender, SpanTitle } from 'mall-front/lib/utils/renderer';
import { RECEIVE_INFORMATION_TABLE_SIGL } from 'utils/customizeCode';
import ShowDoc from 'mall-front/lib/routes/MyMall/OMSOrder/common/ShowDoc';
import styles from './index.less';
import AcceptRecord from './AcceptRecord';
import openComment from '@/routes/MyMall/OMSOrder/common/OmsCommentModal/openComment';
import AcceptModal from '@/routes/MyMall/OMSOrder/common/OmsAcceptModal';
import InvoiceModal from '@/routes/MyMall/OMSOrder/common/InvoiceModal';
import LogisticsModal from '@/routes/MyMall/OMSOrder/common/LogisticsModal';
import image from '@/assets/images/shougongshenqing-product.png';
import LeaveWordModal from '@/routes/MyMall/OMSOrder/common/OmsLeaveWordModal';

import PayNow from './PayNow';
import HeaderInfo from './HeaderInfo';
import CustomInfo from './CustomInfo';
import TotalMount from './TotalMount';
import PurchaseOrderNum from './PurchaseOrderNum';

const headerCode = 'MALL.BEFORE.ORDER.OMS.HEADER.SUPPLY';
const CATALineCode = 'MALL.BEFORE.ORDER.OMS.CATA.LINE.SUPPLIER';
const ECLineCode = 'MALL.BEFORE.ORDER.OMS.EC.LINE.SUPPLY';

const { numberRender } = Hmall;

@formatterCollections({ code: ['mallf.orderDetail', 'mallf.myOrder'] })
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
      logistVisible: false,
      payLoading: false,
      acceptLoading: false,
      leaveWordVisible: false,
      srmOrderId: '',
    };
  }

  componentDidMount() {
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    this.fetchOrderDetail(orderId); // 查询详情
  }

  // 查询订单详情
  fetchOrderDetail = (orderId) => {
    const { organizationId } = Hmall.getUserConfigInfo();
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/orderDetail?orderId=${orderId}&customizeUnitCode=${headerCode},${ECLineCode},${CATALineCode}`;
    this.setState({
      loading: true,
    });
    request(queryUrl)
      .then((res) => {
        if (res) {
          this.setState({
            orderData: res,
            // platformCode: res.cecFromCode,
            isSaleType: res.agreementType === 'SALE',
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
      });
  };

  handlePay = () => {
    const { orderData } = this.state;
    this.setState({ payLoading: true });
    toPayServise({
      returnUrl: `${window.location.origin}/payment-result`,
      paymentOrderDTOList: [
        {
          orderId: orderData.orderId,
          objectVersionNumber: orderData.objectVersionNumber,
        },
      ],
    })
      .then((res) => {
        if (res) {
          Hmall.gotoPayUrl(res);
        }
      })
      .finally(() => {
        this.setState({ payLoading: false });
      });
  };

  // 图片地址处理
  HandleImgUrl(code, url) {
    return code === 'CATA' || code === 'MANUAL' ? url : Hmall.convertImg(url, 1, code);
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

  handleComment = (product) => {
    const { poNum, createDate, paymentModel, purchaseCompanyId } = this.state.orderData;
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    openComment({
      product: { ...product, poNum, createDate, companyId: purchaseCompanyId, paymentModel },
      successCallback: () => this.fetchOrderDetail(orderId),
    });
  };

  /**
   * 接收预览
   * @param {*} params 收货/批量收货查询参数
   * @param {*} type 收货/批量收货(''/'batch')
   */
  // handleAccept = (params = []) => {
  //   this.setState({
  //     asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
  //     acceptVisible: true,
  //   });
  // };

  async handleAccept(params = [], type = '') {
    if (params.length === 0) return;
    await openOmsAcceptModal({
      asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
      acceptType: type,
      customizeTable: this.props.customizeTable,
    });
    // setState({
    //   asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
    //   acceptVisible: true,
    //   acceptType: type,
    // });
  }

  status = (s) => {
    let subStatus;
    // WAITING_APPROVE WAITING_PAY WAITING_SENT WAITING_RECEIVE FINISH
    switch (s) {
      // case 'NEW':
      //   subStatus = 'new';
      //   break;
      case 'CANCELLED':
      case 'MALL_CANCEL':
        subStatus = 'failure';
        break;
      case 'FINISH':
      case 'APPROVED':
      case 'PAY_FINISH_TO_CONFIRM':
        subStatus = 'success';
        break;
      case 'REJECT':
      case 'DELIVERY_FAILED':
      case 'APPOVE_REJECT':
      case 'PRODUCT_REJECT':
      case 'SUPPLIER_CONFIRM_FAILED':
        subStatus = 'danger';
        break;
      default:
        subStatus = 'warning';
        break;
    }
    return subStatus;
  };

  toggleLogistModal = () => {
    this.setState({
      logistVisible: !this.state.logistVisible,
    });
  };

  toggleInvoiceModal = () => {
    this.setState({
      invoiceVisible: !this.state.invoiceVisible,
    });
  };

  /**
   * 商品列表
   */
  renderProducts = (arr, order) => {
    const list = [];
    const codes =
      Array.from(
        new Set(
          arr.map((p) => {
            if (!p.srmOrderCode) list.push(p);
            return p.srmOrderCode;
          })
        )
      )?.filter((p) => !!p) || [];
    codes.forEach((item) => {
      let newItem = [];
      arr
        .filter((p) => p.srmOrderCode === item)
        .forEach((p) => {
          newItem = newItem.concat(p.orderEntryVOS);
        });
      list.push({
        srmOrderCode: item,
        orderEntryVOS: newItem,
      });
    });
    const { payLoading, orderData } = this.state;
    return (
      <div className="product-wrapper">
        <div className="product-detail-info-title">
          <span>{intl.get(`mallf.common.view.productInformation`).d('商品信息')}</span>
          {/* <span
            className="primary-color"
            style={{ float: 'right', marginLeft: 40, cursor: 'pointer' }}
          >
            <Icon type="payment" style={{ fontSize: 14, marginRight: 8 }} />
            {intl.get('mallf.common.view.order.orderAgain').d('再来一单')}
          </span> */}
          <PayNow payLoading={payLoading} orderData={orderData} handlePay={this.handlePay} />
        </div>
        <div className="product-header">
          <div className="product-header-left">
            <span className="product-info">
              {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
            </span>
            <span className="product-num">
              {intl.get('mallf.common.view.productCode').d('商品编码')}
            </span>
            {/* <NeededDateHeader /> */}
            <span
              className="product-price"
              title={intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}
            >
              {intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}
            </span>
            <span className="product-quantity">
              {intl.get(`mallf.orderDetail.view.productNum.order`).d('数量')}
            </span>
            <span
              className="product-total"
              title={intl.get('mallf.common.view.line.amount.price').d('行金额(含税)')}
            >
              {intl.get('mallf.common.view.line.amount.price').d('行金额(含税)')}
            </span>
            <span className="product-status">{intl.get('mallf.common.view.status').d('状态')}</span>
          </div>
          <div className="operate">{intl.get(`mallf.orderDetail.view.operating`).d('操作')}</div>
        </div>
        {list?.map((item) => {
          const subList = {};
          const isEC = order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL';
          if (isEC) {
            item.orderEntryVOS.forEach((x) => {
              if (subList[x.ecConsignmentCode]) {
                subList[x.ecConsignmentCode] = subList[x.ecConsignmentCode].concat(x);
              } else {
                subList[x.ecConsignmentCode] = [x];
              }
            });
          }
          const firstCurrent = item?.orderEntryVOS?.filter((p) => p.freightFlag !== 1)?.[0];
          return (
            <>
              <PurchaseOrderNum
                item={item}
                firstCurrent={firstCurrent}
                setState={(s) => this.setState(s)}
              />
              {isEC
                ? Object.keys(subList).map((ecConsignmentCode) => {
                    return subList[ecConsignmentCode].map((product, index) => {
                      return this.renderSubList({
                        product,
                        index,
                        order,
                        item,
                        subList: subList[ecConsignmentCode],
                      });
                    });
                  })
                : item?.orderEntryVOS
                    ?.filter((p) => p.freightFlag !== 1)
                    .map((product, index) => {
                      return this.renderSubList({ product, index, order, item });
                    })}
            </>
          );
        })}
      </div>
    );
  };

  renderSubList = ({ product, index, order, item, subList }) => {
    const { logistVisible, invoiceVisible, isSaleType, orderData, acceptLoading } = this.state;
    const { hideMenuList, hideFieldList } = Hmall.getUserConfigInfo();
    // const { unitConfig } = this.props;
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    const customProps = {
      product: {
        ...product,
        customFlag: product.skuType === 'CUSTOM' ? 1 : 0,
        productId: product?.skuId,
        customizedProductLineList: [
          {
            customizedProductValueList: product?.customSpecificationList,
          },
        ],
      },
      openMoadlIcon: (
        <Icon
          className="detail-info-update"
          type="find_in_page"
          style={{ fontSize: 12, marginLeft: '4px', color: Hmall.getPrimaryColor() }}
        />
      ),
      disabled: true,
    };
    const showAttributeInfo = () => {
      const attributeStr = product.productAttribute
        .map(({ pValue, pName }) => `${pName}: ${pValue}`)
        .join(`;\xa0\xa0\xa0`);
      return (
        <p
          style={{
            color: '#666666',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: 250,
          }}
          title={attributeStr}
        >
          {attributeStr}
        </p>
      );
    };
    const infos = order.mallOrderStatus ? order.infos : product.infos;
    return (
      <div className="product-list">
        <div className="product-list-left">
          <div className="product-list-line">
            <div className="product-info">
              {product.cecFromCode === 'MANUAL' || !!product.qtHeaderNo ? (
                <a>
                  <Image value={image} width={36} height={36} />
                </a>
              ) : (
                <Link
                  to={`/sigl/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                >
                  <Image
                    value={this.HandleImgUrl(product.cecFromCode, product.primaryUrl)}
                    width={36}
                    height={36}
                  />
                </Link>
              )}
              <div className="product-name">
                {product.cecFromCode === 'MANUAL' || !!product.qtHeaderNo ? (
                  <a title={product.skuName} className="product-name-label">
                    {product.skuName}
                  </a>
                ) : (
                  <Link
                    title={product.skuName}
                    className="product-name-label"
                    to={`/sigl/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                  >
                    {product.skuName}
                  </Link>
                )}
                {product.skuType === 'CUSTOM' && <CustomInfo {...customProps} />}
                {product.productAttribute && showAttributeInfo()}
                <p className="product-remark">
                  <span className="product-remark-label">
                    {intl.get('mallf.common.view.remark.info').d('备注信息')}：
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
            <span className="product-num">
              {product.skuCode}
              <CopyButton
                style={{ top: -2, float: 'none' }}
                num={product.skuCode}
                label={intl.get('mallf.orderDetail.view.productCode').d('商品编码')}
              />
            </span>
            {/* <NeededDateContent product={product} /> */}
            <span className="product-price">
              <span className="product-info-price-sigl">
                {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(orderData?.paymentModel) && (
                  <>
                    <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                    <SpanTitle>{numberRender(product?.pointPrice)}</SpanTitle>
                    {['HYBRID_PAYMENT'].includes(orderData?.paymentModel) && (
                      <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>+</span>
                    )}
                  </>
                )}
              </span>
              {['CASH_PAYMENT', 'HYBRID_PAYMENT'].includes(orderData?.paymentModel) && (
                <SpanTitle>
                  {`${orderData?.currencySymbol || ''}${
                    product?.orderPriceFinalVO?.finalUnitPriceMeaning ||
                    product?.orderPriceFinalVO?.finalUnitPrice
                  }${product.per > 1 ? `/${product.per}` : ''}`}
                </SpanTitle>
              )}
              <p>
                {orderData.agreementBusinessType === 'POINTS' && (
                  <SiglPrice
                    style={{
                      maxWidth: 85,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
                    }}
                    pointPrice={product.pointPrice}
                  />
                )}
              </p>
              {product.pointsTypeName && (
                <div style={{ color: '#999999' }}>{product.pointsTypeName}</div>
              )}
            </span>
            <span className="product-quantity">
              {product.quantityMeaning}
              {product.customQuantity && product.customQuantity !== 1 && (
                <p style={{ marginTop: 6 }}>
                  {product.packageQuantityMeaning}
                  {intl.get(`mallf.cart.model.cart.pieces`).d('件')}
                </p>
              )}
            </span>
            <span className="product-total price-color">
              {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(orderData?.paymentModel) && (
                <span className="product-info-price-sigl">
                  <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                  <SpanTitle>{numberRender(product?.totalPointEntryPrice)}</SpanTitle>
                  {['HYBRID_PAYMENT'].includes(orderData?.paymentModel) && (
                    <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>+</span>
                  )}
                </span>
              )}
              {['CASH_PAYMENT', 'HYBRID_PAYMENT'].includes(orderData?.paymentModel) && (
                <SpanTitle>
                  {`${orderData?.currencySymbol || ''}${
                    product?.orderPriceFinalVO?.finalEntryAmountMeaning ||
                    product?.orderPriceFinalVO?.finalEntryAmount
                  }
                    `}
                </SpanTitle>
              )}
            </span>
            <span className="product-status">
              <p>
                {TagRender({
                  text:
                    this.state.orderData.mallOrderStatusMeaning ||
                    product.mallOrderEntryStatusMeaning,
                  type: this.status(
                    this.state.orderData.mallOrderStatus || product.mallOrderEntryStatus
                  ),
                  icon: (
                    <>
                      {!isEmpty(infos) && (
                        <Tooltip
                          title={infos
                            .filter((n) => n.color === infos?.[0]?.color)
                            .map((m) => (
                              <p>{`${m.infoType ? `${m.infoType}    :` : ``} ${m.info}`}</p>
                            ))}
                          placement="top"
                        >
                          <Icon
                            style={{
                              fontSize: '14px',
                              marginLeft: '5px',
                              fontWeight: 400,
                              verticalAlign: 'text-bottom',
                            }}
                            type={infos?.[0]?.color === 'grey' ? 'help' : 'error'}
                            size={14}
                          />
                        </Tooltip>
                      )}
                    </>
                  ),
                })}
              </p>
            </span>
          </div>
        </div>
        <div className="product-list-right">
          <div>
            {['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
              hideFieldList &&
              !hideFieldList.includes('LOGISTICS') && (
                <div
                  className="right-btn"
                  onClick={() => {
                    this.setState({
                      currentProduct: product,
                      logistVisible: !logistVisible,
                    });
                  }}
                >
                  <OverflowTip>
                    {intl.get(`mallf.orderDetail.view.check.logistics`).d('查看物流')}
                  </OverflowTip>
                </div>
              )}
            {product.invoiceFlag === 1 && !isSaleType && (
              <PermissionWrapper permissionList={myInvoice}>
                <div
                  className="right-btn"
                  onClick={() => {
                    this.setState({
                      currentProduct: product,
                      invoiceVisible: !invoiceVisible,
                    });
                  }}
                >
                  {intl.get('mallf.common.view.check.invoince').d('查看发票')}
                </div>
              </PermissionWrapper>
            )}
            {/* <CheckBudgetInfo budgetData={product} /> */}
            <ShowDoc>
              <PermissionWrapper permissionList={[orderAssociatedDoc]}>
                <div className="right-btn" onClick={() => this.toggleModalAssociatedDoc(product)}>
                  {intl.get('mallf.common.view.associated.doc').d('关联单据')}
                </div>
              </PermissionWrapper>
            </ShowDoc>
            {['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) && (
              <div className="right-btn" onClick={() => this.toggleModalAcceptRecord(product)}>
                {intl.get('mallf.common.view.receiving.records').d('接收记录')}
              </div>
            )}
          </div>
          <div>
            <>
              <span r-if={hideMenuList && !hideMenuList.includes('MY_EVALUATION')}>
                {product.assessmentFlag === 1 && order.orderTypeCode !== 'MANUAL' && (
                  <div className="right-btn" onClick={() => this.handleComment(product)}>
                    <OverflowTip>
                      {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                    </OverflowTip>
                  </div>
                )}
                {product.assessmentFlag === 2 && order.orderTypeCode !== 'MANUAL' && (
                  <div className="right-btn" onClick={() => this.handleComment(product)}>
                    <OverflowTip>
                      {intl.get('mallf.common.view.goto.addComment').d('追加评论')}
                    </OverflowTip>
                  </div>
                )}
                {product.assessmentFlag === 3 && order.orderTypeCode !== 'MANUAL' && (
                  <div className="right-btn" onClick={() => this.handleComment(product)}>
                    <OverflowTip>
                      {intl.get('mallf.common.view.goto.commentView').d('查看评论')}
                    </OverflowTip>
                  </div>
                )}
              </span>
              {!(order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL' && index > 0) &&
                product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
                hideFieldList &&
                !hideFieldList.includes('ACCEPTANCE') && (
                  <Tooltip
                    title={
                      product.receiptFlag === 0
                        ? intl.get('mallf.common.view.nosurport.accept').d('此商品不支持在商城接收')
                        : null
                    }
                    placement="bottom"
                  >
                    <Spin spinning={acceptLoading} size="small">
                      <div
                        className={classnames([
                          'right-btn',
                          { disabled: product.receiptFlag === 0 },
                        ])}
                        onClick={async () => {
                          if (product.receiptFlag === 1) {
                            this.setState({ acceptLoading: true });
                            if (
                              order.orderTypeCode !== 'CATA' &&
                              order.orderTypeCode !== 'MANUAL' &&
                              index === 0
                            ) {
                              await this.handleAccept(subList);
                            } else {
                              await this.handleAccept([product]);
                            }
                            this.setState({ acceptLoading: false });
                          }
                        }}
                      >
                        {intl.get('mallf.common.view.catalog.accept').d('接收')}
                      </div>
                    </Spin>
                  </Tooltip>
                )}
              {!!product.afterSaleFlag && order.orderTypeCode !== 'MANUAL' && (
                <div className="right-btn">
                  <Link
                    to={`/sigl/oms-sale-detail?orderId=${orderId}&consignmentCode=${
                      product.consignmentCode
                    }&skuCode=${product.skuCode}&ecpoNum=${
                      order.cecOrderCode || orderData.orderCode
                    }&consignmentLineNum=${
                      item.consignmentLineNum || product.consignmentLineNum
                    }&orderEntryId=${product.orderEntryId}`}
                  >
                    <OverflowTip>
                      {intl.get('mallf.common.view.afterSales.application').d('售后申请')}
                    </OverflowTip>
                  </Link>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    );
  };

  // 总积分金额计算
  getOrderTotalMount = () => {
    const { orderData } = this.state;
    const obj = {
      totalSigl: orderData.orderPriceFinalVO?.skuTotalPoint,
      totalMoney: orderData.extraCostNotIncloudOrderAmount,
      totalSiglFeight: orderData.orderPriceFinalVO?.orderExtraPriceVO?.freightTotalPoint,
      totalFeight:
        orderData.orderPriceFinalVO.orderExtraPriceVO?.freightAmountMeaning ||
        orderData.orderPriceFinalVO.orderExtraPriceVO?.freightAmount,
      totalInstall:
        orderData.orderPriceFinalVO.orderExtraPriceVO?.installCostAmountMeaning ||
        orderData.orderPriceFinalVO.orderExtraPriceVO?.installCostAmount,
      totalSiglInstall: orderData.orderPriceFinalVO.orderExtraPriceVO?.installTotalPoint,
      totalEx:
        orderData.orderPriceFinalVO?.extraCostAmountMeaning ||
        orderData.orderPriceFinalVO?.extraCostAmount,
      totalSiglEx: orderData.orderPriceFinalVO.extraCostTotalPoint,
    };
    if (orderData.paymentModel === 'HYBRID_PAYMENT') {
      if (orderData?.freightPointDeductionFlag === 1) {
        // 积分抵扣附加费
        obj.totalFeight = 0;
        obj.totalInstall = 0;
        obj.totalEx = 0;
      } else {
        obj.totalSiglFeight = 0;
        obj.totalSiglInstall = 0;
        obj.totalSiglEx = 0;
      }
    } else if (orderData.paymentModel === 'POINTS_PAYMENT') {
      obj.totalFeight = 0;
      obj.totalInstall = 0;
      obj.totalEx = 0;
    }
    return obj;
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
      logistVisible,
      leaveWordVisible,
      isSaleType,
      srmOrderId,
    } = this.state;
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    const {
      orderCode,
      orderStatusInfo = [],
      poOrderEntryVO: poLineList,
      totalNum,
      totalNumMeaning,
      ...order
    } = orderData;
    const { unitConfig, cSupply } = this.props;
    const currentStep = orderStatusInfo.map((step) => step.flag).indexOf(1);
    return (
      <div className={styles['order-detail-container']}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <BreadCrumbs
              value={{
                pageTitle: intl.get('mallf.common.view.orderCenter').d('订单中心'),
                childTitle1: orderCode,
              }}
            />
            <div className="order-detail-list container">
              {orderStatusInfo?.length > 0 && (
                <Steps className="order-detail-steps" current={currentStep === 3 ? 4 : currentStep}>
                  {orderStatusInfo.map((step) => (
                    <Steps.Step title={step.text} />
                  ))}
                </Steps>
              )}
              <HeaderInfo
                order={order}
                isSaleType={isSaleType}
                unitConfig={unitConfig}
                headerCode={headerCode}
                cSupply={cSupply}
                getOrderTotalMount={this.getOrderTotalMount}
              />
              {poLineList && this.renderProducts(poLineList, order)}
              <TotalMount
                getOrderTotalMount={this.getOrderTotalMount}
                order={order}
                orderData={orderData}
                totalNumMeaning={totalNumMeaning}
              />
            </div>
          </>
        )}
        {AssociatedDocV && (
          <AssociatedDoc
            cecFromCode={currentProduct.cecFromCode}
            toggleModal={this.toggleModalAssociatedDoc}
            visible={AssociatedDocV}
            product={currentProduct}
            cecOrderCode={orderData.cecOrderCode}
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
              fetchOrderData: () => this.fetchOrderDetail(orderId),
            }}
          />
        )}
        {invoiceVisible && (
          <InvoiceModal
            isOMS
            visible={invoiceVisible}
            toggleModal={this.toggleInvoiceModal}
            product={currentProduct}
          />
        )}
        {logistVisible && (
          <LogisticsModal
            toggleModal={this.toggleLogistModal}
            visible={logistVisible}
            product={currentProduct}
            cecOrderCode={orderData.cecOrderCode}
          />
        )}
        {leaveWordVisible && (
          <LeaveWordModal
            srmOrderId={srmOrderId}
            leaveWordVisible={leaveWordVisible}
            setState={(vis) => this.setState(vis)}
            order={orderData}
          />
        )}
      </div>
    );
  }
}

export default c7nCustomize({
  unitCode: [headerCode, ECLineCode, CATALineCode, RECEIVE_INFORMATION_TABLE_SIGL],
})(
  connect(({ global }) => ({
    showMiniCart: global.showMiniCart,
    pointName: global.pointName,
  }))(OrderDetail)
);
