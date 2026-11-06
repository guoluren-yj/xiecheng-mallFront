import React, { useMemo, useState } from 'react';
import { Icon, Checkbox } from 'choerodon-ui';
import { Tooltip, Button, Message } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

import {
  afterSaleApplication,
  myComments,
  myInvoice,
  orderAcceptRecord,
} from 'components/Permission/permissionCode';
import { PermissionWrapper, PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { gotoPayUrl, getUserConfigInfo, openPage } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import { TagRender } from 'utils/renderer';
import CuxFn from '@/cuxTools/cuxFn';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { openOmsInvoiceModal } from '@/routes/MyMall/MyInvoice/MyInvoiceModal';
import { getAfterSaleNum } from 'utils/configUtils';

import {
  toPayServise,
  repayOrderService,
  orderSubmitService,
  getCardPasswordService,
} from 'services/orderCenterService';
// import LogisticsDrawer from 'components/LogisticsDrawer';
import swalAlert from 'components/swal';
import Product from './Product';
import InvoiceModal from '../../common/InvoiceModal';
import LogisticsModal from '../../common/LogisticsModal';
import { getContextValue } from '../../common/Context';
import OrderAgain from '../../common/OrderAgain';
import PayNow from './PayNow';
import ApproveHistory from './ApproveHistory';

export default function rendersubOrders({
  item,
  onComment,
  index, // 父订单下标
}) {
  const {
    onAccept,
    currentStatus,
    list,
    setState,
    onApplyRefund,
    fetchOrderData,
    onAcceptRecord,
  } = getContextValue();
  const {
    error,
    poNum,
    orderEntryVOS,
    receiverAddress = {},
    purOrderExtra = {},
    cecFromCode,
    companyAttributeBigint1,
    orderEntryExtraList,
  } = item;
  const isEC = item.cecFromCode !== 'CATA' && item.cecFromCode !== 'MANUAL';
  const poLineList = useMemo(() => orderEntryVOS.filter((p) => p.freightFlag !== 1), [
    orderEntryVOS,
  ]); // 过滤掉运费行
  const isReceive = useMemo(() => item.agreementBusinessType === 'RECEIVE', [item]); // 领用协议
  const isSaleType = item.agreementType === 'SALE'; // 当前ecpo是否为销售协议
  const { hideFieldList } = getUserConfigInfo();

  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [logistVisible, setLogistVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  // 京东E卡逻辑
  const isJDECard = item.cecFromCode === 'JD-V-ECRD'; // 来自电商“京东VOP-电子E卡”
  const [cardPasswordLoading, setCardPasswordLoading] = useState(false);
  const getCardPassword = (product) => {
    setCardPasswordLoading(true);
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
        setCardPasswordLoading(false);
      });
  };
  const cardPasswordBtn = (product = {}) => {
    const afterStatus = ['FINISH', 'WAITING_RECEIVE']; // 代发货之后的状态可以获取卡密
    return isJDECard && afterStatus.includes(product.mallOrderEntryStatus) ? (
      <Button
        waitType="throttle"
        wait={500}
        funcType="flat"
        loading={cardPasswordLoading}
        title={intl.get(`mallf.myOrder.view.message.getCardPassword`).d('获取卡密')}
        className="primary-link text-overflow"
        style={{ marginTop: '8px' }}
        onClick={() => {
          getCardPassword(product);
        }}
      >
        {cardPasswordLoading
          ? ''
          : intl.get(`mallf.myOrder.view.message.getCardPassword`).d('获取卡密')}
      </Button>
    ) : null;
  };

  const toggleInvoiceModal = () => {
    setInvoiceVisible(!invoiceVisible);
  };

  const toggleLogistModal = () => {
    setLogistVisible(!logistVisible);
  };

  const handlePay = () => {
    setPayLoading(true);
    toPayServise({
      returnUrl: `${window.location.origin}/my-mall/my-order`,
      paymentOrderDTOList: [
        {
          orderId: item.orderId,
          objectVersionNumber: item.objectVersionNumber,
        },
      ],
    })
      .then((res) => {
        if (res) {
          gotoPayUrl(res);
        }
      })
      .finally(() => {
        setPayLoading(false);
      });
  };

  const againOrder = () => {
    setSubmitLoading(true);
    orderSubmitService(item)
      .then((res) => {
        if (res) {
          fetchOrderData();
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const againSubmitOrder = () => {
    const hiddenBtnList = CuxFn({
      name: 'OMSOrder-fn-hiddenBtnList',
      value: {
        companyAttributeBigint1,
      },
    })(() => {
      return {
        cuxReSubmitFlag: true,
      };
    })();
    if (
      item.approveMethod === 'BATCH' &&
      item.batchOrderList?.length > 1 &&
      hiddenBtnList?.cuxReSubmitFlag
    ) {
      openComfirmModal({
        title: intl.get('mallf.common.view.prompt').d('提示'),
        border: false,
        children: intl
          .get('mallf.myOrder.view.orderAgainWarning', {
            value: item.batchNum,
          })
          .d(
            `该订单审批方式为工作流批次审批，提交订单将触发整个批次${item.batchNum}的订单一起提交，请确认批次下订单均处理完成。`
          ),
        onOk: () => {
          againOrder();
        },
      });
    } else {
      againOrder();
    }
  };

  const userInfo = () => (
    <div>
      <p style={{ margin: '0 4px 15px' }}>
        {intl.get('mallf.common.view.change.orderPeople').d('下单人')}：
        <span>{item.buyerName}</span>
      </p>
      <p style={{ margin: '0 4px 5px', fontWeight: 600 }}>
        <span>{intl.get('mallf.myOrder.view.order.deliveryInformation').d('收货信息')}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.receiver').d('收货人')}：
        <span>{receiverAddress.contactName}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.contactInformation').d('联系方式')}：
        <span>
          {receiverAddress.mobilePhone}
          {receiverAddress.telPhone ? `/${receiverAddress.telPhone}` : ''}
        </span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.shippingAddress').d('收货地址')}：
        <span title={receiverAddress.fullAddress || receiverAddress.address}>
          {receiverAddress.fullAddress || receiverAddress.address}
        </span>
      </p>
      {purOrderExtra.invoiceContactName && (
        <>
          <p style={{ margin: '15px 4px 5px', fontWeight: 600 }}>
            <span>{intl.get('mallf.myOrder.view.order.acquireInformation').d('收单信息')}</span>
          </p>
          <p style={{ margin: '0 4px 5px' }}>
            {intl.get('mallf.myOrder.view.order.acquirer').d('收单人')}：
            <span>{purOrderExtra.invoiceContactName}</span>
          </p>
          <p style={{ margin: '0 4px' }}>
            {intl.get('mallf.myOrder.view.order.contactInformation').d('联系方式')}：
            <span>{purOrderExtra.invoiceTelNum}</span>
          </p>
          <p style={{ margin: '0 4px 5px' }}>
            {intl.get('mallf.myOrder.view.order.billingAddress').d('收单地址')}：
            <span title={`${purOrderExtra.fullAddress || ''}`}>
              {purOrderExtra.fullAddress || ''}
            </span>
          </p>
        </>
      )}
    </div>
  );
  const cuxDeliveryDate = CuxFn({
    name: 'omsOrder-fn-cuxDeliveryDate',
    value: { item },
  })();

  const user = () => (
    <div className="product-info-line">
      <p
        className="receiver"
        title={isReceive ? item.buyerName : receiverAddress.contactName}
        style={error ? { color: '#999' } : {}}
      >
        <Tooltip placement="bottom" title={isReceive ? null : userInfo()}>
          <Icon type="local_shipping-o" style={{ fontSize: 14, marginTop: -1 }} />
        </Tooltip>
        {/* 领用没有收货人 故展示下单人  */}
        {isReceive ? item.buyerName : receiverAddress.contactName}
      </p>
      {cuxDeliveryDate}
    </div>
  );

  const handleOnCheck = (checked, subIndex) => {
    const newList = JSON.parse(JSON.stringify(list));
    if (typeof subIndex !== 'number') {
      // 勾选整个子订单
      newList[index].orderEntryVOS.forEach((p) => {
        if (p.ecConsignmentCode === subIndex.ecConsignmentCode) {
          // eslint-disable-next-line no-param-reassign
          p.checked = checked;
        }
      });
    } else {
      newList[index].orderEntryVOS[subIndex].checked = checked;
    }
    if (
      newList[index].orderEntryVOS.every((p) => p.checked) ||
      newList[index].orderEntryVOS.every((p) => !p.checked)
    ) {
      newList[index].checked = checked;
    }

    setState({ list: newList });
  };

  const handleOnAccept = ({ product, subList }) => {
    return CuxFn({
      name: 'OMSOrder-fn-handleBtnOnAccept',
      value: { product, subList, onAccept },
    })(async () => {
      if (product.receiptFlag === 1) {
        await onAccept(subList || [product]);
      }
    })();
  };

  const handleOnSaleReq = ({ product }) => {
    const url = `/oms-sale-detail?orderId=${item.orderId}&orderTypeCode=${item.orderTypeCode}&consignmentCode=${product.consignmentCode}&skuCode=${product.skuCode}&ecpoNum=${item.orderCode}&consignmentLineNum=${product.consignmentLineNum}&orderEntryId=${product?.orderEntryId}`;
    CuxFn({
      name: 'OMSOrder-fn-handleBtnOnSaleReq',
      value: { item, product, url },
    })(() => {
      openPage(url);
    })();
  };

  function handleRepay(product) {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      children: intl
        .get('mallf.myOrder.view.orderRepayMessage')
        .d(
          `扣款是针对整个商城订单发起的，若不满足电商扣款条件，扣款可能不会成功。请确认是否发起扣款？`
        ),
      onOk: async () => {
        try {
          const res = await repayOrderService({ orderId: product.orderId });
          if (res) {
            Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
            fetchOrderData();
          }
        } catch {
          // no
        }
      },
    });
  }

  const status = (s) => {
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

  // 订单状态展示
  const orderStatus = ({ type = '', text, infos }) => {
    const hasOtherColorFlag = Array.from(new Set(item.infos.map((n) => n.color))).length > 1;
    return (
      <p
        style={{
          height: '18px',
          alignItems: 'center',
          padding: '0 10px',
        }}
      >
        {TagRender({
          text,
          type,
          style: { maxWidth: '80px', marginRight: 0 },
          icon: (
            <>
              {!isEmpty(infos) && (
                <Tooltip
                  title={infos
                    .filter((n) => n.color === infos?.[0]?.color)
                    .map((m) => (
                      <p>{`${m.infoType ? `${m.infoType}    :` : ``} ${m.info}`}</p>
                    ))}
                  // title={`${item.infos?.[0]?.infoType ? `${item.infos?.[0]?.infoType}    :` : ``} ${item.infos?.[0]?.info}`}
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
        {hasOtherColorFlag && (
          <Tooltip
            title={infos
              .filter((n) => n.color === 'red')
              .map((m) => (
                <p>{`${m.infoType ? `${m.infoType}    :` : ``} ${m.info}`}</p>
              ))}
            placement="top"
          >
            <Icon
              style={{
                fontSize: '14px',
                marginLeft: '5px',
                color: '#F56649',
                marginTop: '-10px',
              }}
              type="error"
            />
          </Tooltip>
        )}
      </p>
    );
  };

  // 申请售后按钮
  const afterSaleButtonRender = (product) => {
    const {
      saleNum = 0, // 可售后数量
    } = product || {};
    const saleNumMessage = getAfterSaleNum(product);
    const saleNumFlag = Number(saleNum) > 0;
    return (
      <Tooltip
        title={
          saleNumFlag
            ? intl
                .get('mallf.myMall.view.saleDetail.saleNumMessage', {
                  value: saleNumMessage,
                })
                .d(`共有${saleNumMessage}可进行售后`)
            : null
        }
      >
        <PermissionButton
          r-if={!!product.afterSaleFlag && !['ATTACHMENT', 'GIFT'].includes(product.skuType)}
          permissionList={[afterSaleApplication]}
          funcType="flat"
          className="primary-link text-overflow"
          color="primary"
          style={{ marginLeft: 0, marginTop: 8, fontWeight: 600, display: 'block' }}
          onClick={() => {
            handleOnSaleReq({ product });
          }}
          tooltip={saleNumFlag ? 'none' : 'overflow'}
        >
          {saleNumFlag
            ? `${intl.get('mallf.myOrder.view.afterSales.application').d('申请售后')}(${saleNum})`
            : intl.get('mallf.myOrder.view.afterSalesView').d('查看售后')}
        </PermissionButton>
      </Tooltip>
    );
  };

  const statusInfo = (product, subList) => {
    const hiddenBtnList = CuxFn({
      name: 'OMSOrder-fn-hiddenBtnList',
      value: {
        product,
        subList,
        companyAttributeBigint1,
      },
    })(() => {
      return {
        cuxReSubmitFlag: true,
      };
    })();
    // console.log('hiddenBtnList', hiddenBtnList);

    const cuxAcceptShowFlag = CuxFn({
      name: 'OMSOrder-fn-cuxAcceptShowFlag',
      value: {
        product,
        subList,
        hideFieldList,
        item,
      },
    })(
      () =>
        product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
        hideFieldList &&
        !hideFieldList.includes('ACCEPTANCE')
    )();

    return (
      <>
        <Button
          r-if={isEC && product.ecPaymentFlag === 0}
          color="primary"
          onClick={() => {
            handleRepay(product, subList);
          }}
          className={classnames(['primary-btn', 'text-overflow'])}
        >
          {intl.get('mallf.myOrder.view.button.repay').d('发起扣款')}
        </Button>
        {cecFromCode === 'MANUAL' ? (
          <>
            {product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
              hideFieldList &&
              !hideFieldList.includes('ACCEPTANCE') && (
                <Tooltip
                  title={
                    product.receiptFlag === 0
                      ? intl.get('mallf.myOrder.view.nosurport.accept').d('此商品不支持在商城接收')
                      : null
                  }
                  placement="bottom"
                >
                  <Button
                    color="primary"
                    onClick={() => handleOnAccept({ product, subList })}
                    disabled={product.receiptFlag === 0}
                    className={classnames(['primary-btn', 'text-overflow'])}
                  >
                    {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                  </Button>
                </Tooltip>
              )}
            <PermissionButton
              r-if={['RECEIVE_REJECT', 'RECEIVE_APPROVING', 'WAITING_RECEIVE'].includes(
                product.mallOrderEntryStatus
              )}
              permissionList={[orderAcceptRecord]}
              funcType="flat"
              className="primary-link text-overflow"
              color="primary"
              style={{ marginLeft: 0, marginTop: 8, fontWeight: 600, display: 'block' }}
              onClick={() => {
                onAcceptRecord({ product });
              }}
            >
              {intl.get('mallf.orderDetail.view.receiving.records').d('接收记录')}
            </PermissionButton>
            {afterSaleButtonRender(product)}
          </>
        ) : (
          <>
            <PermissionWrapper permissionList={[myComments]}>
              <Button
                r-if={product?.assessmentFlag === 1 && !isReceive}
                color="primary"
                onClick={() => onComment(product)}
                title={intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                className="primary-btn text-overflow"
              >
                {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
              </Button>
              {product?.assessmentFlag === 2 && (
                <Button
                  funcType="flat"
                  color="primary"
                  onClick={() => onComment(product)}
                  title={intl.get('mallf.common.view.goto.addComment').d('追加评论')}
                  className="primary-link text-overflow"
                  style={{ marginTop: 0 }}
                >
                  {intl.get('mallf.common.view.goto.addComment').d('追加评论')}
                </Button>
              )}
              {product?.assessmentFlag === 3 && (
                <Button
                  funcType="flat"
                  color="primary"
                  onClick={() => onComment(product)}
                  title={intl.get('mallf.common.view.goto.commentView').d('查看评论')}
                  className="primary-link text-overflow"
                  style={{ marginTop: 0 }}
                >
                  {intl.get('mallf.common.view.goto.commentView').d('查看评论')}
                </Button>
              )}
            </PermissionWrapper>
            {cuxAcceptShowFlag && (
              <>
                <Tooltip
                  title={
                    product.receiptFlag === 0
                      ? intl.get('mallf.myOrder.view.nosurport.accept').d('此商品不支持在商城接收')
                      : null
                  }
                  placement="bottom"
                >
                  <Button
                    color="primary"
                    onClick={() => handleOnAccept({ product, subList })}
                    disabled={product.receiptFlag === 0}
                    className={classnames(['primary-btn', 'text-overflow'])}
                  >
                    {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                  </Button>
                </Tooltip>
              </>
            )}
            <PermissionButton
              r-if={['RECEIVE_REJECT', 'RECEIVE_APPROVING', 'WAITING_RECEIVE'].includes(
                product.mallOrderEntryStatus
              )}
              permissionList={[orderAcceptRecord]}
              funcType="flat"
              className="primary-link text-overflow"
              color="primary"
              style={{ marginLeft: 0, marginTop: 8, fontWeight: 600, display: 'block' }}
              onClick={() => {
                onAcceptRecord({ product });
              }}
            >
              {intl.get('mallf.orderDetail.view.receiving.records').d('接收记录')}
            </PermissionButton>
            <PayNow
              r-if={!['ATTACHMENT', 'GIFT'].includes(product.skuType)}
              item={item}
              payLoading={payLoading}
              handlePay={handlePay}
              product={product}
            />
            {cardPasswordBtn(product)}
            {afterSaleButtonRender(product)}
            {!!item.toRefundPaymentId && !['ATTACHMENT', 'GIFT'].includes(product.skuType) && (
              <Button
                funcType="flat"
                color="primary"
                className="primary-link text-overflow"
                style={{ marginTop: 8 }}
                onClick={() => onApplyRefund(item)}
                title={intl.get('mallf.myOrder.view.applyRefund').d('申请退款')}
              >
                {intl.get('mallf.myOrder.view.applyRefund').d('申请退款')}
              </Button>
            )}
          </>
        )}
        {(!!item.submitFlag || !!item.resubmitFlag) &&
          hiddenBtnList?.cuxReSubmitFlag &&
          !['ATTACHMENT', 'GIFT'].includes(product.skuType) && (
            <Button
              waitType="throttle"
              wait={500}
              color="primary"
              loading={submitLoading}
              onClick={() => againSubmitOrder(item)}
              className="primary-btn text-overflow"
              title={intl.get('mallf.myOrder.view.againSubmitOrder').d('重新提交')}
            >
              {intl.get('mallf.myOrder.view.againSubmitOrder').d('重新提交')}
            </Button>
          )}
        {!!item.editFlag &&
          !isReceive &&
          !isSaleType &&
          !['ATTACHMENT', 'GIFT'].includes(product.skuType) && (
            <OrderAgain product={product} order={item} fetchOrderData={fetchOrderData} />
          )}
      </>
    );
  };

  const allPriceInfo = CuxFn({
    name: 'OMSOrder-fn-allPriceInfo',
    value: { item, currentStatus, isSaleType, error },
  })(() => (
    <li
      className="product-price"
      style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}
    >
      <div className="product-info-price-num">
        <span className="price-num-label">
          <Tooltip
            placement="bottom"
            title={
              currentStatus === '' ? (
                <>
                  <p style={{ marginBottom: 5 }}>
                    {intl.get('mallf.myOrder.view.products.finalPrice').d('实付款')}：
                    <span className="price-color">
                      {item?.currencySymbol}
                      {item?.orderPriceFinalVO?.finalAmountMeaning ||
                        item?.orderPriceFinalVO?.finalAmount}
                    </span>
                  </p>
                  <p>
                    {intl.get('mallf.myOrder.model.paymentMethod').d('支付方式')}：
                    {(isSaleType ? item.proxyPaymentTypeMeaning : item.paymentTypeMeaning) || '-'}
                  </p>
                </>
              ) : null
            }
          >
            <Icon
              className="price-color"
              type="assignment-o"
              style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
            />
          </Tooltip>
        </span>
        <span
          className={`price ${error ? 'error' : ''}`}
          title={
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount
          }
        >
          {item?.currencySymbol}
          {item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
        </span>
        <p r-if={!!item.orderPriceFinalVO?.extraCostAmount}>
          <span>
            <Tooltip
              placement="bottom"
              title={
                item.orderPriceFinalVO?.orderExtraPriceVO ? (
                  <>
                    <p style={{ marginBottom: 5 }}>
                      {intl.get(`mallf.common.model.freight`).d('运费(含税)')}：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmountMeaning ||
                          item?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmount}
                      </span>
                    </p>
                    <p r-if={item?.orderPriceFinalVO?.orderExtraPriceVO.installCostAmount}>
                      {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmountMeaning ||
                          item?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmount}
                      </span>
                    </p>
                  </>
                ) : null
              }
            >
              <Icon
                className="extra-price-color"
                type="assignment-o"
                style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
              />
            </Tooltip>
          </span>
          <span
            className="ex-money"
            title={
              item?.orderPriceFinalVO?.extraCostAmountMeaning ||
              item?.orderPriceFinalVO?.extraCostAmount
            }
          >
            {intl.get(`mallf.common.model.exMoney1`).d('附加费')}:{item?.currencySymbol}
            {item?.orderPriceFinalVO?.extraCostAmountMeaning ||
              item?.orderPriceFinalVO?.extraCostAmount}
          </span>
        </p>
      </div>
    </li>
  ))();

  // 子订单（只有一条）
  const subOrderLine = () => {
    const product = poLineList[0];
    return (
      <div className={`"order-detail-product" ${error ? 'error' : ''}`}>
        <div className="detail-product-info">
          <div className="product-info-left">
            <ul>
              {poLineList.map((p, subIndex) => {
                return (
                  <Product
                    item={item}
                    dualFlag={item.dualFlag} // 是否开启双单位
                    currencySymbol={item?.currencySymbol}
                    isSaleType={isSaleType}
                    currentStatus={currentStatus}
                    product={p}
                    index={index}
                    subIndex={subIndex}
                    platformCode={p.cecFromCode}
                    isReceive={isReceive}
                    orderEntryExtraList={orderEntryExtraList}
                  />
                );
              })}
            </ul>
          </div>
          <ul className="product-info-right">
            <li
              className="product-info-receiver"
              style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 130 } : {}}
            >
              {user(product)}
            </li>
            {allPriceInfo}
            <li className="product-info-status" style={{ borderBottom: 'none' }}>
              {orderStatus({
                type: status(item.mallOrderStatus),
                text: item.mallOrderStatusMeaning,
                infos: item.infos,
              })}
              {['WAITING_APPROVE', 'REJECT'].includes(item.mallOrderStatus) && (
                <ApproveHistory item={item} />
              )}
              <Button
                r-if={
                  ['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
                  hideFieldList &&
                  !hideFieldList.includes('LOGISTICS') &&
                  !isReceive &&
                  !isJDECard
                }
                funcType="flat"
                title={intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
                className="primary-link text-overflow"
                style={{ marginTop: '8px' }}
                onClick={() => {
                  toggleLogistModal();
                  setCurrentProduct(product);
                }}
              >
                {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
              </Button>
              {product.invoiceFlag === 1 &&
                !['ATTACHMENT', 'GIFT'].includes(product.skuType) &&
                !isSaleType && (
                  <PermissionButton
                    permissionList={[myInvoice]}
                    funcType="flat"
                    className="primary-link"
                    title={intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      openOmsInvoiceModal({
                        invoice: {
                          orderCode: item.orderCode,
                          consignmentCode: product.consignmentCode,
                        },
                      });
                    }}
                  >
                    {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                  </PermissionButton>
                )}
              <CuxWrapper
                path="OMSOrder/OMS/SubOrderLine/orderStatus/cuxRender"
                value={{ item, poLineList, product, fetchOrderData }}
              />
            </li>
            <li className="product-info-handle">{statusInfo(product)}</li>
          </ul>
        </div>
      </div>
    );
  };

  // 按商品行展示（有多少商品行就有多少行）
  const productLine = () => {
    const subList = {};
    if (isEC) {
      poLineList.forEach((x) => {
        if (subList[x.ecConsignmentCode]) {
          subList[x.ecConsignmentCode] = subList[x.ecConsignmentCode].concat(x);
        } else {
          subList[x.ecConsignmentCode] = [x];
        }
      });
    }

    return (
      <div className={`"order-detail-product" ${error ? 'error' : ''}`}>
        <div className="detail-product-info">
          {currentStatus === 'WAITING_RECEIVE' &&
            hideFieldList &&
            !hideFieldList.includes('ACCEPTANCE') && (
              <div style={{ borderRight: '1px solid #EBEBEB' }}>
                {isEC
                  ? Object.keys(subList).map((ecConsignmentCode) => {
                      const product = subList[ecConsignmentCode]?.[0];
                      return (
                        <div
                          className="product-info-select"
                          style={{
                            height: `${
                              (subList[ecConsignmentCode]?.length / poLineList.length) * 100
                            }%`,
                          }}
                        >
                          {['WAITING_RECEIVE'].includes(currentStatus) && (
                            <Checkbox
                              className="product-line-checkbox"
                              checked={!!product.checked}
                              disabled={
                                product.mallOrderEntryStatus !== 'WAITING_RECEIVE' ||
                                product.receiptFlag !== 1
                              }
                              onChange={(e) => {
                                handleOnCheck(e.target.checked, product);
                              }}
                            />
                          )}
                        </div>
                      );
                    })
                  : poLineList.map((product, subIndex) => {
                      return (
                        <div
                          className="product-info-select"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {['WAITING_RECEIVE'].includes(currentStatus) && (
                            <Checkbox
                              className="product-line-checkbox"
                              checked={!!product.checked}
                              disabled={
                                product.mallOrderEntryStatus !== 'WAITING_RECEIVE' ||
                                product.receiptFlag !== 1
                              }
                              onChange={(e) => {
                                handleOnCheck(e.target.checked, subIndex);
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
              </div>
            )}
          <div className="product-info-left">
            <ul style={{ height: '100%' }}>
              {isEC
                ? Object.keys(subList).map((ecConsignmentCode, subIndex) => {
                    return subList[ecConsignmentCode].map((product) => {
                      return (
                        <Product
                          item={item}
                          dualFlag={item.dualFlag}
                          currencySymbol={item?.currencySymbol}
                          isSaleType={isSaleType}
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                          currentStatus={currentStatus}
                          product={product}
                          index={index}
                          subIndex={subIndex}
                          platformCode={product.cecFromCode}
                          isReceive={isReceive}
                          orderEntryExtraList={orderEntryExtraList}
                        />
                      );
                    });
                  })
                : poLineList.map((product, subIndex) => {
                    return (
                      <Product
                        item={item}
                        dualFlag={item.dualFlag}
                        currencySymbol={item?.currencySymbol}
                        isSaleType={isSaleType}
                        style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        currentStatus={currentStatus}
                        product={product}
                        index={index}
                        subIndex={subIndex}
                        platformCode={product.cecFromCode}
                        isReceive={isReceive}
                        orderEntryExtraList={orderEntryExtraList}
                      />
                    );
                  })}
            </ul>
          </div>
          <ul className="product-info-right">
            <li
              className="product-info-receiver"
              style={
                !['WAITING_RECEIVE'].includes(currentStatus) ||
                (['WAITING_RECEIVE'].includes(currentStatus) &&
                  hideFieldList &&
                  hideFieldList.includes('ACCEPTANCE'))
                  ? { width: 130 }
                  : { width: 100 }
              }
            >
              {user(poLineList[0])}
            </li>
            {allPriceInfo}
            <li
              style={{ display: 'grid', gridTemplateRows: poLineList.map(() => '1fr').join(' ') }}
            >
              {/* 电商接收要合单，多个子订单只展示一个接收 */}
              {isEC ? (
                Object.keys(subList).map((ecConsignmentCode) => {
                  return subList[ecConsignmentCode].map((product) => {
                    return (
                      <li
                        className="product-info-status"
                        // style={{ height: `${(1 / poLineList.length) * 100}%` }}
                      >
                        {orderStatus({
                          text: product.mallOrderEntryStatusMeaning,
                          type: status(product.mallOrderEntryStatus),
                          infos: product.infos,
                        })}
                        <Button
                          r-if={
                            ['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                            hideFieldList &&
                            !hideFieldList.includes('LOGISTICS') &&
                            !isReceive &&
                            !isJDECard
                          }
                          funcType="flat"
                          className="primary-link"
                          style={{ marginTop: '8px' }}
                          onClick={() => {
                            toggleLogistModal();
                            setCurrentProduct(product);
                          }}
                        >
                          {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
                        </Button>
                        {product.invoiceFlag === 1 &&
                          !['ATTACHMENT', 'GIFT'].includes(product.skuType) && (
                            <PermissionButton
                              permissionList={[myInvoice]}
                              funcType="flat"
                              className="primary-link"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                openOmsInvoiceModal({
                                  invoice: {
                                    orderCode: item.orderCode,
                                    consignmentCode: product.consignmentCode,
                                  },
                                });
                              }}
                            >
                              {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                            </PermissionButton>
                          )}
                        {['WAITING_APPROVE', 'REJECT'].includes(product.mallOrderEntryStatus) && (
                          <ApproveHistory item={item} />
                        )}
                        <CuxWrapper
                          path="OMSOrder/OMS/SubOrderLine/orderStatus/cuxRender"
                          value={{ item, poLineList, product, fetchOrderData }}
                        />
                      </li>
                    );
                  });
                })
              ) : (
                <CuxWrapper
                  path="OMSOrder/OMS/SubOrderLine/orderStatus"
                  value={{
                    poLineList,
                    orderStatus,
                    status,
                    item,
                    hideFieldList,
                    isReceive,
                    isJDECard,
                    toggleLogistModal,
                    setCurrentProduct,
                    openOmsInvoiceModal,
                  }}
                >
                  {poLineList.map((product) => {
                    return (
                      <li
                        className="product-info-status"
                        // style={{ height: `${(1 / poLineList.length) * 100}%` }}
                      >
                        {orderStatus({
                          text: product.mallOrderEntryStatusMeaning,
                          type: status(product.mallOrderEntryStatus),
                          infos: product.infos,
                        })}
                        {['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                          hideFieldList &&
                          !hideFieldList.includes('LOGISTICS') &&
                          !isReceive &&
                          !isJDECard && (
                            <Button
                              funcType="flat"
                              className="primary-link"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                toggleLogistModal();
                                setCurrentProduct(product);
                              }}
                            >
                              {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
                            </Button>
                          )}
                        {product.invoiceFlag === 1 &&
                          !['ATTACHMENT', 'GIFT'].includes(product.skuType) &&
                          !isReceive && (
                            <PermissionButton
                              permissionList={[myInvoice]}
                              funcType="flat"
                              className="primary-link"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                openOmsInvoiceModal({
                                  invoice: {
                                    orderCode: item.orderCode,
                                    consignmentCode: product.consignmentCode,
                                  },
                                });
                              }}
                            >
                              {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                            </PermissionButton>
                          )}
                        {['WAITING_APPROVE', 'REJECT'].includes(product.mallOrderEntryStatus) && (
                          <ApproveHistory item={item} />
                        )}
                        <CuxWrapper
                          path="OMSOrder/OMS/SubOrderLine/orderStatus/cuxRender"
                          value={{ item, poLineList, product, fetchOrderData }}
                        />
                      </li>
                    );
                  })}
                </CuxWrapper>
              )}
            </li>
            <li>
              {isEC ? (
                Object.keys(subList).map((ecConsignmentCode) => {
                  if (subList[ecConsignmentCode]?.[0]?.mallOrderEntryStatus === 'WAITING_RECEIVE') {
                    const product = subList[ecConsignmentCode]?.[0];
                    return (
                      <li
                        className="product-info-handle"
                        style={{
                          height: `${
                            (subList[ecConsignmentCode]?.length / poLineList.length) * 100
                          }%`,
                        }}
                      >
                        {statusInfo(product, subList[ecConsignmentCode])}
                      </li>
                    );
                  } else {
                    return subList[ecConsignmentCode].map((product) => {
                      return (
                        <li
                          className="product-info-handle"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {statusInfo(product)}
                        </li>
                      );
                    });
                  }
                })
              ) : (
                <CuxWrapper
                  path="OMSOrder/OMS/SubOrderLine/cataHandleBtns"
                  value={{ poLineList, statusInfo, item }}
                >
                  {poLineList.map((product) => (
                    <li
                      className="product-info-handle"
                      style={{ height: `${(1 / poLineList.length) * 100}%` }}
                    >
                      {statusInfo(product)}
                    </li>
                  ))}
                </CuxWrapper>
              )}
            </li>
          </ul>
        </div>
        {invoiceVisible && (
          <InvoiceModal
            poNum={poNum}
            visible={invoiceVisible}
            toggleModal={toggleInvoiceModal}
            product={currentProduct}
            isOMS
          />
        )}
        {logistVisible && (
          <LogisticsModal
            toggleModal={toggleLogistModal}
            visible={logistVisible}
            product={currentProduct}
            cecOrderCode={item.cecOrderCode}
          />
        )}
      </div>
    );
  };

  return (
    // 有头状态字段聚合展示，没有按行展示
    <>{item.mallOrderStatus ? subOrderLine() : productLine()}</>
  );
}
