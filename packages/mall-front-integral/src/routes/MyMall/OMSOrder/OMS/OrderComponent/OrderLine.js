import React from 'react';
import { Checkbox, Icon, Badge } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Image from 'components/Image';
import Icons from 'components/Icons';
import { PermissionButton } from 'components/Permission';
import cuxComponent from 'mall-front/lib/cuxTools/cuxComponent';
import { getPrimaryColor, getUserConfigInfo, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import newImg from 'mall-front/lib/assets/images/new3.png';
import { SupplierComponent, CopyButton } from 'utils/renderer';
import SubOrderLine from './SubOrderLine';
import { getContextValue } from '../../common/Context';

export default function OrderLine({ item, index }) {
  const {
    checkBoxList,
    setState,
    list,
    checkedList,
    isOnline,
    currentStatus,
    onAgainOrder,
    onComment,
    onCancelOrder,
    canRevokeList,
    handleRevokeApprove,
  } = getContextValue();
  const {
    cecOrderCode: ecPoNum,
    orderCode: poNum,
    orderId,
    errorFlag: error,
    errorMsg,
    cecCreatedTime,
    supplierCompanyName,
    cecFromCode,
    orderEntryVOS,
  } = item;

  const { hideFieldList = [] } = getUserConfigInfo();

  const btns = [
    {
      btnText: intl.get('mallf.myOrder.view.revokeApprove').d('撤销审批'),
      icon: 'reply',
      show: canRevokeList.includes(item.batchNum) || canRevokeList.includes(item.orderCode),
      onClick: () => handleRevokeApprove(item),
    },
    {
      btnText:
        item.cancelButtonFlag === '2' && item.disableButtonPrompt
          ? item.disableButtonPrompt
          : intl.get('mallf.myOrder.view.cancelOrder').d('取消订单'),
      icons: 'cancel_order',
      show: ['1', '2'].includes(item.cancelButtonFlag),
      onClick: () => onCancelOrder(item),
      disabled: item.cancelButtonFlag === '2',
    },
    {
      btnText: intl.get('mallf.myOrder.view.order.orderAgain').d('再来一单'),
      icon: 'add_shopping_cart-o',
      show: cecFromCode !== 'MANUAL' && item.orderTypeCode !== 'PUNCHOUT',
      onClick: () =>
        onAgainOrder([{ poLineList: orderEntryVOS.map((n) => ({ poLineId: n.orderEntryId })) }]),
    },
  ];

  const handleOnCheck = (checked) => {
    const newList = JSON.parse(JSON.stringify(list));
    newList[index].orderEntryVOS.forEach((p) => {
      if (currentStatus === 'WAITING_RECEIVE') {
        newList[index].checked = checked;
        if (p.mallOrderEntryStatus === 'WAITING_RECEIVE') {
          // eslint-disable-next-line no-param-reassign
          p.checked = checked;
        }
      } else if (
        !checkedList[0] || // 空的时候
        checkedList[0].supplierCompanyName === newList[index].supplierCompanyName
      ) {
        newList[index].checked = checked;
        // eslint-disable-next-line no-param-reassign
        p.checked = checked;
      }
    });
    setState({ list: newList });
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
  const CuxMessageRender = cuxComponent({
    path: 'OMSOrder/OMS/OrderComponent/SubOrderHeader/MessageRender',
  })(MessageRender);

  return (
    <div className="order-detail">
      <div className="order-number-header">
        {item.readFlag === 0 && !error && <Image width={25} height={25} value={newImg} />}
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
                                  p.mallOrderEntryStatus === 'WAITING_RECEIVE' &&
                                  p.receiptFlag === 1
                              )
                        }
                        style={{ marginRight: 7 }}
                        checked={item.checked}
                        onClick={(e) => handleOnCheck(e.target.checked)}
                      />
                    )}
                  <div
                    className="text-overflow"
                    style={{ maxWidth: currentStatus === 'WAITING_RECEIVE' ? 80 : 105 }}
                    title={intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}
                  >
                    {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：
                  </div>
                  <div
                    className="text-overflow"
                    title={poNum}
                    style={{ color: getPrimaryColor() }}
                    onClick={() => {
                      openPage(
                        `${HmallConfig.contextPath}/sigl/oms-order-detail?orderId=${orderId}`
                      );
                    }}
                  >
                    {poNum}
                  </div>
                  <CopyButton
                    style={{ top: -3 }}
                    num={poNum}
                    label={intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}
                  />
                </li>
                <SupplierComponent>
                  <li
                    className="text-overflow"
                    style={{
                      width:
                        ecPoNum && cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL'
                          ? item.poMessageUnReadVO?.unreadFlag
                            ? 170
                            : 190
                          : item.poMessageUnReadVO?.unreadFlag
                          ? 220
                          : 430,
                    }}
                  >
                    {intl.get('mallf.common.view.supplier').d('供应商')}：
                    <p title={supplierCompanyName}>{supplierCompanyName}</p>
                  </li>
                </SupplierComponent>
                {ecPoNum && cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL' && (
                  <li>
                    {intl.get('mallf.common.view.order.ecOrderNum').d('电商订单号')}：
                    <p title={ecPoNum}>{ecPoNum || '-'}</p>
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
      <SubOrderLine index={index} item={item} onComment={(product) => onComment(product, item)} />
    </div>
  );
}
