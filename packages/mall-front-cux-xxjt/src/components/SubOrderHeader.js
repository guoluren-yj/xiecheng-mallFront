import React from 'react';

import { Checkbox, Icon, Badge } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { SupplierComponent, CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import { PermissionButton } from 'components/Permission';
import { againOrder, cancelOrder } from 'components/Permission/permissionCode';
import { getPrimaryColor, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import newImg from 'mall-front/lib/assets/images/new3.png';
import openPrint from 'mall-front/lib/routes/MyMall/OMSOrder/common/Print';
import OrderCheck from 'mall-front/lib/routes/MyMall/OMSOrder/OMS/OrderComponent/OrderCheck';
import { getContextValue } from 'mall-front/lib/routes/MyMall/OMSOrder/common/Context';
import { onDownloadOrder } from './Receipt';

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
  const btns = [
    {
      btnText: intl.get('mallf.myOrder.view.revokeApprove').d('撤销审批'),
      icon: 'reply',
      show: canRevokeList?.includes(item.batchNum) || canRevokeList?.includes(item.orderCode),
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
      btnText: '下载签收单',
      icon: 'get_app',
      show:
        item?.orderEntryVOS
          ?.filter((p) => p?.freightFlag !== 1)
          .some((o) => o?.mallOrderEntryStatus === 'FINISH') &&
        ['JD-V-ECRD', 'JD', 'JD-IOP', 'ZKH'].includes(cecFromCode),
      onClick: () => onDownloadOrder(item),
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
                {checkBoxList?.includes(currentStatus) &&
                  !(currentStatus === 'WAITING_PAY' && !isOnline) &&
                  hideFieldList &&
                  !hideFieldList?.includes('ACCEPTANCE') && (
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

export default SubOrderHeader;
