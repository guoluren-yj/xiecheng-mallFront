import React, { useMemo, useState } from 'react';
import { Icon, Checkbox } from 'choerodon-ui';
import { Tooltip, Button } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

import { myInvoice } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import intl from 'utils/intl';
import { getUserConfigInfo, numberRender, gotoPayUrl } from 'utils/utils';
import Link from 'components/Link';
import { TagRender } from 'utils/renderer';
import { getAfterSaleNum } from 'utils/configUtils';

import ApproveHistory from 'mall-front/lib/routes/MyMall/OMSOrder/OMS/OrderComponent/ApproveHistory';
import { toPayServise } from 'services/orderCenterService';
import Product from './Product';
import InvoiceModal from '../../common/InvoiceModal';
import LogisticsModal from '../../common/LogisticsModal';
import { getContextValue } from '../../common/Context';
import PayNow from './PayNow';

export default function rendersubOrders({
  item,
  onComment,
  index, // 父订单下标
}) {
  const { onAccept, currentStatus, list, setState, onApplyRefund } = getContextValue();
  const {
    error,
    poNum,
    orderEntryVOS,
    receiverAddress = {},
    // purOrderExtra = {},
    cecFromCode,
    paymentModel,
  } = item;
  const originPoLineList = useMemo(() => orderEntryVOS.filter((p) => p.freightFlag !== 1), [
    orderEntryVOS,
  ]); // 过滤掉运费行
  const poLineList = [];
  originPoLineList.forEach((f) => {
    poLineList.push({ ...f, currencySymbol: item?.currencySymbol || '' });
  });

  // const poLineList = useMemo(() => orderEntryVOS.filter((p) => p.freightFlag !== 1), [
  // orderEntryVOS,
  // ]); // 过滤掉运费行
  const isSaleType = item.agreementType === 'SALE'; // 当前ecpo是否为销售协议
  const { hideMenuList, hideFieldList } = getUserConfigInfo();

  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [logistVisible, setLogistVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  const toggleInvoiceModal = () => {
    setInvoiceVisible(!invoiceVisible);
  };

  const toggleLogistModal = () => {
    setLogistVisible(!logistVisible);
  };
  const handlePay = () => {
    setPayLoading(true);
    toPayServise({
      returnUrl: `${window.location.origin}/sigl/my-mall/my-order`,
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

  const userInfo = () => (
    <div>
      <p style={{ margin: '0 4px 5px' }}>
        <span>{intl.get('mallf.myMall.view.order.deliveryInformation').d('收货信息')}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myMall.view.order.receiver').d('收货人')}：
        <span>{receiverAddress.contactName}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myMall.view.order.shippingAddress').d('收货地址')}：
        <span title={receiverAddress.fullAddress}>
          {receiverAddress.fullAddress || ''}
          {/* {receiverAddress.address || ''} */}
        </span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myMall.view.order.contactInformation').d('联系方式')}：
        <span>{receiverAddress.mobilePhone}</span>
      </p>
    </div>
  );

  const user = () => (
    <div className="product-info-line">
      <p className="receiver" title={item.buyerName} style={error ? { color: '#999' } : {}}>
        <Tooltip placement="bottom" title={userInfo()}>
          <Icon type="assignment_ind-o" style={{ fontSize: 14, marginTop: -1 }} />
        </Tooltip>
        {item.buyerName}
      </p>
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
        className="text-overflow"
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

  const statusInfo = (product, subList) => {
    const {
      saleNum = 0, // 可售后数量
    } = product || {};
    const saleNumMessage = getAfterSaleNum(product);
    const saleNumFlag = Number(saleNum) > 0;
    return (
      <>
        {cecFromCode === 'MANUAL' ? (
          <>
            {product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
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
                  <Button
                    color="primary"
                    onClick={async () => {
                      if (product.receiptFlag === 1) {
                        await onAccept(subList || [product]);
                      }
                    }}
                    disabled={product.receiptFlag === 0}
                    className={classnames(['primary-btn', 'text-overflow'])}
                  >
                    {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                  </Button>
                </Tooltip>
              )}
          </>
        ) : (
          <>
            <span r-if={hideMenuList && !hideMenuList.includes('MY_EVALUATION')}>
              {product?.assessmentFlag === 1 && (
                <Button
                  color="primary"
                  onClick={() => onComment(product)}
                  title={intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                  className="primary-btn text-overflow"
                >
                  {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
                </Button>
              )}
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
            </span>
            {product.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
              hideFieldList &&
              !hideFieldList.includes('ACCEPTANCE') && (
                <>
                  <Tooltip
                    title={
                      product.receiptFlag === 0
                        ? intl.get('mallf.common.view.nosurport.accept').d('此商品不支持在商城接收')
                        : null
                    }
                    placement="bottom"
                  >
                    <Button
                      color="primary"
                      onClick={async () => {
                        if (product.receiptFlag === 1) {
                          await onAccept(subList || [product]);
                        }
                      }}
                      disabled={product.receiptFlag === 0}
                      className={classnames(['primary-btn', 'text-overflow'])}
                    >
                      {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                    </Button>
                  </Tooltip>
                </>
              )}
            <PayNow item={item} payLoading={payLoading} handlePay={handlePay} product={product} />
            {!!product.afterSaleFlag && (
              <Tooltip
                title={
                  saleNumFlag > 0
                    ? intl
                        .get('mallf.myMall.view.saleDetail.saleNumMessage', {
                          value: saleNumMessage,
                        })
                        .d(`共有${saleNumMessage}可进行售后`)
                    : null
                }
              >
                <Button
                  funcType="flat"
                  className="primary-link text-overflow"
                  color="primary"
                  style={{ marginLeft: 0, marginTop: 8, fontWeight: 600, padding: '0 5px' }}
                  title={intl.get('mallf.myOrder.view.afterSales.application').d('申请售后')}
                >
                  <Link
                    className="text-overflow"
                    to={`/sigl/oms-sale-detail?orderId=${item.orderId}&orderTypeCode=${item.orderTypeCode}&consignmentCode=${product.consignmentCode}&skuCode=${product.skuCode}&ecpoNum=${item.orderCode}&consignmentLineNum=${product.consignmentLineNum}&orderEntryId=${product?.orderEntryId}`}
                  >
                    {saleNumFlag > 0
                      ? `${intl.get('mallf.myOrder.view.afterSales.application').d('申请售后')}(${
                          product.saleNum
                        })`
                      : intl.get('mallf.myOrder.view.afterSalesView').d('查看售后')}
                  </Link>
                </Button>
              </Tooltip>
            )}
            {!!item.toRefundPaymentId && (
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
      </>
    );
  };

  // 总积分金额计算
  const getOrderTotalMount = () => {
    const orderData = item;
    const obj = {
      totalSigl: +orderData.orderPriceFinalVO?.skuTotalPoint,
      totalMoney: +orderData.freightNotIncloudOrderAmountMeaning,
      totalSiglFeight: +orderData.orderPriceFinalVO?.orderExtraPriceVO?.freightTotalPoint,
      totalFeight: +orderData.orderPriceFinalVO?.orderExtraPriceVO?.freightAmount,
    };
    if (orderData.paymentModel === 'HYBRID_PAYMENT') {
      if (orderData?.freightPointDeductionFlag === 1) {
        // 积分抵扣运费
        obj.totalFeight = 0;
      } else {
        obj.totalSiglFeight = 0;
      }
    }
    return obj;
  };

  const allPriceInfo = (
    <li
      className="product-price"
      style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}
    >
      <div className="product-info-price-num">
        <span
          className={`price ${error ? 'error' : ''}`}
          title={
            item?.orderPriceFinalVO?.finalAmountMeaning || item?.orderPriceFinalVO?.finalAmount
          }
        >
          {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(paymentModel) && (
            <span className="product-info-price-sigl">
              <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
              {numberRender(item?.totalPointPrice)}
              {['HYBRID_PAYMENT'].includes(paymentModel) && (
                <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>+</span>
              )}
            </span>
          )}
          {['HYBRID_PAYMENT', 'CASH_PAYMENT'].includes(paymentModel) &&
            `${item?.currencySymbol || ''}${
              item?.orderPriceFinalVO?.finalAmountMeaning || item?.orderPriceFinalVO?.finalAmount
            }`}
        </span>
        <p
          r-if={
            +getOrderTotalMount().totalSiglFeight !== 0 || +getOrderTotalMount().totalFeight !== 0
          }
        >
          {intl.get(`mallf.myMall.model.companyOrder.freight`).d('运费')}：
          <span r-if={+getOrderTotalMount().totalSiglFeight !== 0}>
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(getOrderTotalMount().totalSiglFeight)}
            <span
              r-if={+getOrderTotalMount().totalFeight !== 0}
              style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
            >
              +
            </span>
          </span>
          <span r-if={+getOrderTotalMount().totalFeight !== 0}>
            {item.currencySymbol || ''}
            {getOrderTotalMount().totalFeight}
          </span>
        </p>
        {/* {item.agreementBusinessType === 'POINTS' && item?.pointDeductionFlag !== 0 && (
          <div>
            <SiglPrice
              style={{ marginTop: 6 }}
              pointPrice={item.totalPointPrice}
              text={intl
                .get('mallf.common.sigl.cover.core', {
                  value: item.totalPointPrice,
                  name: pointName,
                })
                .d(`抵扣${item.totalPointPrice}${pointName}`)}
            />
          </div>
        )} */}
      </div>
    </li>
  );

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
                    isSaleType={isSaleType}
                    currentStatus={currentStatus}
                    product={p}
                    index={index}
                    subIndex={subIndex}
                    platformCode={p.cecFromCode}
                    paymentModel={paymentModel}
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
              {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
                hideFieldList &&
                !hideFieldList.includes('LOGISTICS') && (
                  <Button
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
                )}
              {product.invoiceFlag === 1 && !isSaleType && (
                <PermissionWrapper permissionList={myInvoice}>
                  <Button
                    funcType="flat"
                    className="primary-link"
                    title={intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      toggleInvoiceModal();
                      setCurrentProduct(product);
                    }}
                  >
                    {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                  </Button>
                </PermissionWrapper>
              )}
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
    const isEC = item.cecFromCode !== 'CATA' && item.cecFromCode !== 'MANUAL';
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
                          isSaleType={isSaleType}
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                          currentStatus={currentStatus}
                          product={product}
                          index={index}
                          subIndex={subIndex}
                          platformCode={product.cecFromCode}
                          paymentModel={paymentModel}
                        />
                      );
                    });
                  })
                : poLineList.map((product, subIndex) => {
                    return (
                      <Product
                        isSaleType={isSaleType}
                        style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        currentStatus={currentStatus}
                        product={product}
                        index={index}
                        subIndex={subIndex}
                        platformCode={product.cecFromCode}
                        paymentModel={paymentModel}
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
                  : {}
              }
            >
              {user(poLineList[0])}
            </li>
            {/* 暂时这么处理 */}
            {allPriceInfo}
            {/* {currentStatus === '' ? (
              allPriceInfo
            ) : (
              <li style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}>
                {isEC
                  ? Object.keys(subList).map((ecConsignmentCode) => {
                      return subList[ecConsignmentCode].map((product) => {
                        return (
                          <li
                            className="product-price line"
                            style={{ height: `${(1 / poLineList.length) * 100}%` }}
                          >
                            {priceInfo(product)}
                          </li>
                        );
                      });
                    })
                  : poLineList.map((product) => {
                      return (
                        <li
                          className="product-price line"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {priceInfo(product)}
                        </li>
                      );
                    })}
              </li>
            )} */}
            <li>
              {/* 电商接收要合单，多个子订单只展示一个接收 */}
              {isEC
                ? Object.keys(subList).map((ecConsignmentCode) => {
                    return subList[ecConsignmentCode].map((product) => {
                      return (
                        <li
                          className="product-info-status"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {orderStatus({
                            text: product.mallOrderEntryStatusMeaning,
                            type: status(product.mallOrderEntryStatus),
                            infos: product.infos,
                          })}
                          {['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                            hideFieldList &&
                            !hideFieldList.includes('LOGISTICS') && (
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
                          {product.invoiceFlag === 1 && (
                            <PermissionWrapper permissionList={myInvoice}>
                              <Button
                                funcType="flat"
                                className="primary-link"
                                style={{ marginTop: '8px' }}
                                onClick={() => {
                                  toggleInvoiceModal();
                                  setCurrentProduct(product);
                                }}
                              >
                                {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                              </Button>
                            </PermissionWrapper>
                          )}
                          {['WAITING_APPROVE', 'REJECT'].includes(product.mallOrderEntryStatus) && (
                            <ApproveHistory item={item} />
                          )}
                        </li>
                      );
                    });
                  })
                : poLineList.map((product) => {
                    return (
                      <li
                        className="product-info-status"
                        style={{ height: `${(1 / poLineList.length) * 100}%` }}
                      >
                        {orderStatus({
                          text: product.mallOrderEntryStatusMeaning,
                          type: status(product.mallOrderEntryStatus),
                          infos: product.infos,
                        })}
                        {['FINISH', 'WAITING_RECEIVE'].includes(product.mallOrderEntryStatus) &&
                          hideFieldList &&
                          !hideFieldList.includes('LOGISTICS') && (
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
                        {product.invoiceFlag === 1 && (
                          <PermissionWrapper permissionList={myInvoice}>
                            <Button
                              funcType="flat"
                              className="primary-link"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                toggleInvoiceModal();
                                setCurrentProduct(product);
                              }}
                            >
                              {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                            </Button>
                          </PermissionWrapper>
                        )}
                        {['WAITING_APPROVE', 'REJECT'].includes(product.mallOrderEntryStatus) && (
                          <ApproveHistory item={item} />
                        )}
                      </li>
                    );
                  })}
            </li>
            <li>
              {isEC
                ? Object.keys(subList).map((ecConsignmentCode) => {
                    if (
                      subList[ecConsignmentCode]?.[0]?.mallOrderEntryStatus === 'WAITING_RECEIVE'
                    ) {
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
                : poLineList.map((product) => {
                    return (
                      <li
                        className="product-info-handle"
                        style={{ height: `${(1 / poLineList.length) * 100}%` }}
                      >
                        {statusInfo(product)}
                      </li>
                    );
                  })}
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

  return <>{item.mallOrderStatus ? subOrderLine() : productLine()}</>;
}
