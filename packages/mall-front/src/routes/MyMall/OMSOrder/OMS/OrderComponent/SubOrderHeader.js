import React from 'react';

import { Checkbox, Icon, Badge } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
// import { getOpenCartFlag } from 'utils/configUtils';
import { SupplierComponent, CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import { PermissionButton } from 'components/Permission';
import { againOrder, cancelOrder } from 'components/Permission/permissionCode';
import { getPrimaryColor, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import cuxComponent from 'cuxTools/cuxComponent';
import newImg from '@/assets/images/new3.png';
import { getEcServiceLink } from 'services/orderCenterService';
import CuxFn from 'cuxTools/cuxFn';
import openPrint from '../../common/Print';
import OrderCheck from './OrderCheck';
import { getContextValue } from '../../common/Context';

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
  const { canRevokeList, handleRevokeApprove } = getContextValue();
  // icons,icon只能有一个
  const oldBtns = [
    {
      btnText: intl.get('mallf.orderDetail.view.contact.ec').d('联系电商'),
      icons: 'support_agent_black_24dp',
      show: item.onlineConsultationFlag,
      onClick: () => handleEcServiceLink(item),
    },
    {
      btnText: intl.get('mallf.myOrder.view.revokeApprove').d('撤销审批'),
      icon: 'reply',
      show: canRevokeList.includes(item.batchNum) || canRevokeList.includes(item.orderCode),
      onClick: () => handleRevokeApprove(item),
    },
    {
      btnText: intl.get('mallf.myOrder.botton.print').d('打印'),
      icon: 'print-o',
      show: item.print,
      onClick: () => openPrint(item),
    },
    {
      btnText:
        item.cancelButtonFlag === '2' && item.disableButtonPrompt
          ? item.disableButtonPrompt
          : intl.get('mallf.myOrder.view.cancelOrder').d('取消订单'),
      icons: 'cancel_order',
      show: ['1', '2'].includes(item.cancelButtonFlag) && cecFromCode !== 'JD-V-ECRD',
      onClick: () => onCancelOrder(item),
      disabled: item.cancelButtonFlag === '2',
      permissionList: [cancelOrder],
    },
    {
      btnText: intl.get('mallf.myOrder.view.order.orderAgain').d('再来一单'),
      icon: 'add_shopping_cart-o',
      show:
        cecFromCode !== 'MANUAL' &&
        item.orderTypeCode !== 'PUNCHOUT' &&
        item.anotherOrderFlag === 1,
      onClick: () => onAgainOrder([{ ...item, poHeaderId: item.orderId }]),
      permissionList: [againOrder],
    },
  ];

  const btns = CuxFn({
    name: 'OrderSubOrderHeader-fn-getBtns',
    value: { btns: oldBtns, item },
  })(() => oldBtns)();

  const handleEcServiceLink = async (order) => {
    const params = {
      platformType: 'PC',
      purchaseCompanyId: order?.purchaseCompanyId,
      orderSourceFrom: order?.cecFromCode,
      cecOrderCode: order?.cecOrderCode,
    };
    const res = await getEcServiceLink(params);
    if (res) {
      window.open(res.url);
    }
  };

  const MessageRender = () => {
    return (
      !!item.poMessageUnReadVO?.unreadFlag && (
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
      )
    );
  };
  // 供应商留言二开
  const CuxMessageRender = cuxComponent({
    path: 'OMSOrder/OMS/OrderComponent/SubOrderHeader/MessageRender',
  })(MessageRender);
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
                  style={{ color: getPrimaryColor(), cursor: 'pointer' }}
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
                        : 400,
                  }}
                >
                  {intl.get('mallf.myOrder.view.supplier').d('供应商')}：
                  <p className="text-overflow" title={supplierCompanyName}>
                    {supplierCompanyName}
                  </p>
                </li>
              </SupplierComponent>
              {ecPoNum && cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL' && (
                <li className="ecNum-item text-overflow">
                  {intl.get('mallf.myOrder.view.order.ecOrderNum').d('电商订单号')}：
                  <p className="text-overflow" title={ecPoNum}>
                    {ecPoNum || '-'}
                  </p>
                </li>
              )}
              {/* 供应商留言 */}
              <CuxMessageRender item={item} />
            </div>
          </>
        )}
      </ul>
      {!error && (
        <>
          <div className="order-centent-header-time">{cecCreatedTime}</div>
          <div className="order-centent-header-detail">
            {btns.map((m) => (
              <Tooltip title={m.btnText} placement="top">
                <PermissionButton
                  type="c7n-pro"
                  icon={m.icon}
                  onClick={m.onClick}
                  disabled={!!m.disabled}
                  funcType="flat"
                  color="primary"
                  size="small"
                  className="right-btn"
                  r-if={'show' in m ? m.show : true}
                  permissionList={m.permissionList}
                >
                  {m.icons && (
                    <Icons
                      type={m.icons}
                      style={{
                        fontWeight: 400,
                      }}
                    />
                  )}
                </PermissionButton>
              </Tooltip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default cuxComponent({ path: 'OMSOrder/OMS/SubOrderHeader' })(SubOrderHeader);
