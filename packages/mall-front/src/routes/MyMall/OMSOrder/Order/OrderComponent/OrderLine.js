import React from 'react';
import { Icon, Tooltip, Checkbox } from 'choerodon-ui';

import Link from 'components/Link';
import { SupplierComponent } from 'utils/renderer';
import intl from 'utils/intl';
import { getPrimaryColor, getUserConfigInfo } from 'utils/utils';
import { fetchRead } from 'services/orderCenterService';
import HmallConfig from 'utils/api-config';
import newImg from '@/assets/images/new3.png';
import SubOrderLine from './SubOrderLine';
import { getContextValue } from '../../common/Context';

export default function OrderLine({
  item,
  orderData,
  currentStatus,
  onAgainOrder,
  onAccept,
  onComment,
  index,
}) {
  const { checkBoxList, setState, list } = getContextValue();
  const {
    ecPoNum,
    poNum,
    poHeaderId,
    errorFlag: error,
    errorMsg,
    creationDate,
    supplierCompanyName,
    poLineList,
    poMessageUnread,
  } = item;

  const { hideFieldList } = getUserConfigInfo();

  const handleOnCheck = (checked) => {
    const newList = JSON.parse(JSON.stringify(list));
    newList[index].poLineList.forEach((p) => {
      newList[index].checked = checked;
      if (p.enableMallReceiveCheck === '1') {
        // eslint-disable-next-line no-param-reassign
        p.checked = checked;
      }
    });
    setState({ list: newList });
  };

  return (
    <div className="order-detail">
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
                <li>
                  {checkBoxList.includes(currentStatus) &&
                    hideFieldList &&
                    !hideFieldList.includes('ACCEPTANCE') && (
                      <Checkbox
                        disabled={
                          currentStatus === 'WAITING_RECEIVE'
                            ? !poLineList.some((p) => p.enableMallReceiveCheck === '1')
                            : false
                        }
                        style={{ marginRight: 7 }}
                        checked={item.checked}
                        onClick={(e) => handleOnCheck(e.target.checked)}
                      />
                    )}
                  {intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}：
                  <p title={poNum} style={{ color: getPrimaryColor() }}>
                    <Link
                      onClick={() => fetchRead(poNum)}
                      to={`${HmallConfig.contextPath}/order-detail?poHeaderId=${poHeaderId}`}
                    >
                      {poNum}
                    </Link>
                  </p>
                </li>
                <SupplierComponent>
                  <li>
                    {intl.get('mallf.myOrder.view.supplier').d('供应商')}：
                    <p title={supplierCompanyName}>{supplierCompanyName}</p>
                  </li>
                </SupplierComponent>
                {ecPoNum && (
                  <li>
                    {intl.get('mallf.myOrder.view.order.ecOrderNum').d('电商订单号')}：
                    <p title={ecPoNum}>{ecPoNum || '-'}</p>
                  </li>
                )}
                {!!poMessageUnread?.unreadFlag && (
                  <Tooltip
                    placement="bottom"
                    title={intl
                      .get('mallf.myOrder.view.unreadFlag')
                      .d('您有未读供应商留言，请点击单号至详情页查看')}
                  >
                    <Icon className="unread-icon" type="message2" />
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </ul>
        {!error && !poLineList[0]?.qtHeaderNo && (
          <>
            <div className="order-centent-header-time">{creationDate}</div>
            <div className="order-centent-header-detail">
              <Tooltip
                title={intl.get('mallf.myOrder.view.order.orderAgain').d('再来一单')}
                placement="top"
              >
                <div className="cart-again">
                  <Icon
                    type="add_shopping_cart-o"
                    style={{ fontSize: 12 }}
                    onClick={() => onAgainOrder([{ poHeaderId: item.poHeaderId }])}
                  />
                </div>
              </Tooltip>
            </div>
          </>
        )}
      </div>
      <SubOrderLine
        index={index}
        item={item}
        orderData={orderData}
        setState={setState}
        currentStatus={currentStatus}
        onAccept={onAccept}
        onComment={(product) => onComment(product, item)}
      />
    </div>
  );
}
