import React from 'react';
import { getCurrentLanguage, getPrimaryColor } from '@/utils/utils';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

function ReceiverPhone(props) {
  const { currentAddress, openAddress } = props;

  return (
    <div className="product-attr">
      <div className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`} r-title>
        {intl.get('mallf.productDetail.common.view.receiverPhone').d('收货人手机')}
      </div>
      <div className="p-content">
        <div style={{ display: 'flex' }}>
          <span
            style={{
              marginRight: '10px',
              maxWidth: '200px',
            }}
            className="mainAddress receiver-phone"
          >
            {currentAddress.internationalTelCode && `${currentAddress.internationalTelCode} | `}
            {currentAddress.mobile}
          </span>
          <span className="set" style={{ lineHeight: '18px' }}>
            <span
              style={{
                color: getPrimaryColor(),
                cursor: 'pointer',
                display: 'inline-block',
                fontWeight: 400,
              }}
              onClick={openAddress}
            >
              {intl.get('mallf.productDetail.model.update').d('修改')}
            </span>
          </span>
        </div>
        <div className="p-content-phone-tip">
          <Icon type="error" size={13} style={{ marginRight: 5 }} />
          <span>
            {' '}
            {intl
              .get('mallf.productDetail.common.view.receiverPhoneTip')
              .d('取自收货联系手机号，用于接收卡密，请勿填错！')}{' '}
          </span>
        </div>
      </div>
      <div />
    </div>
  );
}

export default ReceiverPhone;
