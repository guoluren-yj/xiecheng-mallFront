/* eslint-disable import/no-cycle */
import React from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import { Steps, Popover, Tooltip, Icon } from 'choerodon-ui';
import { DataSet, Button, Message, Spin } from 'choerodon-ui/pro';
import swalAlert from 'components/swal';
import { connect } from 'dva';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import OverflowTip from 'components/OverflowTip';

import Icons from 'components/Icons';
import ViewCompareList from 'components/ViewCompareList';
import {
  myInvoice,
  afterSaleApplication,
  myComments,
  orderAssociatedDoc,
  orderAcceptRecord,
} from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import { TagRender, CopyButton, SpanTitle } from 'utils/renderer';
import BreadCrumbs from 'components/BreadCrumbs';
import { openOmsAcceptModal } from 'utils/modals';
import intl from 'utils/intl';
import request from 'utils/request';
import Link from 'components/Link';
import Loading from 'components/loading';
import * as HmallConfig from 'utils/api-config';
import * as Hmall from 'utils/utils';
import Image from 'components/Image';
import {
  fetchOrderAgain,
  toPayServise,
  getEcServiceLink,
  getCardPasswordService,
} from 'services/orderCenterService';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import {
  RECEIVE_INFORMATION_TABLE,
  RECEIVE_HEADER_CODE,
  RECEIVE_LINE_CODE,
  HEADER_PAYINFO,
  DOC_INFO,
  CONSIGNEE_INFO,
  RECEIVE_RECORD_INFO_TABLE,
} from 'utils/customizeCode';
import CustomInfo from './CustomInfo';
import styles from './index.less';
import AssociatedDoc from './AssociatedDoc';
import openComment from '@/routes/MyMall/OMSOrder/common/OmsCommentModal/openComment';
import InvoiceModal from '@/routes/MyMall/OMSOrder/common/InvoiceModal';
import LogisticsModal from '@/routes/MyMall/OMSOrder/common/LogisticsModal';
import LeaveWordModal from '@/routes/MyMall/OMSOrder/common/OmsLeaveWordModal';

import FillInfo from './LineFillInfo';
import CheckBudgetInfo from './CheckBudgetInfo';
import HeaderInfo from './HeaderInfo';
import { openAcceptRecord } from './AcceptRecord';
import AcceptModal from '@/routes/MyMall/OMSOrder/common/OmsAcceptModal';
import PayNow from './PayNow';
import NeededDateContent from './NeededDate/Content';
import NeededDateHeader from './NeededDate/Header';
import TotalMount from './TotalMount';
import CuxFn from '@/cuxTools/cuxFn';
import PurchaseOrderNum from './PurchaseOrderNum';
import ShowDoc from '../MyMall/OMSOrder/common/ShowDoc';

const headerCode = 'MALL.BEFORE.ORDER.OMS.HEADER.SUPPLY';
const CATALineCode = 'MALL.BEFORE.ORDER.OMS.CATA.LINE.SUPPLIER';
const ECLineCode = 'MALL.BEFORE.ORDER.OMS.EC.LINE.SUPPLY';

const FillHeaderCode = 'MALL.OMS.ORDER.DETAIL.HEADERINFO';
const FillCATALineCode = 'MALL.OMS.ORDER.DETAIL.CATA.LINEINFO';
const FillECLineCode = 'MALL.OMS.ORDER.DETAIL.EC.LINEINFO';

@formatterCollections({
  code: [
    'mallf.orderDetail',
    'mallf.myOrder',
    'hwfp.task',
    'hwfp.common',
    'component.operationRecord',
    'smodr.acceptOrder',
    'smodr.orderLine',
    'smodr.deliveryOrder',
    'smodr.orderDetail',
  ],
})
class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      orderData: {},
      AssociatedDocV: false,
      currentProduct: {},
      invoiceVisible: false,
      logistVisible: false,
      payLoading: false,
      cardPasswordLoading: false,
      acceptLoading: false,
      colSpan: 8,
      leaveWordVisible: false,
      srmOrderId: '',
    };
  }

  headerDs = new DataSet();

  tableDs = new DataSet();

  componentDidMount() {
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    this.fetchOrderDetail(orderId); // 查询详情
  }

  custInit = () => {
    const { separateInitCustUnit } = this.props;
    const { platformCode, isReceive } = this.state;
    if (this.props.custLoading || isEmpty(this.props.custConfig)) return;
    separateInitCustUnit({
      code: isReceive ? RECEIVE_HEADER_CODE : headerCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: this.headerDs,
      },
    });
    separateInitCustUnit({
      code: FillHeaderCode,
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
    separateInitCustUnit({
      code:
        platformCode !== 'CATA' && platformCode !== 'MANUAL' ? FillECLineCode : FillCATALineCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: this.tableDs,
      },
    });
    separateInitCustUnit({
      code: RECEIVE_LINE_CODE,
      type: 'cSupply',
      extraConfig: {
        dataSet: this.headerDs,
      },
    });
  };

  // 查询订单详情
  fetchOrderDetail = (orderId) => {
    const { organizationId } = Hmall.getUserConfigInfo();
    const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/orders/orderDetail?orderId=${orderId}&customizeUnitCode=${headerCode},${ECLineCode},${CATALineCode}`;
    this.setState({
      loading: true,
    });
    request(queryUrl)
      .then((res) => {
        const { isNewCart } = Hmall.getUserConfigInfo();
        let colSpan = 8;
        if (res.agreementBusinessType === 'RECEIVE') {
          colSpan = 8;
        } else if (isNewCart) {
          colSpan = 6;
        } else if (
          (res.cecFromCode !== 'CATA' && res.cecFromCode !== 'MANUAL') ||
          res.agreementType === 'SALE'
        ) {
          colSpan = 6;
        }
        if (res) {
          this.setState({
            orderData: res,
            platformCode: res.cecFromCode,
            colSpan,
            isSaleType: res.agreementType === 'SALE',
            isReceive: res.agreementBusinessType === 'RECEIVE',
            isJDECard: res.cecFromCode === 'JD-V-ECRD', // 来自电商“京东VOP-电子E卡”
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

  handlePay = () => {
    const { orderData } = this.state;
    this.setState({ payLoading: true });
    toPayServise({
      returnUrl: `${window.location.origin}/my-mall/my-order`,
      paymentOrderDTOList: [
        {
          orderId: orderData.orderId,
          objectVersionNumber: orderData.objectVersionNumber,
        },
      ],
    })
      .then((res) => {
        Hmall.gotoPayUrl(res);
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
      currentProduct: { ...product, isReceive: this.state.isReceive },
    });
  };

  toggleModalAcceptRecord = (product) => {
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    openAcceptRecord({
      product,
      fetchOrderData: () => this.fetchOrderDetail(orderId),
      customizeTable: this.props.customizeTable,
    });
  };

  handleComment = (product) => {
    const { poNum, createDate, purchaseCompanyId } = this.state.orderData;
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    openComment({
      product: { ...product, poNum, createDate, companyId: purchaseCompanyId },
      successCallback: () => this.fetchOrderDetail(orderId),
    });
  };

  /**
   * 接收预览
   * @param {*} params 收货/批量收货查询参数
   * @param {*} type 收货/批量收货(''/'batch')
   */
  handleAccept = async (params = []) => {
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    const openAccept = CuxFn({
      name: 'OMSOrderDetail-fn-openAccept',
      value: {
        openOldAccept: () => {
          this.setState({
            asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
            acceptVisible: true,
          });
        },
      },
    })(async () => {
      await openOmsAcceptModal({
        asnLineIds: params.map((p) => ({ consignmentEntryId: p.consignmentEntryId })),
        fetchOrderData: () => this.fetchOrderDetail(orderId),
        customizeTable: this.props.customizeTable,
      });
    });
    await openAccept();
  };

  status = (s) => {
    let subStatus;
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
      case 'RECEIVE_REJECT':
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
    const { payLoading, orderData, isReceive } = this.state;
    return (
      <div className="product-wrapper">
        <div className="product-detail-info-title">
          <span>{intl.get(`mallf.orderDetail.view.productInformation`).d('商品信息')}</span>
          {/* <span
            className="primary-color"
            style={{ float: 'right', marginLeft: 40, cursor: 'pointer' }}
          >
            <Icon type="payment" style={{ fontSize: 14, marginRight: 8 }} />
            {intl.get('mallf.common.view.order.orderAgain').d('再来一单')}
          </span> */}
          <PayNow handlePay={this.handlePay} payLoading={payLoading} orderData={orderData} />
        </div>
        <div className="product-header">
          <div className="product-header-left">
            <span className="product-info">
              {intl.get(`mallf.orderDetail.view.productInformation`).d('商品信息')}
            </span>
            <span className="product-num">
              {intl.get('mallf.orderDetail.view.productCode').d('商品编码')}
            </span>
            <NeededDateHeader />
            <OverflowTip className="product-price text-overflow">
              {intl.get(`mallf.common.model.unitPrice`).d('单价(含税)')}
            </OverflowTip>
            <span className="product-quantity">
              {intl.get(`mallf.orderDetail.view.productNum.order`).d('数量')}
            </span>
            <OverflowTip className="product-total text-overflow">
              {intl.get('mallf.common.view.line.amount.price').d('行金额(含税)')}
            </OverflowTip>
            <span className="product-status">
              {intl.get('mallf.orderDetail.view.status').d('状态')}
            </span>
          </div>
          <div className="operate">
            {intl.get(`mallf.orderDetail.view.operating`).d('操作')}
            {/* <Tooltip
              title={intl.get('mallf.myMall.view.order.orderAgain').d('再来一单')}
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
                onClick={() => this.onAgainOrder([{ orderId }])}
              />
            </Tooltip> */}
          </div>
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
                isReceive={isReceive}
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
    const {
      logistVisible,
      invoiceVisible,
      isSaleType,
      platformCode,
      orderData,
      isReceive,
      isJDECard,
      cardPasswordLoading,
      acceptLoading,
    } = this.state;
    const { hideFieldList } = Hmall.getUserConfigInfo();
    const { custConfig: unitConfig } = this.props;
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
          style={{ fontSize: 14, marginLeft: '4px', color: Hmall.getPrimaryColor() }}
        />
      ),
      disabled: true,
    };
    // 是否可点击跳转
    const disabledLinkFlag = CuxFn({
      name: 'OMSOrderDetail-fn-disabledLinkFlag',
      value: { product, item },
    })(
      () =>
        !!product.qtLineNo ||
        product.cecFromCode === 'MANUAL' ||
        ['ATTACHMENT', 'GIFT'].includes(product.skuType)
    )();

    // 是否展示接收按钮（二开可控制目录化订单只展示一个接收）
    const showAcceptBtn = CuxFn({
      name: 'OMSOrderDetail-fn-showAcceptBtn',
      value: { order, product, index, item },
    })(() => !(order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL' && index > 0))();

    const cuxAcceptShowFlag = CuxFn({
      name: 'OMSOrderDetail-fn-cuxAcceptShowFlag',
      value: {
        showAcceptBtn,
        hideFieldList,
        product,
        order,
        item,
      },
    })(
      () =>
        showAcceptBtn &&
        product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
        hideFieldList &&
        !hideFieldList.includes('ACCEPTANCE')
    )();

    const handleBeforeAccept = async () => {
      // 点击接收判断
      CuxFn({
        name: 'OMSOrderDetail-fn-handleBtnOnAccept',
        value: { product, index, order, subList, item, onAccept: this.handleAccept },
      })(async () => {
        if (product.receiptFlag === 1) {
          try {
            this.setState({ acceptLoading: true });
            if (order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL' && index === 0) {
              await this.handleAccept(subList);
            } else {
              await this.handleAccept([product]);
            }
          } finally {
            this.setState({ acceptLoading: false });
          }
        }
      })();
    };

    const handleOnSaleReq = () => {
      const url = `/oms-sale-detail?orderId=${orderId}&consignmentCode=${
        product.consignmentCode
      }&skuCode=${product.skuCode}&ecpoNum=${
        order.cecOrderCode || orderData.orderCode
      }&consignmentLineNum=${item.consignmentLineNum || product.consignmentLineNum}&orderEntryId=${
        product.orderEntryId
      }`;
      CuxFn({
        name: 'OMSOrder-fn-handleBtnOnSaleReq',
        value: { item, product, url },
      })(() => {
        Hmall.openPage(url);
      })();
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

    const getCardPassword = () => {
      this.setState({ cardPasswordLoading: true });
      const params = {
        consignmentEntryId: product.consignmentEntryId,
      };
      getCardPasswordService(params)
        .then((res) => {
          const { success, result } = res;
          if (res && success) {
            Message.success(result);
          } else if (res && !success) {
            swalAlert(result);
          }
        })
        .finally(() => {
          this.setState({ cardPasswordLoading: false });
        });
    };

    // 是否展示双单位
    const doubleUomFlag =
      product.customUomFlag === 1 ||
      (orderData.dualFlag === 1 &&
        product.cecFromCode === 'MANUAL' &&
        product.customUomCode !== product.uomCode);
    // 行上过滤掉分配映射oms头维度字段
    const headerCustomizedList = (product?.dimValueDTO?.headerCustomizedList || []).filter(
      (n) => n.mappingHeadFlag !== 1
    );
    const infos = order.mallOrderStatus ? order.infos : product.infos;
    return (
      <div className="product-list">
        <div className="product-list-left">
          <div className="product-list-line">
            <div className="product-info">
              {disabledLinkFlag ? (
                <>
                  <div r-if={product.cecFromCode === 'MANUAL'}>
                    {getMamanualRequestImg({ width: '36px', height: '36px' })}
                  </div>
                  <a r-if={product.cecFromCode !== 'MANUAL'}>
                    <Image
                      value={this.HandleImgUrl(product.cecFromCode, product.primaryUrl)}
                      width={36}
                      height={36}
                    />
                  </a>
                </>
              ) : (
                <Link
                  to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                >
                  <Image
                    value={this.HandleImgUrl(product.cecFromCode, product.primaryUrl)}
                    width={36}
                    height={36}
                  />
                </Link>
              )}
              <div className="product-name">
                {disabledLinkFlag ? (
                  <a title={product.skuName} className="product-name-label">
                    {product.skuName}
                  </a>
                ) : (
                  <Link
                    title={product.skuName}
                    className="product-name-label"
                    to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                  >
                    {product.skuName}
                  </Link>
                )}
                <div r-if={!['ATTACHMENT', 'GIFT'].includes(product?.skuType)}>
                  {product.skuType === 'CUSTOM' && <CustomInfo {...customProps} />}
                  {product.productAttribute && showAttributeInfo()}
                </div>
                <p className="product-remark">
                  <span className="product-remark-label">
                    {intl.get('mallf.orderDetail.view.remark.info').d('备注信息')}：
                  </span>
                  <Popover content={product.remark}>
                    <span>
                      {product.remark?.length > 15
                        ? `${product.remark.substring(0, 15)}...`
                        : product.remark}
                    </span>
                  </Popover>
                </p>
                <Tooltip
                  r-if={product?.skuType === 'GIFT'}
                  title={intl.get('mallf.common.view.common.giveaway').d('赠品')}
                >
                  <div className="gift-label">
                    {intl.get('mallf.common.view.common.giveaway').d('赠品')}
                  </div>
                </Tooltip>
                <Tooltip
                  r-if={product?.skuType === 'ATTACHMENT'}
                  title={intl.get(`mallf.common.view.common.annex`).d('附件')}
                >
                  <div className="gift-label">
                    {intl.get(`mallf.common.view.common.annex`).d('附件')}
                  </div>
                </Tooltip>
              </div>
            </div>
            <span className="product-num">
              {product.skuCode}
              <CopyButton
                r-if={platformCode !== 'MANUAL'}
                style={{ top: -2, float: 'none' }}
                num={product.skuCode}
                label={intl.get('mallf.orderDetail.view.productCode').d('商品编码')}
              />
            </span>
            <NeededDateContent product={product} />
            <span className="product-price">
              <span
                title={
                  product?.orderPriceFinalVO?.unitPriceMeaning ||
                  product?.orderPriceFinalVO?.unitPrice
                }
              >
                {orderData?.currencySymbol || ''}
                {product?.orderPriceFinalVO?.unitPriceMeaning ||
                  product?.orderPriceFinalVO?.unitPrice}
                {product.per > 1 ? `/${product.per}` : ''}
                {doubleUomFlag && `/${product?.uomName}`}
              </span>
              <ViewCompareList
                r-if={
                  product?.productCompareDTO &&
                  !['GIFT', 'ATTACHMENT', 'FREIGHT'].includes(product.skuType)
                }
                productCompare={product?.productCompareDTO}
              />
            </span>
            <span className="product-quantity text-overflow">
              <SpanTitle>
                {product.packageQuantityMeaning}
                {doubleUomFlag ? product.customUomName : ''}
              </SpanTitle>
              {doubleUomFlag && (
                <p style={{ marginTop: 6 }}>
                  {product.quantityMeaning}
                  {product?.uomName}
                </p>
              )}
            </span>
            <span
              className="product-total price-color"
              title={
                product?.orderPriceFinalVO?.entryAmountMeaning ||
                product?.orderPriceFinalVO?.entryAmount
              }
            >
              {orderData?.currencySymbol || ''}
              {product?.orderPriceFinalVO?.entryAmountMeaning ||
                product?.orderPriceFinalVO?.entryAmount}
              {/* <p>{product.currencyName}</p> */}
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
            <div
              r-if={
                ['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                hideFieldList &&
                !hideFieldList.includes('LOGISTICS') &&
                !isReceive &&
                !isJDECard
              }
              className="right-btn"
              onClick={() => {
                this.setState({
                  currentProduct: product,
                  logistVisible: !logistVisible,
                });
              }}
            >
              <OverflowTip>
                {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
              </OverflowTip>
            </div>
            {product.invoiceFlag === 1 &&
              !['ATTACHMENT', 'GIFT'].includes(product.skuType) &&
              !isSaleType && (
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
                    <OverflowTip>
                      {intl.get('mallf.orderDetail.view.check.invoince').d('查看发票')}
                    </OverflowTip>
                  </div>
                </PermissionWrapper>
              )}
            <CheckBudgetInfo
              r-if={!['ATTACHMENT', 'GIFT'].includes(product.skuType)}
              budgetData={product}
            />
            {hideFieldList &&
            !hideFieldList.includes('ASSOCIATED_RECEIPT') &&
            !['ATTACHMENT', 'GIFT'].includes(product.skuType) ? (
              <ShowDoc>
                <PermissionWrapper permissionList={[orderAssociatedDoc]}>
                  <div
                    className="right-btn"
                    title={intl.get('mallf.orderDetail.view.associated.doc').d('关联单据')}
                    onClick={() => this.toggleModalAssociatedDoc(product)}
                  >
                    {intl.get('mallf.orderDetail.view.associated.doc').d('关联单据')}
                  </div>
                </PermissionWrapper>
              </ShowDoc>
            ) : null}
            {['FINISH', 'RECEIVE_REJECT', 'RECEIVE_APPROVING', 'WAITING_RECEIVE'].includes(
              product.mallOrderEntryStatus
            ) && (
              <PermissionWrapper permissionList={[orderAcceptRecord]}>
                <div
                  className="right-btn"
                  title={intl.get('mallf.orderDetail.view.receiving.records').d('接收记录')}
                  onClick={() => this.toggleModalAcceptRecord(product)}
                >
                  {intl.get('mallf.orderDetail.view.receiving.records').d('接收记录')}
                </div>
              </PermissionWrapper>
            )}
            <FillInfo
              r-if={!['ATTACHMENT', 'GIFT'].includes(product.skuType)}
              dataSet={this.tableDs}
              cSupply={this.props.cSupply}
              unitConfig={unitConfig}
              dataSource={product}
              isReceive={isReceive}
              code={
                isReceive
                  ? RECEIVE_LINE_CODE
                  : platformCode === 'CATA' || platformCode === 'MANUAL'
                  ? CATALineCode
                  : ECLineCode
              }
              fillCode={
                platformCode === 'CATA' || platformCode === 'MANUAL'
                  ? FillCATALineCode
                  : FillECLineCode
              }
              className="right-btn"
              headerCustomizedList={headerCustomizedList}
              lineCustomizedList={product?.dimValueDTO?.lineCustomizedList || []}
            />
          </div>
          <div>
            <>
              <PermissionWrapper permissionList={[myComments]}>
                <span>
                  <div
                    r-if={
                      product.assessmentFlag === 1 && order.orderTypeCode !== 'MANUAL' && !isReceive
                    }
                    className="right-btn"
                    onClick={() => this.handleComment(product)}
                  >
                    <OverflowTip>
                      {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                    </OverflowTip>
                  </div>
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
              </PermissionWrapper>
              {cuxAcceptShowFlag && (
                <Tooltip
                  title={
                    product.receiptFlag === 0
                      ? intl
                          .get('mallf.orderDetail.view.nosurport.accept')
                          .d('此商品不支持在商城接收')
                      : null
                  }
                  placement="bottom"
                >
                  <Spin spinning={acceptLoading} size="small">
                    <div
                      className={classnames(['right-btn', { disabled: product.receiptFlag === 0 }])}
                      onClick={() => {
                        handleBeforeAccept();
                      }}
                      title={intl.get('mallf.orderDetail.view.catalog.accept').d('接收')}
                    >
                      {intl.get('mallf.orderDetail.view.catalog.accept').d('接收')}
                    </div>
                  </Spin>
                </Tooltip>
              )}
              {
                <PermissionWrapper permissionList={[afterSaleApplication]}>
                  <span>
                    <div
                      className="right-btn"
                      r-if={
                        !!product.afterSaleFlag && !['ATTACHMENT', 'GIFT'].includes(product.skuType)
                      }
                      onClick={() => {
                        handleOnSaleReq();
                      }}
                    >
                      <OverflowTip>
                        {intl.get('mallf.orderDetail.view.afterSales.application').d('售后申请')}
                      </OverflowTip>
                    </div>
                  </span>
                </PermissionWrapper>
              }
              <Spin spinning={cardPasswordLoading} size="small">
                <div
                  className="right-btn"
                  r-if={
                    ['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                    isJDECard
                  }
                  r-title
                  style={{ width: '100%' }}
                  onClick={() => {
                    getCardPassword();
                  }}
                >
                  {cardPasswordLoading
                    ? ''
                    : intl.get(`mallf.myOrder.view.message.getCardPassword`).d('获取卡密')}
                </div>
              </Spin>
            </>
          </div>
        </div>
      </div>
    );
  };

  changeState = (data) => {
    this.setState(data);
  };

  render() {
    const {
      orderData = {},
      loading,
      AssociatedDocV,
      currentProduct,
      acceptVisible,
      asnLineIds,
      invoiceVisible,
      logistVisible,
      leaveWordVisible,
      isSaleType,
      colSpan,
      srmOrderId,
      isReceive,
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
    const { custConfig: unitConfig, cSupply } = this.props;
    const currentStep = orderStatusInfo.map((step) => step.flag).indexOf(1);
    const EcServiceButton = () => {
      return (
        <Button
          funcType="flat"
          color="primary"
          style={{ marginLeft: 10 }}
          // loading={this.state.buttonLoading}
          onClick={async () => {
            const params = {
              platformType: 'PC',
              purchaseCompanyId: order?.purchaseCompanyId,
              orderSourceFrom: order?.cecFromCode,
              cecOrderCode: order?.cecOrderCode,
            };
            const res = await getEcServiceLink(params);
            if (res) {
              window.open(res.url);
              // window.location.href = res.url;
            }
          }}
        >
          <Icons
            type="support_agent_black_24dp"
            style={{ marginRight: '5px', fontWeight: '400' }}
          />
          {intl.get('mallf.orderDetail.view.contact.ec').d('联系电商')}
        </Button>
      );
    };
    return (
      <div className={styles['order-detail-container']}>
        {loading || this.props.custLoading ? (
          <Loading />
        ) : (
          <>
            <BreadCrumbs
              value={{
                pageTitle: intl.get('mallf.orderDetail.view.orderCenter').d('订单中心'),
                childTitle1: orderCode,
                componentsRender: order?.onlineConsultationFlag ? EcServiceButton : '',
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
                isReceive={isReceive}
                dataSet={this.headerDs}
                colSpan={colSpan}
                order={{ ...order, poOrderEntryVO: poLineList }}
                isSaleType={isSaleType}
                unitConfig={unitConfig}
                headerCode={isReceive ? RECEIVE_HEADER_CODE : headerCode}
                cSupply={cSupply}
                FillHeaderCode={FillHeaderCode}
                orderCode={orderCode}
                customizeDisplay={this.props.customizeDisplay}
              />
              {poLineList && this.renderProducts(poLineList, order)}
              <div className="product-footer">
                <TotalMount order={order} totalNumMeaning={totalNumMeaning} orderData={orderData} />
              </div>
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
  unitCode: [
    headerCode,
    ECLineCode,
    CATALineCode,
    FillHeaderCode,
    FillCATALineCode,
    FillECLineCode,
    HEADER_PAYINFO,
    RECEIVE_HEADER_CODE,
    RECEIVE_LINE_CODE,
    DOC_INFO,
    CONSIGNEE_INFO,
    RECEIVE_INFORMATION_TABLE, // 订单接收个性化
    RECEIVE_RECORD_INFO_TABLE,
  ],
})(
  connect(({ global }) => ({
    showMiniCart: global.showMiniCart,
    pointName: global.pointName,
  }))(OrderDetail)
);
