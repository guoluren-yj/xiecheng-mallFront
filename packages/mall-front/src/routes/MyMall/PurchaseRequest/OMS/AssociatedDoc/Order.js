import React, { useMemo } from 'react';
import { Row, Col, Icon, Tooltip } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';

import Tags from 'components/Tag';
import { SpanTitle } from 'utils/renderer';
import intl from 'utils/intl';
import Product from './Product';

export default function Order(props) {
  const { item } = props;
  const { orderEntryVOS = [] } = item;
  const originPoLineList = useMemo(() => orderEntryVOS.filter((p) => p.freightFlag !== 1), [
    orderEntryVOS,
  ]); // 过滤掉运费行
  const poLineList = [];
  originPoLineList.forEach((f) => {
    poLineList.push({ ...f, currencySymbol: item.currencySymbol });
  });

  const userInfo = (isSub) => {
    return (
      <>
        {isSub ? (
          <div
            className="content-item content-item-userInfo"
            style={{ height: 71 * poLineList.length }}
          >
            <p className="receiver">
              <Icon
                type="assignment_ind-o"
                style={{ fontSize: 14, marginTop: -2, marginRight: 4 }}
              />
              {item.buyerName}
            </p>
          </div>
        ) : (
          <>
            {poLineList.map((p) => {
              return (
                <div className="content-item content-item-userInfo">
                  <p className="receiver">
                    <Icon
                      type="assignment_ind-o"
                      style={{ fontSize: 14, marginTop: -2, marginRight: 4 }}
                    />
                    {item.buyerName}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </>
    );
  };

  const status = (s) => {
    let subStatus;
    // WAITING_APPROVE WAITING_PAY WAITING_SENT WAITING_RECEIVE FINISH
    switch (s) {
      case 'CANCELLED':
        subStatus = 'cancel';
        break;
      case 'FINISH':
        subStatus = 'success';
        break;
      case 'REJECT':
      case 'APPOVE_REJECT':
      case 'PRODUCT_REJECT':
        subStatus = 'failed';
        break;
      default:
        subStatus = 'info';
        break;
    }
    return subStatus;
  };

  const subOrder = (type) => {
    const orderAmount =
      item?.orderPriceFinalVO?.orderAmountMeaning || item?.orderPriceFinalVO?.orderAmount;
    const freightAmount =
      item?.orderPriceFinalVO?.freightAmountMeaning || item?.orderPriceFinalVO?.freightAmount;
    return (
      <Row>
        <Col span={13}>
          <Product poLineList={poLineList} />
        </Col>
        <Col span={3}>{userInfo(true)}</Col>
        <Col span={5}>
          <div
            className="content-item content-item-priceInfo"
            style={{ height: 71 * poLineList.length }}
          >
            <span className="price-num-label">
              <Icon type="assignment-o" style={{ fontSize: 14, marginTop: -1, marginRight: 4 }} />
              {intl.get('mallf.myRequest.view.order.amount').d('金额')}：
            </span>
            <span className="price" title={orderAmount}>
              {orderAmount}
            </span>
            {!!freightAmount && (
              <p>
                <SpanTitle>
                  {intl.get(`mallf.myRequest.model.companyOrder.freight`).d('运费')}：
                  {freightAmount}
                </SpanTitle>
              </p>
            )}
          </div>
        </Col>
        <Col span={3}>
          <div
            className="content-item content-item-status"
            style={{ height: 71 * poLineList.length }}
          >
            <p>
              <Tags style={{ display: 'inline-block' }} type={status(item.mallOrderStatus)}>
                {type
                  ? intl.get('mallf.myRequest.view.trading.closed').d('交易关闭')
                  : item.mallOrderStatusMeaning}
              </Tags>
              {item.rejectedReason && item.mallOrderStatus === 'REJECT' && (
                <Tooltip
                  title={`${intl.get('mallf.myRequest.view.denial.reason').d('拒绝原因')}：${
                    item.rejectedReason
                  }`}
                  placement="top"
                >
                  <HIcon
                    style={{ color: '#F56649', marginLeft: '6px' }}
                    type="exclamation-circle"
                    size={14}
                  />
                </Tooltip>
              )}
            </p>
          </div>
        </Col>
      </Row>
    );
  };

  const productOrder = () => {
    return (
      <Row>
        <Col span={13}>
          <Product poLineList={poLineList} />
        </Col>
        <Col span={3}>{userInfo()}</Col>
        <Col span={5}>
          {poLineList.map((product) => {
            return (
              <div className="content-item content-item-priceInfo">
                <span className="price-num-label">
                  <Icon
                    type="assignment-o"
                    style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
                  />
                  {intl.get('mallf.myRequest.view.order.amount').d('金额')}：
                </span>
                <span className="price">
                  <SpanTitle>
                    {product?.currencySymbol || ''}
                    {product?.orderPriceFinalVO?.entryAmountMeaning ||
                      product?.orderPriceFinalVO?.entryAmount}
                  </SpanTitle>
                </span>
              </div>
            );
          })}
        </Col>
        <Col span={3}>
          {poLineList.map((product) => {
            return (
              <div className="content-item content-item-status">
                <p>
                  <Tags
                    style={{ display: 'inline-block' }}
                    type={status(product.mallOrderEntryStatus)}
                  >
                    {product.mallOrderEntryStatusMeaning}
                  </Tags>
                  {item.rejectedReason && product.mallOrderEntryStatus === 'REJECT' && (
                    <Tooltip
                      title={`${intl.get('mallf.myRequest.view.denial.reason').d('拒绝原因')}：${
                        item.rejectedReason
                      }`}
                      placement="top"
                    >
                      <HIcon
                        style={{ color: '#F56649', marginLeft: '6px' }}
                        type="exclamation-circle"
                        size={14}
                      />
                    </Tooltip>
                  )}
                </p>
              </div>
            );
          })}
        </Col>
      </Row>
    );
  };

  return item.mallOrderStatus === 'CANCELLED'
    ? subOrder('CANCELLED')
    : item.mallOrderStatus
    ? subOrder()
    : productOrder();
}
