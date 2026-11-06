import React from 'react';

import { Checkbox, Tooltip, Icon, Badge } from 'choerodon-ui';

import { SupplierComponent, CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import { getPrimaryColor, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import newImg from 'mall-front/lib/assets/images/new3.png';
import openPrint from 'mall-front/lib/routes/MyMall/OMSOrder/common/Print';
import OrderCheck from 'mall-front/lib/routes/MyMall/OMSOrder/OMS/OrderComponent/OrderCheck';

function SubOrderHeader({
  item,
  error,
  errorMsg,
  checkBoxList,
  currentStatus,
  isOnline,
  hideFieldList,
  checkedList,
  handleOnCheck = (e) => e,
  poNum,
  orderId,
  ecPoNum,
  cecFromCode,
  supplierCompanyName,
  cecCreatedTime,
  onCancelOrder = (e) => e,
  onAgainOrder = (e) => e,
  selectOrderIds,
}) {
  return (
    <div className="order-number-header">
      {item.readFlag === 0 && !error && (
        <img alt="" style={{ width: 25, height: 25 }} src={newImg} />
      )}
      <ul>
        {error ? (
          <div style={{ color: '#D0521E', marginTop: '10px' }}>
            因订单发生异常，该订单交易关闭（{errorMsg}）
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', margin: '10px 0' }}>
              <li className="text-overflow">
                {checkBoxList.includes(currentStatus) &&
                  !(currentStatus === 'WAITING_PAY' && !isOnline) &&
                  hideFieldList &&
                  !hideFieldList.includes('ACCEPTANCE') && (
                    <Checkbox
                      disabled={
                        currentStatus === 'WAITING_PAY'
                          ? (checkedList[0] &&
                              checkedList[0].supplierCompanyName !== item.supplierCompanyName) ||
                            item.personPayFlag !== 1
                          : !item.orderEntryVOS.some(
                              (p) =>
                                p.mallOrderEntryStatus === 'WAITING_RECEIVE' && p.receiptFlag === 1
                            )
                      }
                      style={{ marginRight: 7 }}
                      checked={item.checked}
                      onClick={(e) => handleOnCheck(e.target.checked)}
                    />
                  )}
                <OrderCheck
                  orderId={orderId}
                  r-if={currentStatus === ''}
                  selectOrderIds={selectOrderIds}
                />
                <div
                  className="text-overflow"
                  style={{ maxWidth: currentStatus === 'WAITING_RECEIVE' ? 80 : 105 }}
                  title={intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}
                >
                  {intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}：
                </div>
                <div
                  className="text-overflow"
                  title={poNum}
                  style={{ color: getPrimaryColor() }}
                  onClick={() => {
                    openPage(`${HmallConfig.contextPath}/oms-order-detail?orderId=${orderId}`);
                  }}
                >
                  {poNum}
                </div>
                <CopyButton
                  style={{ top: -3 }}
                  num={poNum}
                  label={intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}
                />
              </li>
              <SupplierComponent>
                <li
                  className="supplier-item text-overflow"
                  style={{
                    width:
                      ecPoNum && cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL'
                        ? item.poMessageUnReadVO?.unreadFlag
                          ? 170
                          : 190
                        : item.poMessageUnReadVO?.unreadFlag
                        ? 220
                        : 190,
                  }}
                >
                  {intl.get('mallf.myOrder.view.supplier').d('供应商')}：
                  <p className="text-overflow" title={supplierCompanyName}>
                    {supplierCompanyName}
                  </p>
                </li>
              </SupplierComponent>
              <li className="ecNum-item text-overflow" r-if={item.mallOrderStatus !== 'REJECT'}>
                {intl.get('mallf.myOrder.view.order.zhenhuiCode').d('汇联易申请编码')}：
                <p
                  title={item.requestCode}
                  onClick={() => {
                    if (item.pcUrl) {
                      window.open(item.pcUrl);
                    }
                  }}
                  style={{ color: getPrimaryColor(), cursor: 'pointer' }}
                >
                  {item.requestCode || '-'}
                </p>
              </li>
              {!!item.poMessageUnReadVO?.unreadFlag && (
                <span className="order-header-count" style={{ marginRight: 20 }}>
                  <Badge size="small" count={item?.poMessageUnReadVO?.unreadCount}>
                    <Tooltip
                      placement="bottom"
                      title={intl
                        .get('mallf.myOrder.view.unreadFlag')
                        .d('您有未读供应商留言，请点击单号至详情页查看')}
                    >
                      <Icon size={16} type="message2" style={{ color: getPrimaryColor() }} />
                    </Tooltip>
                  </Badge>
                </span>
              )}
            </div>
          </>
        )}
      </ul>
      {!error && (
        <>
          <div className="order-centent-header-time">{cecCreatedTime}</div>
          <div className="order-centent-header-detail">
            <Tooltip title={intl.get('mallf.myOrder.botton.print').d('打印')} placement="top">
              <div r-if={item.print} style={{ float: 'left' }}>
                <Icon
                  type="print-o"
                  style={{
                    fontSize: 14,
                    lineHeight: '36px',
                    cursor: 'pointer',
                    marginLeft: 10,
                  }}
                  onClick={() => openPrint(item)}
                />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('mallf.myOrder.view.cancelOrder').d('取消订单')}
              placement="top"
            >
              <div r-if={item.cancelButtonFlag === '1'} style={{ float: 'left' }}>
                <Icons
                  type="cancel_order"
                  style={{
                    fontSize: 14,
                    lineHeight: '36px',
                    cursor: 'pointer',
                    marginLeft: 10,
                  }}
                  onClick={() => onCancelOrder(item)}
                />
              </div>
            </Tooltip>
            <Tooltip
              title={intl.get('mallf.myOrder.view.order.orderAgain').d('再来一单')}
              placement="top"
            >
              <div
                r-if={cecFromCode !== 'MANUAL' && item.orderTypeCode !== 'PUNCHOUT'}
                style={{ float: 'left' }}
              >
                <Icon
                  type="add_shopping_cart-o"
                  style={{ fontSize: 14, lineHeight: '36px', cursor: 'pointer', marginLeft: 10 }}
                  onClick={() => onAgainOrder([{ ...item, poHeaderId: item.orderId }])}
                />
              </div>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}

export default SubOrderHeader;
