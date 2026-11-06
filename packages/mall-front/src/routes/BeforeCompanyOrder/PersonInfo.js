import React from 'react';
import { Icon, Popover } from 'choerodon-ui';

import intl from 'utils/intl';

export default function PersonInfo(props) {
  const { product = {}, cardInfo = {} } = props;

  function handleCard() {
    return (
      <div>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          {intl.get('mallf.companyOrder.model.companyOrder.name').d('姓名')}：
          <span>{cardInfo?.name}</span>
        </p>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          {intl.get('mallf.companyOrder.model.companyOrder.phone').d('电话')}：
          <span>{cardInfo?.mobile}</span>
        </p>
        <p style={{ lineHeight: '18px', marginBottom: 5 }}>
          {intl.get('mallf.companyOrder.model.companyOrder.email').d('邮箱')}：
          <span>{cardInfo?.email}</span>
        </p>
        {(cardInfo?.attributeLongtext1 || cardInfo?.attributeLongtext2) && (
          <p>
            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 48 }}>
              {intl.get('mallf.companyOrder.view.qrcode').d('二维码')}：
            </div>
            {cardInfo?.attributeLongtext1 && (
              <div style={{ display: 'inline-block', marginRight: 15 }}>
                <img
                  style={{ width: 50, height: 50, display: 'block' }}
                  alt=""
                  src={cardInfo?.attributeLongtext1}
                />
                <p style={{ width: 50, textAlign: 'center' }}>
                  {intl.get('mallf.companyOrder.view.choukuan').d('筹款')}
                </p>
              </div>
            )}
            {cardInfo?.attributeLongtext2 && (
              <div style={{ display: 'inline-block' }}>
                <img
                  style={{ width: 50, height: 50, display: 'block' }}
                  alt=""
                  src={cardInfo?.attributeLongtext2}
                />
                <p style={{ width: 50, textAlign: 'center' }}>
                  {intl.get('mallf.companyOrder.view.wechat').d('微信')}
                </p>
              </div>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ cursor: 'pointer' }}>
      {product.businessCardFlag && (
        <Popover
          content={handleCard()}
          title={intl.get('mallf.companyOrder.model.companyOrder.businessCard').d('信息核对')}
        >
          <Icon
            type="assignment_ind-o"
            style={{
              fontSize: 14,
              marginRight: 6,
              color: '#999999',
              position: 'relative',
              top: -1,
            }}
          />
          <span>{cardInfo?.name}</span>
        </Popover>
      )}
    </div>
  );
}
